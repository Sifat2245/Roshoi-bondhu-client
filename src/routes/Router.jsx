import { createBrowserRouter } from 'react-router';
import SocialFeed from '../pages/SocialFeed';
import GroupsPage from '../pages/GroupsPage';
import GroupDetailPage from '../pages/GroupDetailPage';
import UserProfilePage from '../pages/UserProfilePage';
import AdminPortal from '../pages/AdminPortal';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <NotFound />,
    Component: SocialFeed,
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
    path: '/groups',
    errorElement: <NotFound />,
    Component: GroupsPage,
  },
  {
    path: '/group/:slug',
    errorElement: <NotFound />,
    Component: GroupDetailPage,
  },
  {
    path: '/profile/:id',
    errorElement: <NotFound />,
    Component: UserProfilePage,
  },
  {
    path: '/admin-portal',
    errorElement: <NotFound />,
    Component: AdminPortal,
  },
  {
    path: '*',
    Component: NotFound,
  },
]);

export default router;
