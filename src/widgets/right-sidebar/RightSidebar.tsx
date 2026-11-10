import React from "react";
import {
  Flame,
  Tag,
  Clock,
  X,
  Filter,
  Check,
  RotateCcw,
  Utensils,
  Soup,
  Cookie,
  Zap,
  Timer,
  ChefHat,
  Salad,
  Pizza,
} from "lucide-react";

export interface RightSidebarProps {
  activeCuisine?: string;
  onSelectCuisine?: (cuisine: string) => void;
  activeTag?: string;
  onSelectTag?: (tag: string) => void;
  activeMaxTime?: string;
  onSelectMaxTime?: (time: string) => void;
  onResetFilters?: () => void;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
  activeCuisine = "",
  onSelectCuisine,
  activeTag = "",
  onSelectTag,
  activeMaxTime = "",
  onSelectMaxTime,
  onResetFilters,
}) => {
  const cuisines = [
    {
      id: "Bangladeshi",
      label: "Bangladeshi",
      native: "বাঙালি রান্না",
      Icon: ChefHat,
    },
    {
      id: "Indian",
      label: "Indian Curries",
      native: "ভারতীয় কারি",
      Icon: Soup,
    },
    {
      id: "Mughlai",
      label: "Mughlai & Biryani",
      native: "মোগলাই ও বিরিয়ানি",
      Icon: Utensils,
    },
    {
      id: "Desserts",
      label: "Desserts & Sweets",
      native: "মিষ্টি ও ডেজার্ট",
      Icon: Cookie,
    },
    { id: "Chinese", label: "Desi Chinese", native: "চাইনিজ", Icon: Salad },
    {
      id: "Street Food",
      label: "Street Food",
      native: "স্ট্রিট ফুড",
      Icon: Pizza,
    },
  ];

  const popularTags = [
    "#KacchiBiryani",
    "#Ilish",
    "#BeefBhuna",
    "#QuickMeal",
    "#ChickenRoast",
    "#Sweets",
    "#HealthyDiet",
    "#Spicy",
    "#TeaTimeSnacks",
    "#Pitha",
    "#Khichuri",
  ];

  const cookingTimes = [
    { label: "Under 15 mins", value: "15", Icon: Zap },
    { label: "Under 30 mins", value: "30", Icon: Clock },
    { label: "Under 60 mins", value: "60", Icon: Timer },
  ];

  const hasActiveFilters = Boolean(activeCuisine || activeTag || activeMaxTime);

  return (
    <aside className="w-full space-y-4 select-none pb-8 text-gray-800 dark:text-gray-200">
      {/* Reset Button (Visible only when filters are active) */}
      {hasActiveFilters && (
        <div className="flex items-center justify-end px-2 pt-1">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset filters</span>
          </button>
        </div>
      )}

      {/* Active Filters Summary Pill (if any active) */}
      {hasActiveFilters && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-sm space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Active Filters
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeCuisine && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e02f21] text-white text-xs sm:text-sm font-bold">
                {activeCuisine}
                <button
                  type="button"
                  onClick={() => onSelectCuisine("")}
                  className="hover:text-black cursor-pointer"
                >
                  <X size={13} />
                </button>
              </span>
            )}
            {activeTag && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-bold">
                {activeTag}
                <button
                  type="button"
                  onClick={() => onSelectTag("")}
                  className="hover:text-black cursor-pointer"
                >
                  <X size={13} />
                </button>
              </span>
            )}
            {activeMaxTime && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-600 text-white text-xs sm:text-sm font-bold">
                ≤ {activeMaxTime}m
                <button
                  type="button"
                  onClick={() => onSelectMaxTime("")}
                  className="hover:text-black cursor-pointer"
                >
                  <X size={13} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 1. Cuisines Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2 text-base font-bold text-gray-800 dark:text-gray-200">
          <Flame size={18} className="text-orange-500" />
          <span>Cuisines</span>
        </div>

        <div className="space-y-1">
          {cuisines.map((c) => {
            const isSelected =
              activeCuisine.toLowerCase() === c.id.toLowerCase();
            const Icon = c.Icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCuisine(isSelected ? "" : c.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-bold transition cursor-pointer text-left ${
                  isSelected
                    ? "bg-[#e02f21] text-white shadow-xs"
                    : "hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="truncate">
                    <p className="truncate leading-tight font-bold">
                      {c.label}
                    </p>
                    <p
                      className={`text-sm ${
                        isSelected ? "text-red-100" : "text-gray-400"
                      }`}
                    >
                      {c.native}
                    </p>
                  </div>
                </div>

                {isSelected && <Check size={18} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>

      {/* 2. Cooking Time Filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2 text-base font-bold text-gray-800 dark:text-gray-200">
          <Clock size={18} className="text-blue-500" />
          <span>Prep & Cooking Time</span>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {cookingTimes.map((item) => {
            const isSelected = activeMaxTime === item.value;
            const Icon = item.Icon;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onSelectMaxTime(isSelected ? "" : item.value)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-bold transition cursor-pointer text-left ${
                  isSelected
                    ? "bg-amber-600 text-white shadow-xs"
                    : "hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check size={18} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>

      {/* 3. Popular Food Tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2 text-base font-bold text-gray-800 dark:text-gray-200">
          <Tag size={18} className="text-emerald-500" />
          <span>Popular Food Tags</span>
        </div>

        <div className="flex flex-wrap gap-2 px-1">
          {popularTags.map((tag) => {
            const cleanTag = tag.replace("#", "");
            const isSelected =
              activeTag.toLowerCase() === cleanTag.toLowerCase() ||
              activeTag.toLowerCase() === tag.toLowerCase();

            return (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(isSelected ? "" : cleanTag)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                  isSelected
                    ? "bg-[#e02f21] text-white shadow-xs"
                    : "bg-gray-200/70 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-gray-700"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
