import { defineStore } from 'pinia';
import {
  getUserData, updateUser, deleteUser,
  createAdminCharacter, updateAdminCharacter, deleteAdminCharacter, unclaimAdminCharacter, removeCharacterClan,
  getClans, createClan, updateClan, deleteClan,
  getCharacterClaims, reviewCharacterClaim,
  getCharacterCreationRequests, reviewCharacterCreationRequest,
  getPendingUserActivations, reviewUserActivation,
  getClanCreationRequests, reviewClanCreationRequest,
  getClanClaimRequests, reviewClanClaimRequest,
  getAdminUnclaimedClanRequests, reviewClanRequest,
  getAdminNotifications,
} from '../services';
import { claimCharacterAsAdmin, unclaimCharacterAsAdmin } from '../services/admin/characters';
import { connectSocket } from '../socket';
import { WEB_URL } from '../misc/const';
import { logout } from '../services';
import type {
  ActivationAction, AdminNotifications, AdminRequestPayload, AuthUserData, CharacterCreatePayload,
  CharacterLinkPayload, CharacterUpdatePayload, Clan, ClanCreatePayload, ClanUpdatePayload,
  IncomingRequestSignal, Paginated, ReviewAction, UserUpdatePayload,
} from '../../interfaces';

/** Contadores de solicitudes pendientes que suma el badge de la navegación. */
type PendingCountKey =
  | 'pendingClaimsCount'
  | 'pendingCreationsCount'
  | 'pendingUsersCount'
  | 'pendingClanRequestsCount'
  | 'pendingClanCreationsCount'
  | 'pendingClanClaimsCount';

interface StoreState {
  currentUser: {
    logged: boolean;
    userData: AuthUserData | null;
  };
  unauthorized: boolean;
  admin: {
    clans: Paginated<Clan> | Clan[] | null;
    notifications: AdminNotifications | null;
  };
  pendingClaimsCount: number;
  pendingCreationsCount: number;
  pendingUsersCount: number;
  pendingClanRequestsCount: number;
  pendingClanCreationsCount: number;
  pendingClanClaimsCount: number;
  lastIncomingRequest: IncomingRequestSignal | null;
}

// Promesa compartida de la carga inicial de /auth (la usan el guard del router y App.vue).
let userDataPromise: Promise<void> | null = null;

// Retardo para agrupar varias resincronizaciones de contadores en una sola ronda de peticiones.
const PENDING_COUNTS_RESYNC_MS = 400;
let pendingCountsTimer: ReturnType<typeof setTimeout> | null = null;

export const useStore = defineStore('store', {
  state: (): StoreState => ({
    currentUser: {
      logged: false,
      userData: null,
    },
    unauthorized: false,
    admin: {
      clans:         null,
      notifications: null,
    },
    pendingClaimsCount: 0,
    pendingCreationsCount: 0,
    pendingUsersCount: 0,
    pendingClanRequestsCount: 0,
    pendingClanCreationsCount: 0,
    pendingClanClaimsCount: 0,
    lastIncomingRequest: null,
  }),

  getters: {
    pendingRequestsTotal(state): number {
      return state.pendingClaimsCount + state.pendingCreationsCount + state.pendingUsersCount + state.pendingClanCreationsCount + state.pendingClanClaimsCount + state.pendingClanRequestsCount;
    },
  },

  actions: {
    ensureUserData(): Promise<void> {
      if (!userDataPromise) userDataPromise = this.handleUserData();
      return userDataPromise;
    },

    async handleUserData() {
      try {
        const data = await getUserData();
        this.currentUser = { ...this.currentUser, ...data };
        const role = this.currentUser.userData?.role;
        const isAdmin = role === 'admin' || role === 'super_admin';
        if (!isAdmin) {
          this.unauthorized = true;
        }
      } catch (error: unknown) {
        const response = (error as { response?: { status?: number } } | null)?.response;
        if (response?.status === 401 || !response) {
          window.location.href = WEB_URL + '/login';
        } else {
          this.unauthorized = true;
        }
      }
    },

    async handleLogout() {
      await logout();
      window.location.href = WEB_URL + '/login';
    },

    initSocket() {
      const socket = connectSocket();
      socket.on('admin:request:new', (payload: AdminRequestPayload) => {
        if      (payload.type === 'character-claim')    this.pendingClaimsCount++;
        else if (payload.type === 'character-creation') this.pendingCreationsCount++;
        else if (payload.type === 'user-activation')    this.pendingUsersCount++;
        else if (payload.type === 'clan-creation')      this.pendingClanCreationsCount++;
        else if (payload.type === 'clan-claim')         this.pendingClanClaimsCount++;
        else if (payload.type === 'clan-join-unclaimed') this.pendingClanRequestsCount++;
        this.lastIncomingRequest = { ...payload, _ts: Date.now() };
      });
      socket.on('clan-request:new-dashboard', () => {
        this.pendingClanRequestsCount++;
      });
      socket.on('clan-request:cancelled', (payload: { id: string }) => {
        if (this.pendingClanRequestsCount > 0) this.pendingClanRequestsCount--;
        // Avisa a la página de solicitudes para que quite el elemento
        this.lastIncomingRequest = { ...payload, type: 'clan-request-cancelled', _ts: Date.now() };
        this.schedulePendingCountsResync();
      });
      // Cualquier otro evento admin:request:* (p. ej. una revisión hecha por otro admin)
      // invalida los contadores locales: se resincronizan con la API.
      socket.onAny((event: string) => {
        if (event.startsWith('admin:request:') && event !== 'admin:request:new') {
          this.schedulePendingCountsResync();
        }
      });
      // Tras una reconexión pudieron perderse eventos: se vuelven a pedir los contadores.
      socket.io.on('reconnect', () => this.schedulePendingCountsResync());
    },

    async handleUpdateUser(formData: UserUpdatePayload, id: string) {
      await updateUser(id, formData);
    },

    async handleDeleteUser(id: string) {
      await deleteUser(id);
    },

    async handleCreateAdminCharacter(formData: CharacterCreatePayload) {
      return await createAdminCharacter(formData);
    },

    async handleUpdateAdminCharacter(formData: CharacterUpdatePayload) {
      return await updateAdminCharacter(formData);
    },

    async handleDeleteMember(id: string) {
      await deleteAdminCharacter(id);
    },

    async handleUnclaimCharacter(id: string) {
      await unclaimAdminCharacter(id);
    },

    async handleRemoveCharacterClan(id: string) {
      await removeCharacterClan(id);
    },

    async handleClaimCharacterAsAdmin(formData: CharacterLinkPayload) {
      return await claimCharacterAsAdmin(formData);
    },

    async handleUnclaimCharacterAsAdmin(formData: CharacterLinkPayload) {
      return await unclaimCharacterAsAdmin(formData);
    },

    async handleGetClans() {
      this.admin.clans = await getClans();
    },

    async handleCreateClan(formData: ClanCreatePayload) {
      const response = await createClan(formData);
      this.admin.clans = response;
      return response;
    },

    async handleUpdateClan(formData: ClanUpdatePayload) {
      const response = await updateClan(formData);
      this.admin.clans = response;
    },

    async handleDeleteClan(id: string) {
      const response = await deleteClan(id);
      this.admin.clans = response;
      return response;
    },

    // --- Character claims ---
    async handleGetCharacterClaims() {
      return await getCharacterClaims();
    },

    async handleReviewCharacterClaim(id: string, action: ReviewAction) {
      const res = await reviewCharacterClaim(id, action);
      this.markRequestReviewed('pendingClaimsCount');
      return res;
    },

    // --- Character creation requests ---
    async handleGetCharacterCreationRequests() {
      return await getCharacterCreationRequests();
    },

    async handleReviewCharacterCreationRequest(id: string, action: ReviewAction) {
      const res = await reviewCharacterCreationRequest(id, action);
      this.markRequestReviewed('pendingCreationsCount');
      return res;
    },

    // --- Unclaimed clan join requests ---
    async handleGetAdminUnclaimedClanRequests() {
      return await getAdminUnclaimedClanRequests();
    },

    async handleReviewClanRequest(id: string, action: ReviewAction) {
      const res = await reviewClanRequest(id, action);
      this.markRequestReviewed('pendingClanRequestsCount');
      return res;
    },

    // --- Clan claim requests ---
    async handleGetClanClaimRequests() {
      return await getClanClaimRequests();
    },

    async handleReviewClanClaimRequest(id: string, action: ReviewAction) {
      const res = await reviewClanClaimRequest(id, action);
      this.markRequestReviewed('pendingClanClaimsCount');
      return res;
    },

    // --- Clan creation requests ---
    async handleGetClanCreationRequests() {
      return await getClanCreationRequests();
    },

    async handleReviewClanCreationRequest(id: string, action: ReviewAction) {
      const res = await reviewClanCreationRequest(id, action);
      this.markRequestReviewed('pendingClanCreationsCount');
      return res;
    },

    // --- User activations ---
    async handleGetPendingUserActivations() {
      return await getPendingUserActivations();
    },

    async handleReviewUserActivation(id: string, action: ActivationAction) {
      const res = await reviewUserActivation(id, action);
      this.markRequestReviewed('pendingUsersCount');
      return res;
    },

    async handleGetAdminNotifications() {
      this.admin.notifications = await getAdminNotifications();
    },

    // --- Contadores de solicitudes pendientes ---

    /** Descuenta una solicitud revisada (feedback inmediato) y resincroniza con la API. */
    markRequestReviewed(key: PendingCountKey) {
      if (this[key] > 0) this[key]--;
      this.schedulePendingCountsResync();
    },

    /** Agrupa resincronizaciones cercanas en una sola llamada a handleFetchPendingCounts. */
    schedulePendingCountsResync() {
      if (pendingCountsTimer) clearTimeout(pendingCountsTimer);
      pendingCountsTimer = setTimeout(() => {
        pendingCountsTimer = null;
        this.handleFetchPendingCounts();
      }, PENDING_COUNTS_RESYNC_MS);
    },

    async handleFetchPendingCounts() {
      try {
        // Todas las colas en paralelo. Los endpoints admin devuelven solo pendientes,
        // salvo character-claims que trae el historial completo → se filtra.
        const [claims, creations, users, unclaimedJoins, clanCreations, clanClaims] = await Promise.all([
          getCharacterClaims().catch(() => []),
          getCharacterCreationRequests().catch(() => []),
          getPendingUserActivations().catch(() => []),
          getAdminUnclaimedClanRequests().catch(() => []),
          getClanCreationRequests().catch(() => []),
          getClanClaimRequests().catch(() => []),
        ]);
        this.pendingClaimsCount        = claims.filter(r => r.status === 'pending').length;
        this.pendingCreationsCount     = creations.length;
        this.pendingUsersCount         = users.length;
        this.pendingClanRequestsCount  = unclaimedJoins.length;
        this.pendingClanCreationsCount = clanCreations.length;
        this.pendingClanClaimsCount    = clanClaims.length;
      } catch {
        // silently ignore
      }
    },
  },
});

export type AppStore = ReturnType<typeof useStore>;
