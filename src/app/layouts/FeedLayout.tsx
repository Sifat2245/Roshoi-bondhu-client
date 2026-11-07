import React, { useState } from 'react';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import LeftSidebar from '../../widgets/left-sidebar/LeftSidebar';
import RightSidebar from '../../widgets/right-sidebar/RightSidebar';
import { X } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const hasActiveFilters = Boolean(activeCuisine || activeTag || activeMaxTime);

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden select-none">
      {/* Fixed Topbar with Responsive Menu & Filter Actions */}
      <SocialHeader
        onToggleLeftSidebar={() => setIsMobileMenuOpen((prev) => !prev)}
        onToggleRightSidebar={() => setIsMobileFilterOpen((prev) => !prev)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main 3-Column Layout: Left Sidebar + Central Feed + Right Sidebar */}
      <div className="flex-1 mt-[100px] md:mt-14 flex overflow-hidden">
        {/* Left Sticky Sidebar with generous top gap and breathing room */}
        <aside className="hidden lg:block w-[300px] xl:w-[320px] 2xl:w-[340px] h-full shrink-0 overflow-y-auto no-scrollbar pt-4 pb-6 px-3">
          <LeftSidebar />
        </aside>

        {/* Center Scrollable Feed Stream */}
        <main className="flex-1 h-full overflow-y-auto no-scrollbar py-4 sm:py-5 px-3 sm:px-6">
          <div className="max-w-[680px] 2xl:max-w-[720px] mx-auto space-y-4">
            {children}
          </div>
        </main>

        {/* Right Sticky Sidebar with generous top gap and breathing room */}
        <aside className="hidden xl:block w-[300px] 2xl:w-[320px] h-full shrink-0 overflow-y-auto no-scrollbar pt-4 pb-6 px-3">
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

      {/* Mobile Left Sidebar Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-[300px] max-w-[85vw] bg-white dark:bg-[#242526] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-sm text-gray-900 dark:text-white">Navigation Menu</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3" onClick={() => setIsMobileMenuOpen(false)}>
              <LeftSidebar />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Right Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-[320px] max-w-[85vw] bg-white dark:bg-[#242526] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-sm text-gray-900 dark:text-white">Recipe & Food Filters</span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <RightSidebar
                activeCuisine={activeCuisine}
                onSelectCuisine={(c) => {
                  onSelectCuisine?.(c);
                  setIsMobileFilterOpen(false);
                }}
                activeTag={activeTag}
                onSelectTag={(t) => {
                  onSelectTag?.(t);
                  setIsMobileFilterOpen(false);
                }}
                activeMaxTime={activeMaxTime}
                onSelectMaxTime={(tm) => {
                  onSelectMaxTime?.(tm);
                  setIsMobileFilterOpen(false);
                }}
                onResetFilters={() => {
                  onResetFilters?.();
                  setIsMobileFilterOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedLayout;

