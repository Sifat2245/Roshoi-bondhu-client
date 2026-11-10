import apiClient from "../../../lib/api-client";
import { Group, CreateGroupPayload } from "../types/group.types";

export const groupsApi = {
  getGroups: async (
    params?: string | { search?: string; limit?: number; myGroups?: boolean },
    token: string | null = null,
  ): Promise<Group[]> => {
    let query = "";
    if (typeof params === "string") {
      query = params ? `?search=${encodeURIComponent(params)}` : "";
    } else if (params && typeof params === "object") {
      const q = new URLSearchParams();
      if (params.search) q.set("search", params.search);
      if (params.limit) q.set("limit", String(params.limit));
      if (params.myGroups) q.set("myGroups", "true");
      const qs = q.toString();
      query = qs ? `?${qs}` : "";
    }
    const res = await apiClient.get<{ success: boolean; data: Group[] }>(
      `/api/group${query}`,
      { token },
    );
    return res.data || [];
  },

  getGroupBySlug: async (
    slug: string,
    token: string | null = null,
  ): Promise<Group> => {
    const res = await apiClient.get<{ success: boolean; data: Group }>(
      `/api/group/${slug}`,
      { token },
    );
    return res.data;
  },

  createGroup: async (
    groupData: CreateGroupPayload,
    token: string | null = null,
  ) => {
    return apiClient.post("/api/group", groupData, { token });
  },

  joinGroup: async (slug: string, token: string | null = null) => {
    return apiClient.post(`/api/group/${slug}/join`, {}, { token });
  },

  leaveGroup: async (slug: string, token: string | null = null) => {
    return apiClient.post(`/api/group/${slug}/leave`, {}, { token });
  },

  updateGroupSettings: async (
    slug: string,
    settings: any,
    token: string | null = null,
  ) => {
    return apiClient.patch(`/api/group/${slug}/settings`, settings, { token });
  },
};

export default groupsApi;
