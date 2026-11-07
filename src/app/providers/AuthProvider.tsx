import React, { useState } from 'react';
import { useSession, signIn, signUp, signOut } from '../../lib/auth-client';
import { AuthContext } from '../../context/AuthContext';

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: rawSession, isPending: loading } = useSession();
  const session = rawSession as any;
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const clearError = () => setAuthError(null);

  const createUserAccount = async (email: string, password: string, name: string, profileImage?: string | null) => {
    try {
      setAuthError(null);
      const res = await signUp.email({
        name,
        email,
        password,
        image: profileImage || undefined,
      });
      if (res.error) throw new Error(res.error.message || 'Failed to create account.');
      return res;
    } catch (err: any) {
      setAuthError(err.message);
      throw err;
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      setAuthError(null);
      const res = await signIn.email({ email, password });
      if (res.error) throw new Error(res.error.message || 'Invalid email or password.');
      return res;
    } catch (err: any) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      setAuthError(null);
      await (signOut as any)();
    } catch (err: any) {
      setAuthError(err.message);
      throw err;
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const authData: any = {
    user: session?.user || null,
    session: session?.session || null,
    loading,
    authError,
    setAuthError,
    clearError,
    createUserAccount,
    loginUser,
    logoutUser,
    redirectPath,
    setRedirectPath,
    isAuthModalOpen,
    setIsAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
