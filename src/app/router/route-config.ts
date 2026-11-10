export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  GROUPS: "/groups",
  GROUPS_CREATE: "/groups/create",
  GROUP_DETAIL: (slug: string) => `/group/${slug}`,
  PROFILE: "/profile",
  USER_PROFILE: (id: string) => `/profile/${id}`,
  FRIENDS: "/friends",
  FRIENDS_LIST: "/friends/list",
  MESSAGES: "/messages",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
} as const;

export type AppRoutes = typeof ROUTES;
