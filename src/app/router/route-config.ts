export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  GROUPS: '/groups',
  GROUP_DETAIL: (slug: string) => `/group/${slug}`,
  PROFILE: '/profile',
  USER_PROFILE: (id: string) => `/profile/${id}`,
  FRIENDS: '/friends',
  FRIENDS_LIST: '/friends/list',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  ADMIN_PORTAL: '/admin-portal',
} as const;

export type AppRoutes = typeof ROUTES;

