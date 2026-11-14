import apiClient from "../../../lib/api-client";
import { apolloClient } from "../../../lib/graphql/client";
import {
  USER_PROFILE_QUERY,
  USER_PREFERENCES_QUERY,
} from "../../../lib/graphql/queries";
import {
  UPDATE_PROFILE_MUTATION,
  UPDATE_PREFERENCES_MUTATION,
  TOGGLE_FOLLOW_MUTATION,
} from "../../../lib/graphql/mutations";
import {
  UserProfile,
  UpdateProfilePayload,
  UpdateBioPayload,
} from "../types/profile.types";

export const profileApi = {
  getUserProfile: async (
    userId: string,
    _token: string | null = null,
  ): Promise<UserProfile> => {
    const isMe = !userId || userId === "me";
    const { data } = await apolloClient.query({
      query: USER_PROFILE_QUERY,
      variables: { id: isMe ? undefined : userId },
      fetchPolicy: "network-only",
    });
    return data?.userProfile;
  },

  updateProfile: async (
    profileData: UpdateProfilePayload,
    _token: string | null = null,
  ) => {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_PROFILE_MUTATION,
      variables: { input: profileData },
    });
    return { success: true, data: data?.updateProfile };
  },

  updateBio: async (bioData: UpdateBioPayload, _token: string | null = null) => {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_PROFILE_MUTATION,
      variables: { input: { bio: bioData.bio } },
    });
    return { success: true, data: data?.updateProfile };
  },

  getPreferences: async (_token: string | null = null) => {
    const { data } = await apolloClient.query({
      query: USER_PREFERENCES_QUERY,
      fetchPolicy: "network-only",
    });
    return { success: true, data: data?.userPreferences };
  },

  updatePreferences: async (preferencesData: any, _token: string | null = null) => {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_PREFERENCES_MUTATION,
      variables: { input: preferencesData },
    });
    return { success: true, data: data?.updatePreferences };
  },

  toggleFollow: async (targetUserId: string, _token: string | null = null) => {
    const { data } = await apolloClient.mutate({
      mutation: TOGGLE_FOLLOW_MUTATION,
      variables: { targetUserId },
    });
    return { success: true, data: data?.toggleFollow };
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
