import axios from "axios"
import { API_URL } from "../misc/const"

export const getClans: any = async () => {
  const response: any = await axios.get(API_URL + "/admin/clans", { withCredentials: true })
                                   .then(response => response.data)
  return response;
};

export const createClan: any = async (formData: any) => {
  const response: any = await axios.post(API_URL + "/admin/clans", formData, { withCredentials: true })
                                   .then(response => response.data)
  return response;
};

export const updateClan: any = async (formData: any) => {
  const response: any = await axios.patch(API_URL + "/admin/clans", formData, { withCredentials: true })
                                   .then(response => response.data)
  return response;
};

export const deleteClan: any = async (id: any) => {
  const response: any = await axios.delete(API_URL + "/admin/clans/" + id, { withCredentials: true })
                                   .then(response => response.data)
  return response;
};

export const getClanById: any = async (id: string) => {
  const response: any = await axios.get(API_URL + "/admin/clans/" + id, { withCredentials: true })
                                   .then(response => response.data)
  return response;
};

export const removeClanLeader: any = async (clanId: string) => {
  const response: any = await axios.delete(API_URL + "/admin/clans/" + clanId + "/leader", { withCredentials: true })
                                   .then(response => response.data)
  return response;
};

export const assignClanLeader: any = async (clanId: string, leaderId: string) => {
  const response: any = await axios.patch(API_URL + "/admin/clans/" + clanId + "/leader", { leaderId }, { withCredentials: true })
                                   .then(response => response.data)
  return response;
};

export const syncClanFromFile: any = async (clanId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response: any = await axios.post(API_URL + "/admin/clans/" + clanId + "/sync", formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
  return response;
};

export const searchCharacters: any = async (q: string) => {
  const response: any = await axios.get(API_URL + "/admin/characters?q=" + encodeURIComponent(q) + "&limit=10", { withCredentials: true })
                                   .then(response => response.data)
  return response;
};
