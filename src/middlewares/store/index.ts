import { defineStore } from 'pinia';
import {
  getUserData, getUsers, updateUser, deleteUser,
  getAdminCharacters, createAdminCharacter, updateAdminCharacter, deleteAdminCharacter, unclaimAdminCharacter, removeCharacterClan,
  getClans, createClan, updateClan, deleteClan,
  getCharacterClaims, reviewCharacterClaim,
  getCharacterCreationRequests, reviewCharacterCreationRequest,
  getPendingUserActivations, reviewUserActivation,
  getClanCreationRequests, reviewClanCreationRequest,
  getClanClaimRequests, reviewClanClaimRequest,
  getAdminUnclaimedClanRequests,
} from '../services';
import { claimCharacterAsAdmin, unclaimCharacterAsAdmin } from '../services/admin/characters';
import { connectSocket } from '../socket';
import { WEB_URL } from '../misc/const';
import { logout } from '../services';

export const useStore = defineStore('store', {
  state: () => ({
    currentUser: {
      logged: false,
      userData: null as any,
    },
    unauthorized: false,
    admin: {
      users:        null as any,
      characters:   null as any,
      clans:        null as any,
      notifications: null as any,
    },
    pendingClaimsCount: 0,
    pendingCreationsCount: 0,
    pendingUsersCount: 0,
    pendingClanRequestsCount: 0,
    pendingClanCreationsCount: 0,
    pendingClanClaimsCount: 0,
    lastIncomingRequest: null as any,
  }),

  getters: {
    pendingRequestsTotal(state) {
      return state.pendingClaimsCount + state.pendingCreationsCount + state.pendingUsersCount + state.pendingClanCreationsCount + state.pendingClanClaimsCount + state.pendingClanRequestsCount;
    },
  },

  actions: {
    async handleUserData() {
      try {
        const data = await getUserData();
        this.currentUser = { ...this.currentUser, ...data };
        const role = this.currentUser.userData?.role;
        const isAdmin = role === 'admin' || role === 'super_admin';
        if (!isAdmin) {
          this.unauthorized = true;
        }
      } catch (error: any) {
        if (error?.response?.status === 401 || !error?.response) {
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
      socket.on('admin:request:new', (payload: any) => {
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
      socket.on('clan-request:cancelled', (payload: any) => {
        if (this.pendingClanRequestsCount > 0) this.pendingClanRequestsCount--;
        // Signal the requests page to remove the item
        this.lastIncomingRequest = { ...payload, type: 'clan-request-cancelled', _ts: Date.now() };
      });
      socket.on('admin:user:registered', () => {
        if (this.admin.users !== null) this.handleGetUsers();
      });
      socket.on('admin:user:deleted', (payload: any) => {
        if (this.admin.users !== null) {
          this.admin.users = (this.admin.users as any[]).filter((u: any) => String(u._id) !== String(payload.id));
        }
      });
    },

    async handleGetUsers() {
      this.admin.users = await getUsers();
    },

    async handleUpdateUser(formData: any, id: string) {
      await updateUser(id, formData);
    },

    async handleDeleteUser(id: string) {
      await deleteUser(id);
    },

    async handleGetAdminCharacters() {
      this.admin.characters = await getAdminCharacters();
    },

    async handleCreateAdminCharacter(formData: any) {
      return await createAdminCharacter(formData);
    },

    async handleUpdateAdminCharacter(formData: any) {
      const response = await updateAdminCharacter(formData);
      this.admin.characters = response.characters;
    },

    async handleDeleteMember(id: string) {
      await deleteAdminCharacter(id);
    },

    async handleUnclaimCharacter(id: string) {
      await unclaimAdminCharacter(id);
      this.admin.characters = await getAdminCharacters();
    },

    async handleRemoveCharacterClan(id: string) {
      await removeCharacterClan(id);
      this.admin.characters = await getAdminCharacters();
    },

    async handleClaimCharacterAsAdmin(formData: any) {
      const response = await claimCharacterAsAdmin(formData);
      this.admin.users = response.users;
      this.admin.characters = response.characters;
    },

    async handleUnclaimCharacterAsAdmin(formData: any) {
      const response = await unclaimCharacterAsAdmin(formData);
      this.admin.users = response.users;
      this.admin.characters = response.characters;
    },

    async handleGetClans() {
      this.admin.clans = await getClans();
    },

    async handleCreateClan(formData: any) {
      const response = await createClan(formData);
      this.admin.clans = response;
      return response;
    },

    async handleUpdateClan(formData: any) {
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

    async handleReviewCharacterClaim(id: string, action: 'accept' | 'reject') {
      return await reviewCharacterClaim(id, action);
    },

    // --- Character creation requests ---
    async handleGetCharacterCreationRequests() {
      return await getCharacterCreationRequests();
    },

    async handleReviewCharacterCreationRequest(id: string, action: 'accept' | 'reject') {
      return await reviewCharacterCreationRequest(id, action);
    },

    // --- Unclaimed clan join requests ---
    async handleGetAdminUnclaimedClanRequests() {
      return await getAdminUnclaimedClanRequests();
    },

    // --- Clan claim requests ---
    async handleGetClanClaimRequests() {
      return await getClanClaimRequests();
    },
    async handleReviewClanClaimRequest(id: string, action: 'accept' | 'reject') {
      return await reviewClanClaimRequest(id, action);
    },

    // --- Clan creation requests ---
    async handleGetClanCreationRequests() {
      return await getClanCreationRequests();
    },

    async handleReviewClanCreationRequest(id: string, action: 'accept' | 'reject') {
      return await reviewClanCreationRequest(id, action);
    },

    // --- User activations ---
    async handleGetPendingUserActivations() {
      return await getPendingUserActivations();
    },

    async handleReviewUserActivation(id: string, action: 'activate' | 'reject') {
      return await reviewUserActivation(id, action);
    },

    async handleFetchPendingCounts() {
      try {
        const [claims, creations, users] = await Promise.all([
          getCharacterClaims().catch(() => []),
          getCharacterCreationRequests().catch(() => []),
          getPendingUserActivations().catch(() => []),
        ]);
        this.pendingClaimsCount = (claims as any[]).filter((r: any) => r.status === 'pending').length;
        this.pendingCreationsCount = (creations as any[]).length;
        this.pendingUsersCount = (users as any[]).length;
        // clanReqs from /clan-request/manage requires characterId — use admin endpoint instead
        const unclaimedJoins = await getAdminUnclaimedClanRequests().catch(() => []);
        this.pendingClanRequestsCount = (unclaimedJoins as any[]).length;
        const clanCreations = await getClanCreationRequests().catch(() => []);
        this.pendingClanCreationsCount = (clanCreations as any[]).length;
        const clanClaims = await getClanClaimRequests().catch(() => []);
        this.pendingClanClaimsCount = (clanClaims as any[]).length;
      } catch {
        // silently ignore
      }
    },
  },
});

export type AppStore = ReturnType<typeof useStore>;
