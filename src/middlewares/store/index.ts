import { defineStore } from 'pinia';
import {
  getUserData, getUsers, updateUser, deleteUser,
  getAdminCharacters, createAdminCharacter, updateAdminCharacter, deleteAdminCharacter,
  getClans, createClan, updateClan, deleteClan,
  getClanRequestsManagement, reviewClanRequest,
  getAdminNotifications,
} from '../services';
import { claimCharacterAsAdmin, unclaimCharacterAsAdmin } from '../services/admin/characters';
import { CLIENT_URL } from '../misc/const';
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
    pendingRequestsCount: 0,
  }),

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
          window.location.href = CLIENT_URL + '/login';
        }
      }
    },

    async handleLogout() {
      await logout();
      window.location.href = CLIENT_URL + '/login';
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

    async handleGetAdminNotifications() {
      this.admin.notifications = await getAdminNotifications();
    },

    async handleGetClanRequestsManagement() {
      return await getClanRequestsManagement();
    },

    async handleReviewClanRequest(id: string, action: 'accept' | 'reject') {
      return await reviewClanRequest(id, action);
    },

    async handleFetchPendingRequests() {
      try {
        const requests = await getClanRequestsManagement() ?? [];
        this.pendingRequestsCount = (requests as any[]).filter((r: any) => r.status === 'pending').length;
      } catch {
        // silently ignore
      }
    },
  },
});

export type AppStore = ReturnType<typeof useStore>;
