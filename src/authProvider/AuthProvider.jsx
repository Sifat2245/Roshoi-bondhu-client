import React, { createContext, useContext, useState } from 'react';
import { useSession, signIn, signUp, signOut } from '../lib/auth-client';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { data: session, isPending: loading, error: sessionError } = useSession();
  const [authError, setAuthError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  const clearError = () => setAuthError(null);

  const createUserAccount = async (email, password, name, profileImage) => {
    try {
      setAuthError(null);
      const res = await signUp.email({
        name,
        email,
        password,
        image: profileImage || null,
      });
      if (res.error) throw new Error(res.error.message || 'Failed to create account.');
      return res;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const loginUser = async (email, password) => {
    try {
      setAuthError(null);
      const res = await signIn.email({ email, password });
      if (res.error) throw new Error(res.error.message || 'Invalid email or password.');
      return res;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      setAuthError(null);
      await signOut();
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const authData = {
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

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
