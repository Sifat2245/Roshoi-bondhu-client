import React from "react";
import SocialHeader from "../../widgets/navbar/SocialHeader";
import LeftSidebar from "../../widgets/left-sidebar/LeftSidebar";

export interface GroupLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  containerClassName?: string;
}

export const GroupLayout: React.FC<GroupLayoutProps> = ({
  children,
  showSidebar = true,
  containerClassName = "max-w-[1200px] mx-auto",
}) => {
  return (
    <div className="h-dvh flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      {/* Fixed Topbar */}
      <SocialHeader />

      {/* Main Container */}
      <div className="flex-1 min-h-0 mt-[100px] md:mt-14 flex overflow-hidden">
        {showSidebar && (
          <aside className="hidden lg:block w-[320px] xl:w-[340px] h-full shrink-0 overflow-y-auto no-scrollbar">
            <LeftSidebar />
          </aside>
        )}

        <main className="flex-1 min-w-0 min-h-0 h-full overflow-y-auto no-scrollbar py-6 px-4 sm:px-6">
          <div className={containerClassName}>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default GroupLayout;
