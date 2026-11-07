import React from 'react';
import { ChefHat, Image as ImageIcon, Users, Info } from 'lucide-react';

const ProfileNavTabs = ({ activeTab, onSelectTab, postCount = 0 }) => {
  const tabs = [
    { id: 'POSTS', label: 'All Posts', count: postCount },
    { id: 'RECIPES', label: 'Recipes Only', icon: ChefHat },
    { id: 'PHOTOS', label: 'Photos', icon: ImageIcon },
    { id: 'ABOUT', label: 'About', icon: Info },
    { id: 'FOLLOWERS', label: 'Followers', icon: Users },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#242526] border-t border-b border-gray-200 dark:border-gray-800 shadow-xs">
      <div className="max-w-[1095px] mx-auto px-4 sm:px-8">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 no-scrollbar">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`py-3.5 px-3 sm:px-4 border-b-3 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-[#e02f21] text-[#e02f21]'
                    : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg'
                }`}
              >
                {tab.icon && <tab.icon size={15} />}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[11px] opacity-75">({tab.count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileNavTabs;
