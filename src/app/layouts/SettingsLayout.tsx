import React from "react";
import SocialHeader from "../../widgets/navbar/SocialHeader";

export interface SettingsLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  sidebar,
  children,
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Fixed Topbar */}
      <SocialHeader />

      {/* Main Settings Container */}
      <div className="pt-[100px] md:pt-14 w-full">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Left Sidebar with subtle border */}
            <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-20 self-start lg:border-r border-gray-200/70 dark:border-gray-800 lg:pr-8">
              {sidebar}
            </div>

            {/* Right Content Area */}
            <main className="flex-1 w-full max-w-[680px]">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
