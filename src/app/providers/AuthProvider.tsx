import React, { useState, useEffect } from "react";
import {
  useSession,
  signOut,
  authApi,
  getSession,
} from "../../lib/auth-client";
import { AuthContext } from "../../context/AuthContext";

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data: rawSession, isPending: sessionLoading, refetch } = useSession();
  const session = rawSession as any;
  const [currentUser, setCurrentUser] = useState<any>(session?.user || null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (session?.user) {
      if (isMounted) {
        setCurrentUser(session.user);
        setCheckingAuth(false);
      }
    } else {
      // Check /api/v1/auth/me for authenticated cookie or JWT session
      authApi
        .getMe()
        .then((user) => {
          if (isMounted && user) {
            setCurrentUser(user);
          }
        })
        .catch(() => {
          // Unauthenticated visitor
        })
        .finally(() => {
          if (isMounted) {
            setCheckingAuth(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [session?.user]);

  const clearError = () => setAuthError(null);

  const createUserAccount = (payload: any) => {
    setAuthError(null);
    return authApi.signup(payload);
  };

  const loginUser = async (emailOrCredentials: any, password?: string) => {
    setAuthError(null);
    const payload =
      typeof emailOrCredentials === "object"
        ? emailOrCredentials
        : { email: emailOrCredentials, password };
    const res = await authApi.login(payload);
    const loggedUser = res?.user || res?.data?.user;
    if (loggedUser) {
      setCurrentUser(loggedUser);
      await getSession();
      if (refetch) await refetch();
    }
    return res;
  };

  const logoutUser = async () => {
    setAuthError(null);
    await signOut();
    setCurrentUser(null);
    window.location.href = "/login";
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const refetchUser = async () => {
    try {
      const freshUser = await authApi.getMe();
      if (freshUser) setCurrentUser(freshUser);
    } catch {
      // Ignore background refetch failure when unauthenticated
    }
    if (refetch) await refetch();
  };

  const updateUser = (partial: any) => {
    setCurrentUser((prev: any) => (prev ? { ...prev, ...partial } : partial));
  };

  const resolvedUser = currentUser || session?.user || null;
  const isLoading = checkingAuth && !resolvedUser;

  const authData: any = {
    user: resolvedUser,
    session: session?.session || null,
    loading: isLoading,
    sessionLoading,
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
    refetchUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
