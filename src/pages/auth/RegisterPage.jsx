import React from 'react';
import SignUpForm from '../../components/auth/signup/SignUpForm';
import AuthFooter from '../../components/auth/AuthFooter';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#18191a] text-gray-900 dark:text-gray-100 flex flex-col justify-between py-6 sm:py-12 transition-colors">
      <main className="w-full max-w-[620px] mx-auto px-4 sm:px-6 flex-1 flex items-center justify-center">
        <SignUpForm />
      </main>

      <AuthFooter />
    </div>
  );
};

export default RegisterPage;
