import axios from "axios"
import { API_URL } from "../../misc/const"
import type { CharacterLinkPayload, CharacterLinkResponse } from "../../../interfaces"

export const claimCharacterAsAdmin = async (formData: CharacterLinkPayload): Promise<CharacterLinkResponse> => {
  return axios.patch<CharacterLinkResponse>(API_URL + "/admin/characters/claim", formData, { withCredentials: true })
    .then(r => r.data);
};

export const unclaimCharacterAsAdmin = async (formData: CharacterLinkPayload): Promise<CharacterLinkResponse> => {
  return axios.patch<CharacterLinkResponse>(API_URL + "/admin/characters/unclaim", formData, { withCredentials: true })
    .then(r => r.data);
};
