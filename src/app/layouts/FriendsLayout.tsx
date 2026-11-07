import React from 'react';
import SocialHeader from '../../widgets/navbar/SocialHeader';

export interface FriendsLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const FriendsLayout: React.FC<FriendsLayoutProps> = ({ children, sidebar }) => {
  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      {/* Fixed Topbar */}
      <SocialHeader />

      {/* Main 2-Column Split Layout */}
      <div className="flex-1 mt-14 flex overflow-hidden">
        {/* Left Sidebar (320px-360px) */}
        <aside className="w-full sm:w-[320px] md:w-[340px] xl:w-[360px] h-full shrink-0 overflow-y-auto no-scrollbar">
          {sidebar}
        </aside>

        {/* Right Main Content View */}
        <main className="hidden sm:block flex-1 h-full overflow-y-auto no-scrollbar p-6">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FriendsLayout;

