import axios from 'axios';
import { API_URL } from '../misc/const';
import { error } from '../misc/errors';

export const getUserData: any = async () => {
  const response: any = await axios.get(API_URL + '/auth', { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const getUsers: any = async () => {
  const response: any = await axios.get(API_URL + '/admin/users', { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const updateUser: any = async (id: string, formData: any) => {
  await axios.patch(API_URL + '/admin/users/' + id, formData, { withCredentials: true });
};

export const deleteUser: any = async (id: string) => {
  await axios.delete(API_URL + '/admin/users/' + id, { withCredentials: true });
};

export const getAdminCharacters: any = async () => {
  const response: any = await axios.get(API_URL + '/admin/characters', { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const createAdminCharacter: any = async (formData: any) => {
  const response: any = await axios.post(API_URL + '/admin/characters', formData, { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const updateAdminCharacter: any = async (formData: any) => {
  const response: any = await axios.patch(API_URL + '/admin/characters', formData, { withCredentials: true });
  return response.data;
};

export const deleteAdminCharacter: any = async (id: string) => {
  await axios.delete(API_URL + '/admin/characters/' + id, { withCredentials: true });
};

export const unclaimAdminCharacter: any = async (id: string) => {
  const response: any = await axios.patch(API_URL + '/admin/characters/' + id + '/unclaim', {}, { withCredentials: true })
    .then(r => r.data);
  return response;
};

export const removeCharacterClan: any = async (id: string) => {
  const response: any = await axios.patch(API_URL + '/admin/characters/' + id + '/remove-clan', {}, { withCredentials: true })
    .then(r => r.data);
  return response;
};

export const updateUserData: any = async (formData: any, id: any) => {
  const response: any = await axios.patch(API_URL + '/account/update/' + id, formData, { withCredentials: true })
    .then(response => response.data)
    .catch(() => ({ error: error.api.loadItemById }));
  return response;
};

export const getAdminNotifications: any = async () => {
  const response: any = await axios.get(API_URL + '/admin/notifications', { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const getClanRequestsManagement: any = async () => {
  const response: any = await axios.get(API_URL + '/clan-request/manage', { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const reviewClanRequest: any = async (id: string, action: 'accept' | 'reject') => {
  const response: any = await axios.patch(API_URL + '/admin/clan-requests/' + id, { action }, { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const removeClanMember: any = async (clanId: string, characterId: string) => {
  const response: any = await axios.delete(API_URL + '/clan-management/clan/' + clanId + '/members/' + characterId, { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const updateClanMember: any = async (clanId: string, characterId: string, data: any) => {
  const response: any = await axios.patch(API_URL + '/clan-management/clan/' + clanId + '/members/' + characterId, data, { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const updateMemberRole: any = async (clanId: string, characterId: string, role: 'officer' | 'member') => {
  const response: any = await axios.patch(API_URL + '/clan-management/clan/' + clanId + '/members/' + characterId + '/role', { role }, { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const cancelClanInvitation: any = async (clanId: string, invitationId: string) => {
  await axios.delete(API_URL + '/clan-management/clan/' + clanId + '/invitations/' + invitationId, { withCredentials: true });
};

export const logout: any = async () => {
  await axios.get(API_URL + '/logout/', { withCredentials: true, maxRedirects: 0 }).catch(() => {});
};

export { getClans, createClan, updateClan, deleteClan } from './clanService';

export const getCharacterClaims: any = async () => {
  const response: any = await axios.get(API_URL + '/admin/character-claims', { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const reviewCharacterClaim: any = async (id: string, action: 'accept' | 'reject') => {
  const response: any = await axios.patch(API_URL + '/admin/character-claims/' + id, { action }, { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const getCharacterCreationRequests: any = async () => {
  const response: any = await axios.get(API_URL + '/admin/character-creation-requests', { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const reviewCharacterCreationRequest: any = async (id: string, action: 'accept' | 'reject') => {
  const response: any = await axios.patch(API_URL + '/admin/character-creation-requests/' + id, { action }, { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const getPendingUserActivations: any = async () => {
  const response: any = await axios.get(API_URL + '/admin/user-activations', { withCredentials: true })
    .then(response => response.data);
  return response;
};

export const reviewUserActivation: any = async (id: string, action: 'activate' | 'reject') => {
  const response: any = await axios.patch(API_URL + '/admin/user-activations/' + id, { action }, { withCredentials: true })
    .then(response => response.data);
  return response;
};

export { getCharacterByName } from './characterService';

export const getOverviewStats: any = async () => {
  const response: any = await axios.get(API_URL + '/admin/overview', { withCredentials: true })
    .then(r => r.data);
  return response;
};

export const getGrowthStats: any = async (range: string = '30') => {
  const response: any = await axios.get(API_URL + '/admin/overview/growth?range=' + range, { withCredentials: true })
    .then(r => r.data);
  return response;
};
