import React from "react";
import { Navigate, useLocation } from "react-router";
import { useSession } from "../../lib/auth-client";
import { useAuth } from "../../context/AuthContext";

export interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { data: session, isPending: sessionLoading } = useSession();
  const { user: authUser, loading: authLoading } = useAuth();
  const location = useLocation();

  const user = session?.user || authUser;
  const isLoading = (authLoading || sessionLoading) && !user;

  if (isLoading) {
    return (
      <div
        className="min-h-dvh bg-[#f0f2f5] dark:bg-[#18191a]"
        aria-busy="true"
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
