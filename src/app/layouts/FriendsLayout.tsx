import React from "react";
import SocialHeader from "../../widgets/navbar/SocialHeader";

export interface FriendsLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const FriendsLayout: React.FC<FriendsLayoutProps> = ({
  children,
  sidebar,
}) => {
  return (
    <div className="h-dvh flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      {/* Fixed Topbar */}
      <SocialHeader />

      {/* Main 2-Column Split Layout */}
      <div className="flex-1 min-h-0 mt-[100px] md:mt-14 flex overflow-hidden">
        {/* Left Sidebar: Visible on desktop (lg: and up) */}
        <aside className="hidden lg:block w-[320px] md:w-[340px] xl:w-[360px] h-full shrink-0 overflow-y-auto no-scrollbar border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#242526]">
          {sidebar}
        </aside>

        {/* Right Main Content View: Full width on mobile/tablet, flex-1 on desktop */}
        <main className="flex-1 min-w-0 min-h-0 w-full h-full overflow-y-auto no-scrollbar p-3.5 sm:p-5 lg:p-6">
          <div className="max-w-[1200px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default FriendsLayout;
