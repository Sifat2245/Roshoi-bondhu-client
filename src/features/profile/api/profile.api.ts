import apiClient from "../../../lib/api-client";
import {
  UserProfile,
  UpdateProfilePayload,
  UpdateBioPayload,
} from "../types/profile.types";

export const profileApi = {
  getUserProfile: async (
    userId: string,
    token: string | null = null,
  ): Promise<UserProfile> => {
    const res = await apiClient.get<{ success: boolean; data: UserProfile }>(
      `/api/user/${userId}`,
      { token },
    );
    return res.data;
  },

  updateProfile: async (
    profileData: UpdateProfilePayload,
    token: string | null = null,
  ) => {
    return apiClient.patch("/api/user/profile", profileData, { token });
  },

  updateBio: async (bioData: UpdateBioPayload, token: string | null = null) => {
    return apiClient.patch("/api/user/bio", bioData, { token });
  },

  getPreferences: async (token: string | null = null) => {
    return apiClient.get("/api/user/preferences", { token });
  },

  updatePreferences: async (preferencesData: any, token: string | null = null) => {
    return apiClient.patch("/api/user/preferences", preferencesData, { token });
  },

  toggleFollow: async (targetUserId: string, token: string | null = null) => {
    return apiClient.post(`/api/user/${targetUserId}/follow`, {}, { token });
  },

  uploadImage: async (
    file: File,
    token: string | null = null,
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.upload("/api/upload/image", formData, { token });
  },
};

export default profileApi;
