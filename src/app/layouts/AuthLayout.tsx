import React from 'react';
import AuthFooter from '../../features/auth/components/AuthFooter';

export interface AuthLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
  py?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  maxWidth = 'max-w-[1280px]',
  py = 'py-8 sm:py-16',
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#18191a] text-gray-900 dark:text-gray-100 flex flex-col justify-between selection:bg-[#e02f21] selection:text-white transition-colors">
      <main className={`w-full ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${py} flex-1 flex items-center justify-center`}>
        {children}
      </main>
      <AuthFooter />
    </div>
  );
};

export default AuthLayout;

