import React from 'react';
import { AuthLayout } from '../../app/layouts/AuthLayout';
import VerifyEmailForm from '../../features/auth/components/VerifyEmailForm';

export const VerifyEmailPage: React.FC = () => {
  return (
    <AuthLayout maxWidth="max-w-[540px]" py="py-6 sm:py-12">
      <VerifyEmailForm />
    </AuthLayout>
  );
};

export default VerifyEmailPage;

