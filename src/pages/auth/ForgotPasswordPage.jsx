import React from 'react';
import FindAccountForm from '../../components/auth/forget-password/FindAccountForm';
import AuthFooter from '../../components/auth/AuthFooter';

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#18191a] text-gray-900 dark:text-gray-100 flex flex-col justify-between py-6 sm:py-16 transition-colors">
      <main className="w-full max-w-[540px] mx-auto px-4 flex-1 flex items-center justify-center">
        <FindAccountForm />
      </main>

      <AuthFooter />
    </div>
  );
};

export default ForgotPasswordPage;
