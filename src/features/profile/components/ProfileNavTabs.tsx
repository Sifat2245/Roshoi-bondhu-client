import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

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
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!showMore) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMore(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMore]);

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

  // Mobile (< 640px) shows 3 tabs + More ▾; desktop shows all 5 tabs
  const visibleCount = windowWidth < 640 ? 3 : tabs.length;
  const visibleTabs = tabs.slice(0, visibleCount);
  const overflowTabs = tabs.slice(visibleCount);
  const isOverflowActive = overflowTabs.some((t) => t.id === activeTab);
  const activeOverflowTab = overflowTabs.find((t) => t.id === activeTab);

  return (
    <div
      id="profile-nav-tabs"
      className="w-full bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-gray-800 shadow-xs relative"
    >
      <div className="max-w-[1250px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 text-sm sm:text-[15px] font-bold text-gray-600 dark:text-gray-300">
          {visibleTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelectTab(tab.id);
                  setShowMore(false);
                }}
                className={`py-2.5 sm:py-3 px-3 sm:px-4.5 border-b-[3px] transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "border-[#e02f21] text-[#e02f21] font-extrabold"
                    : "border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-lg text-gray-600 dark:text-gray-300"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-xs ${
                      isSelected ? "text-[#e02f21]" : "text-gray-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* More ▾ Dropdown on mobile */}
          {overflowTabs.length > 0 && (
            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setShowMore((prev) => !prev)}
                className={`py-2.5 sm:py-3 px-3 sm:px-4.5 border-b-[3px] transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isOverflowActive
                    ? "border-[#e02f21] text-[#e02f21] font-extrabold"
                    : "border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-lg text-gray-600 dark:text-gray-300"
                }`}
              >
                <span>
                  {isOverflowActive ? activeOverflowTab?.label : "More"}
                </span>
                <ChevronDown
                  size={15}
                  className={`transition-transform duration-200 ${
                    showMore ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showMore && (
                <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-white dark:bg-[#242526] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {overflowTabs.map((tab) => {
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(tab.id);
                          setShowMore(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-red-50 dark:bg-red-950/40 text-[#e02f21] font-bold"
                            : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"
                        }`}
                      >
                        <span>{tab.label}</span>
                        {isSelected && (
                          <Check size={16} className="text-[#e02f21]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileNavTabs;
