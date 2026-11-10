import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthLayout } from '../../app/layouts/AuthLayout';
import LoginHero from '../../features/auth/components/LoginHero';
import LoginForm from '../../features/auth/components/LoginForm';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../lib/auth-client';

const LoginPage = () => {
  const { user: authUser } = useAuth();
  const { data: session } = useSession();
  const navigate = useNavigate();

  const user = session?.user || authUser;

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <AuthLayout maxWidth="max-w-[1800px]" py="py-10 sm:py-14 lg:py-20" mainClassName="lg:min-h-dvh">
      <div className="login-page-grid">
        {/* Keep a compact introduction above the form on smaller screens. */}
        <div className="login-page-story w-full max-w-[440px] lg:max-w-none mx-auto">
          <LoginHero />
        </div>

        {/* Right Column: Login Form */}
        <div className="login-page-form w-full flex justify-center">
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
