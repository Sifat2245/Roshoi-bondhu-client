import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthLayout } from '../../app/layouts/AuthLayout';
import SignUpForm from '../../features/auth/components/SignUpForm';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../lib/auth-client';

const RegisterPage = () => {
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
    <AuthLayout maxWidth="max-w-[620px]" py="py-6 sm:py-12">
      <SignUpForm />
    </AuthLayout>
  );
};

export default RegisterPage;
