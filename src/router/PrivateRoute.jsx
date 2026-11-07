import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSession } from '../lib/auth-client';

const PrivateRoute = ({ children }) => {
  const { data: session, isPending: loading } = useSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] flex items-center justify-center">
        <span className="w-10 h-10 border-3 border-[#e02f21] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
