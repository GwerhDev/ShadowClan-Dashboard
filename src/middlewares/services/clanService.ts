import axios from "axios"
import { API_URL } from "../misc/const"
import type {
  Character, Clan, ClanCreatePayload, ClanMembersPage, ClanRole, ClanSyncResult,
  ClanUpdatePayload, PageParams, Paginated,
} from "../../interfaces"

const withCredentials = { withCredentials: true };

// Nota: los endpoints de escritura de /admin/clans devuelven la primera página de clanes ordenados.

export const getClans = async (): Promise<Paginated<Clan>> => {
  return axios.get<Paginated<Clan>>(API_URL + "/admin/clans", withCredentials).then(r => r.data);
};

export const getClansPage = async (params: PageParams): Promise<Paginated<Clan>> => {
  return axios.get<Paginated<Clan>>(API_URL + "/admin/clans", { params, ...withCredentials }).then(r => r.data);
};

export const createClan = async (formData: ClanCreatePayload): Promise<Clan[]> => {
  return axios.post<Clan[]>(API_URL + "/admin/clans", formData, withCredentials).then(r => r.data);
};

export const updateClan = async (formData: ClanUpdatePayload): Promise<Clan[]> => {
  return axios.patch<Clan[]>(API_URL + "/admin/clans", formData, withCredentials).then(r => r.data);
};

export const deleteClan = async (id: string): Promise<Clan[]> => {
  return axios.delete<Clan[]>(API_URL + "/admin/clans/" + id, withCredentials).then(r => r.data);
};

export const getClanById = async (id: string): Promise<Clan> => {
  return axios.get<Clan>(API_URL + "/admin/clans/" + id, withCredentials).then(r => r.data);
};

export const getClanDetailMembersPage = async (clanId: string, params: PageParams): Promise<ClanMembersPage> => {
  return axios.get<ClanMembersPage>(API_URL + "/admin/clans/" + clanId + "/members", { params, ...withCredentials })
    .then(r => r.data);
};

export const removeClanLeader = async (clanId: string): Promise<Clan[]> => {
  return axios.delete<Clan[]>(API_URL + "/admin/clans/" + clanId + "/leader", withCredentials).then(r => r.data);
};

export const assignClanLeader = async (clanId: string, leaderId: string): Promise<Clan[]> => {
  return axios.patch<Clan[]>(API_URL + "/admin/clans/" + clanId + "/leader", { leaderId }, withCredentials)
    .then(r => r.data);
};

export const syncClanFromFile = async (clanId: string, file: File): Promise<ClanSyncResult> => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post<ClanSyncResult>(API_URL + "/admin/clans/" + clanId + "/sync", formData, {
    ...withCredentials,
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const searchCharacters = async (q: string): Promise<Character[]> => {
  const response = await axios.get<Paginated<Character>>(
    API_URL + "/admin/characters?q=" + encodeURIComponent(q) + "&limit=10", withCredentials,
  ).then(r => r.data);
  return response.data ?? [];
};

export const updateClanMemberRole = async (clanId: string, memberId: string, role: ClanRole): Promise<{ ok: boolean }> => {
  return axios.patch<{ ok: boolean }>(API_URL + "/admin/clans/" + clanId + "/members/" + memberId + "/role", { role }, withCredentials)
    .then(r => r.data);
};
