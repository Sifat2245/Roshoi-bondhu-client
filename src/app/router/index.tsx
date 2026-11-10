import { createBrowserRouter } from "react-router";
import type { ComponentType } from "react";
import NotFound from "../../pages/NotFound";
import PrivateRoute from "../../components/guards/PrivateRoute";
import PagePlaceholder from "../../components/common/PagePlaceholder";

type PageLoader = () => Promise<{ default: ComponentType }>;

// Router lazy loading keeps the current page visible while the next page's code loads.
function page(load: PageLoader, requiresAuth = true) {
  return async () => {
    const { default: Page } = await load();
    function RoutePage() {
      return requiresAuth ? <PrivateRoute><Page /></PrivateRoute> : <Page />;
    }
    return { Component: RoutePage };
  };
}

const protectedPages: [string, PageLoader][] = [
  ["/", () => import("../../pages/feed/SocialFeed")],
  ["/post/:id", () => import("../../pages/feed/PostPage")],
  ["/groups", () => import("../../pages/group/GroupsPage")],
  ["/groups/create", () => import("../../pages/group/CreateGroupPage")],
  ["/group/:slug", () => import("../../pages/group/GroupDetailPage")],
  ["/profile", () => import("../../pages/profile/UserProfilePage")],
  ["/profile/:id", () => import("../../pages/profile/UserProfilePage")],
  ["/friends", () => import("../../pages/friends/FriendsPage")],
  ["/friends/list", () => import("../../pages/friends/FriendsListPage")],
  ["/messages", () => import("../../pages/messages/MessagesPage")],
  ["/notifications", () => import("../../pages/notifications/NotificationsPage")],
  ["/settings", () => import("../../pages/settings/SettingsPage")],
  ["/cookbook", () => import("../../pages/kitchen/CookbookPage")],
  ["/pantry", () => import("../../pages/kitchen/PantryPage")],
  ["/meal-planner", () => import("../../pages/kitchen/MealPlannerPage")],
  ["/drafts", () => import("../../pages/kitchen/DraftsPage")],
];
const publicPages: [string, PageLoader][] = [
  ["/login", () => import("../../pages/auth/LoginPage")],
  ["/register", () => import("../../pages/auth/RegisterPage")],
  ["/verify-email", () => import("../../pages/auth/VerifyEmailPage")],
  ["/verify", () => import("../../pages/auth/VerifyEmailPage")],
  ["/forgot-password", () => import("../../pages/auth/ForgotPasswordPage")],
];

export const router = createBrowserRouter([
  ...protectedPages.map(([path, load]) => ({ path, lazy: page(load), HydrateFallback: PagePlaceholder, errorElement: <NotFound /> })),
  ...publicPages.map(([path, load]) => ({ path, lazy: page(load, false), HydrateFallback: PagePlaceholder, errorElement: <NotFound /> })),
  { path: "*", Component: NotFound },
]);

export default router;
