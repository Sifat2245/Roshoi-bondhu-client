import React from "react";

interface ProfileNavTabsProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  postCount?: number;
  friendsCount?: number;
}

const ProfileNavTabs: React.FC<ProfileNavTabsProps> = ({
  activeTab,
  onSelectTab,
  friendsCount,
}) => {
  const tabs = [
    { id: "POSTS", label: "All" },
    { id: "ABOUT", label: "About" },
    {
      id: "FRIENDS",
      label: "Friends",
      count: friendsCount,
    },
    { id: "PHOTOS", label: "Photos" },
    { id: "RECIPES", label: "Recipes" },
  ];

  return (
    <div id="profile-nav-tabs" className="w-full bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-gray-800 shadow-xs">
      <div className="max-w-[1250px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 overflow-x-auto text-sm sm:text-[15px] font-bold text-gray-600 dark:text-gray-300 no-scrollbar">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`py-3.5 px-3.5 sm:px-4.5 border-b-[3px] transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "border-[#e02f21] text-[#e02f21] font-extrabold"
                    : "border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-lg text-gray-600 dark:text-gray-300"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-xs ${isSelected ? "text-[#e02f21]" : "text-gray-400"}`}>
                    {tab.count}
                  </span>
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
