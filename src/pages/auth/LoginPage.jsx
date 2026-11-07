import React from 'react';
import LoginHero from '../../components/auth/login/LoginHero';
import LoginForm from '../../components/auth/login/LoginForm';
import AuthFooter from '../../components/auth/AuthFooter';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#18191a] text-gray-900 dark:text-gray-100 flex flex-col justify-between selection:bg-[#e02f21] selection:text-white transition-colors">
      {/* Main Full-Screen 2-Column Split (Direct on page, NO floating card) */}
      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-16 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Column: Visual Storytelling & Brand Headline (Col 7) */}
          <div className="lg:col-span-7 flex justify-center lg:justify-start">
            <LoginHero />
          </div>

          {/* Right Column: Clean Form directly on the canvas with subtle divider */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-start lg:border-l border-gray-100 dark:border-gray-800 lg:pl-12">
            <LoginForm />
          </div>
        </div>
      </main>

      {/* Multilingual Bottom Footer */}
      <AuthFooter />
    </div>
  );
};

export default LoginPage;
