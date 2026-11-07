import { UserRole, UserStatus } from '../../../types/common.types';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  image?: string;
  role?: UserRole;
  status?: UserStatus;
  bio?: string;
  city?: string;
  work?: string;
  education?: string;
  phone?: string;
  gender?: string;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionData {
  user: User;
  session?: {
    id: string;
    token: string;
    userId: string;
    expiresAt: string;
  };
}

export interface AuthContextType {
  user: User | null;
  session: SessionData | null;
  loading: boolean;
  authError: string | null;
  createUserAccount: (formData: any) => Promise<any>;
  loginUser: (credentials: any) => Promise<any>;
  logoutUser: () => Promise<void>;
}

