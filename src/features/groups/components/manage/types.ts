export type GroupManageSection =
  | "HOME"
  | "MOBILE_HUB"
  | "OVERVIEW"
  | "MEMBER_REQUESTS"
  | "PENDING_POSTS"
  | "REPORTED_CONTENT"
  | "BANNED_MEMBERS"
  | "GROUP_RULES"
  | "COMMUNITY_ROLES"
  | "SETTINGS";

export interface GroupManageCounts {
  memberRequests: number;
  pendingPosts: number;
  reportedContent: number;
  bannedMembers: number;
}

export const MANAGE_PARAM_TO_SECTION: Record<string, GroupManageSection> = {
  overview: "OVERVIEW",
  "member-requests": "MEMBER_REQUESTS",
  "pending-posts": "PENDING_POSTS",
  reported: "REPORTED_CONTENT",
  "banned-members": "BANNED_MEMBERS",
  rules: "GROUP_RULES",
  roles: "COMMUNITY_ROLES",
  settings: "SETTINGS",
};

export const SECTION_TO_MANAGE_PARAM: Partial<Record<GroupManageSection, string>> = {
  OVERVIEW: "overview",
  MEMBER_REQUESTS: "member-requests",
  PENDING_POSTS: "pending-posts",
  REPORTED_CONTENT: "reported",
  BANNED_MEMBERS: "banned-members",
  GROUP_RULES: "rules",
  COMMUNITY_ROLES: "roles",
  SETTINGS: "settings",
};

export function resolveManageSection(
  isManageRoute: boolean,
  manageParam?: string
): GroupManageSection {
  if (!isManageRoute) return "HOME";
  if (!manageParam) return "MOBILE_HUB";
  return MANAGE_PARAM_TO_SECTION[manageParam.toLowerCase()] || "OVERVIEW";
}

export function getManagePath(slug: string, section: GroupManageSection): string {
  if (section === "HOME") return `/group/${slug}`;
  if (section === "MOBILE_HUB") return `/group/${slug}/manage`;
  const param = SECTION_TO_MANAGE_PARAM[section] || "overview";
  return `/group/${slug}/manage/${param}`;
}
