import React from 'react';
import { AuthLayout } from '../../app/layouts/AuthLayout';
import FindAccountForm from '../../features/auth/components/FindAccountForm';

const ForgotPasswordPage = () => {
  return (
    <AuthLayout maxWidth="max-w-[540px]">
      <FindAccountForm />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
