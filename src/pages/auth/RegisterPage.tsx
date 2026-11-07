import React from 'react';
import { AuthLayout } from '../../app/layouts/AuthLayout';
import SignUpForm from '../../features/auth/components/SignUpForm';

const RegisterPage = () => {
  return (
    <AuthLayout maxWidth="max-w-[620px]" py="py-6 sm:py-12">
      <SignUpForm />
    </AuthLayout>
  );
};

export default RegisterPage;
