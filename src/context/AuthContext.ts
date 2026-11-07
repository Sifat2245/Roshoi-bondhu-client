import { createContext, useContext } from 'react';
import { AuthContextType } from '../features/auth/types/auth.types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      session: null,
      loading: false,
      authError: null,
      createUserAccount: async () => {},
      loginUser: async () => {},
      logoutUser: async () => {},
    };
  }
  return context;
};

export default AuthContext;

