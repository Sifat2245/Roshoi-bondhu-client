import React from 'react';
import { AuthLayout } from '../../app/layouts/AuthLayout';
import LoginHero from '../../features/auth/components/LoginHero';
import LoginForm from '../../features/auth/components/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout maxWidth="max-w-[1280px]">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Left Column: Storytelling / Hero */}
        <div className="lg:col-span-7 flex justify-center lg:justify-start">
          <LoginHero />
        </div>

        {/* Right Column: Login Form */}
        <div className="lg:col-span-5 w-full flex justify-center lg:justify-start lg:border-l border-gray-100 dark:border-gray-800 lg:pl-12">
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
