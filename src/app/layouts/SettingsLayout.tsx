import React from 'react';
import SocialHeader from '../../widgets/navbar/SocialHeader';

export interface SettingsLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ sidebar, children }) => {
  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Fixed Topbar */}
      <SocialHeader />

      {/* Main 2-Column Settings Layout */}
      <div className="pt-14 w-full">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Sidebar */}
            <div className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-18 self-start">
              {sidebar}
            </div>

            {/* Right Content Area */}
            <main className="flex-1 w-full max-w-[760px]">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;

