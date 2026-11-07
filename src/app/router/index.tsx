import { createBrowserRouter } from 'react-router';
import SocialFeed from '../../pages/feed/SocialFeed';
import GroupsPage from '../../pages/group/GroupsPage';
import CreateGroupPage from '../../pages/group/CreateGroupPage';
import GroupDetailPage from '../../pages/group/GroupDetailPage';
import UserProfilePage from '../../pages/profile/UserProfilePage';
import FriendsPage from '../../pages/friends/FriendsPage';
import FriendsListPage from '../../pages/friends/FriendsListPage';
import MessagesPage from '../../pages/messages/MessagesPage';
import NotificationsPage from '../../pages/notifications/NotificationsPage';
import LoginPage from '../../pages/auth/LoginPage';
import RegisterPage from '../../pages/auth/RegisterPage';
import ForgotPasswordPage from '../../pages/auth/ForgotPasswordPage';
import SettingsPage from '../../pages/settings/SettingsPage';
import NotFound from '../../pages/NotFound';
import PrivateRoute from '../../components/guards/PrivateRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <NotFound />,
    element: (
      <PrivateRoute>
        <SocialFeed />
      </PrivateRoute>
    ),
  },
  {
    path: '/login',
    errorElement: <NotFound />,
    Component: LoginPage,
  },
  {
    path: '/register',
    errorElement: <NotFound />,
    Component: RegisterPage,
  },
  {
    path: '/forgot-password',
    errorElement: <NotFound />,
    Component: ForgotPasswordPage,
  },
  {
    path: '/groups',
    errorElement: <NotFound />,
    element: (
      <PrivateRoute>
        <GroupsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/groups/create',
    errorElement: <NotFound />,
    element: (
      <PrivateRoute>
        <CreateGroupPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/group/:slug',
    errorElement: <NotFound />,
    element: (
      <PrivateRoute>
        <GroupDetailPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/profile',
    errorElement: <NotFound />,
    element: (
      <PrivateRoute>
        <UserProfilePage />
      </PrivateRoute>
    ),
  },
  {
    path: '/profile/:id',
    errorElement: <NotFound />,
    element: (
      <PrivateRoute>
        <UserProfilePage />
      </PrivateRoute>
    ),
  },
  {
    path: '/friends',
    errorElement: <NotFound />,
    element: (
      <PrivateRoute>
        <FriendsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/friends/list',
    errorElement: <NotFound />,
    element: (
      <PrivateRoute>
        <FriendsListPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/messages',
    errorElement: <NotFound />,
    element: (
      <PrivateRoute>
        <MessagesPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/notifications',
    errorElement: <NotFound />,
    element: (
      <PrivateRoute>
        <NotificationsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '/settings',
    errorElement: <NotFound />,
    element: (
      <PrivateRoute>
        <SettingsPage />
      </PrivateRoute>
    ),
  },
  {
    path: '*',
    Component: NotFound,
  },
]);

export default router;

