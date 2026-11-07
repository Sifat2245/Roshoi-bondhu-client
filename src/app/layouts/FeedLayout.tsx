import React from 'react';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import LeftSidebar from '../../widgets/left-sidebar/LeftSidebar';
import RightSidebar from '../../widgets/right-sidebar/RightSidebar';

export interface FeedLayoutProps {
  children: React.ReactNode;
  onOpenCreatePost?: () => void;
  activeCuisine?: string;
  onSelectCuisine?: (cuisine: string) => void;
  activeTag?: string;
  onSelectTag?: (tag: string) => void;
  activeMaxTime?: string;
  onSelectMaxTime?: (time: string) => void;
  onResetFilters?: () => void;
}

export const FeedLayout: React.FC<FeedLayoutProps> = ({
  children,
  onOpenCreatePost,
  activeCuisine = '',
  onSelectCuisine,
  activeTag = '',
  onSelectTag,
  activeMaxTime = '',
  onSelectMaxTime,
  onResetFilters,
}) => {
  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden select-none">
      {/* Fixed Topbar */}
      <SocialHeader onOpenCreatePost={onOpenCreatePost} />

      {/* Main 3-Column Layout: Left Sidebar + Central Feed + Right Sidebar */}
      <div className="flex-1 mt-14 flex overflow-hidden">
        {/* Left Sticky Sidebar */}
        <aside className="hidden lg:block w-[320px] xl:w-[340px] h-full shrink-0 overflow-y-auto no-scrollbar">
          <LeftSidebar />
        </aside>

        {/* Center Scrollable Feed Stream */}
        <main className="flex-1 h-full overflow-y-auto no-scrollbar py-6 px-4 sm:px-6">
          <div className="max-w-[700px] mx-auto space-y-4">
            {children}
          </div>
        </main>

        {/* Right Sticky Sidebar */}
        <aside className="hidden xl:block w-[320px] h-full shrink-0 overflow-y-auto no-scrollbar">
          <RightSidebar
            activeCuisine={activeCuisine}
            onSelectCuisine={onSelectCuisine}
            activeTag={activeTag}
            onSelectTag={onSelectTag}
            activeMaxTime={activeMaxTime}
            onSelectMaxTime={onSelectMaxTime}
            onResetFilters={onResetFilters}
          />
        </aside>
      </div>
    </div>
  );
};

export default FeedLayout;

