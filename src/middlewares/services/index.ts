import axios from 'axios';
import { API_URL } from '../misc/const';
import type {
  ActivationAction, AdminNotifications, AuthResponse, Character, CharacterClaim, CharacterCreatePayload,
  CharacterCreationRequest, CharacterResponse, ClanClaimRequest, ClanCreationRequest, ClanJoinRequest,
  ChartSeries, GrowthRange, MessageResponse, OverviewStats, PageParams, Paginated, PendingUser,
  CharacterUpdatePayload, ReviewAction, User, UserUpdatePayload,
} from '../../interfaces';

const withCredentials = { withCredentials: true };

// ── Auth ──────────────────────────────────────────────────────────────────────

export const getUserData = async (): Promise<AuthResponse> => {
  return axios.get<AuthResponse>(API_URL + '/auth', withCredentials).then(r => r.data);
};

export const logout = async (): Promise<void> => {
  await axios.get(API_URL + '/auth/logout', { ...withCredentials, maxRedirects: 0 }).catch(() => {});
};

// ── Usuarios ──────────────────────────────────────────────────────────────────

/** Primera página de usuarios (la API siempre pagina, por defecto 20 resultados). */
export const getUsers = async (): Promise<Paginated<User>> => {
  return axios.get<Paginated<User>>(API_URL + '/admin/users', withCredentials).then(r => r.data);
};

export const getUsersPage = async (params: PageParams): Promise<Paginated<User>> => {
  return axios.get<Paginated<User>>(API_URL + '/admin/users', { params, ...withCredentials }).then(r => r.data);
};

export const updateUser = async (id: string, formData: UserUpdatePayload): Promise<void> => {
  await axios.patch(API_URL + '/admin/users/' + id, formData, withCredentials);
};

export const deleteUser = async (id: string): Promise<void> => {
  await axios.delete(API_URL + '/admin/users/' + id, withCredentials);
};

// ── Personajes ────────────────────────────────────────────────────────────────

export const getAdminCharactersPage = async (params: PageParams): Promise<Paginated<Character>> => {
  return axios.get<Paginated<Character>>(API_URL + '/admin/characters', { params, ...withCredentials }).then(r => r.data);
};

export const getAdminCharactersByIds = async (ids: string[]): Promise<Character[]> => {
  if (!ids.length) return [];
  const response = await axios.get<Paginated<Character>>(API_URL + '/admin/characters', { params: { ids: ids.join(',') }, ...withCredentials })
    .then(r => r.data);
  return response.data ?? [];
};

export const createAdminCharacter = async (formData: CharacterCreatePayload): Promise<CharacterResponse> => {
  return axios.post<CharacterResponse>(API_URL + '/admin/characters', formData, withCredentials).then(r => r.data);
};

export const updateAdminCharacter = async (formData: CharacterUpdatePayload): Promise<CharacterResponse> => {
  return axios.patch<CharacterResponse>(API_URL + '/admin/characters', formData, withCredentials).then(r => r.data);
};

export const deleteAdminCharacter = async (id: string): Promise<void> => {
  await axios.delete(API_URL + '/admin/characters/' + id, withCredentials);
};

export const unclaimAdminCharacter = async (id: string): Promise<CharacterResponse> => {
  return axios.patch<CharacterResponse>(API_URL + '/admin/characters/' + id + '/unclaim', {}, withCredentials).then(r => r.data);
};

export const removeCharacterClan = async (id: string): Promise<CharacterResponse> => {
  return axios.patch<CharacterResponse>(API_URL + '/admin/characters/' + id + '/remove-clan', {}, withCredentials).then(r => r.data);
};

// ── Notificaciones ────────────────────────────────────────────────────────────

export const getAdminNotifications = async (): Promise<AdminNotifications> => {
  return axios.get<AdminNotifications>(API_URL + '/admin/notifications', withCredentials).then(r => r.data);
};

// ── Clanes ────────────────────────────────────────────────────────────────────

export { getClans, getClansPage, createClan, updateClan, deleteClan, getClanById, assignClanLeader, removeClanLeader, syncClanFromFile, searchCharacters, getClanDetailMembersPage, updateClanMemberRole } from './clanService';

// ── Solicitudes ───────────────────────────────────────────────────────────────

export const reviewClanRequest = async (id: string, action: ReviewAction): Promise<MessageResponse> => {
  return axios.patch<MessageResponse>(API_URL + '/admin/clan-requests/' + id, { action }, withCredentials).then(r => r.data);
};

export const getAdminUnclaimedClanRequests = async (): Promise<ClanJoinRequest[]> => {
  return axios.get<ClanJoinRequest[]>(API_URL + '/admin/clan-requests?unclaimedOnly=true', withCredentials).then(r => r.data);
};

export const getCharacterClaims = async (): Promise<CharacterClaim[]> => {
  return axios.get<CharacterClaim[]>(API_URL + '/admin/character-claims', withCredentials).then(r => r.data);
};

export const reviewCharacterClaim = async (id: string, action: ReviewAction): Promise<MessageResponse> => {
  return axios.patch<MessageResponse>(API_URL + '/admin/character-claims/' + id, { action }, withCredentials).then(r => r.data);
};

export const getCharacterCreationRequests = async (): Promise<CharacterCreationRequest[]> => {
  return axios.get<CharacterCreationRequest[]>(API_URL + '/admin/character-creation-requests', withCredentials).then(r => r.data);
};

export const reviewCharacterCreationRequest = async (id: string, action: ReviewAction): Promise<MessageResponse> => {
  return axios.patch<MessageResponse>(API_URL + '/admin/character-creation-requests/' + id, { action }, withCredentials).then(r => r.data);
};

export const getPendingUserActivations = async (): Promise<PendingUser[]> => {
  return axios.get<PendingUser[]>(API_URL + '/admin/user-activations', withCredentials).then(r => r.data);
};

export const reviewUserActivation = async (id: string, action: ActivationAction): Promise<MessageResponse> => {
  return axios.patch<MessageResponse>(API_URL + '/admin/user-activations/' + id, { action }, withCredentials).then(r => r.data);
};

export const getClanClaimRequests = async (): Promise<ClanClaimRequest[]> => {
  return axios.get<ClanClaimRequest[]>(API_URL + '/admin/clan-claim-requests', withCredentials).then(r => r.data);
};

export const reviewClanClaimRequest = async (id: string, action: ReviewAction): Promise<MessageResponse> => {
  return axios.patch<MessageResponse>(API_URL + '/admin/clan-claim-requests/' + id, { action }, withCredentials).then(r => r.data);
};

export const getClanCreationRequests = async (): Promise<ClanCreationRequest[]> => {
  return axios.get<ClanCreationRequest[]>(API_URL + '/admin/clan-creation-requests', withCredentials).then(r => r.data);
};

export const reviewClanCreationRequest = async (id: string, action: ReviewAction): Promise<MessageResponse> => {
  return axios.patch<MessageResponse>(API_URL + '/admin/clan-creation-requests/' + id, { action }, withCredentials).then(r => r.data);
};

// ── Overview ──────────────────────────────────────────────────────────────────

export const getOverviewStats = async (): Promise<OverviewStats> => {
  return axios.get<OverviewStats>(API_URL + '/admin/overview', withCredentials).then(r => r.data);
};

export const getGrowthStats = async (range: GrowthRange = '30'): Promise<ChartSeries> => {
  return axios.get<ChartSeries>(API_URL + '/admin/overview/growth?range=' + range, withCredentials).then(r => r.data);
};
