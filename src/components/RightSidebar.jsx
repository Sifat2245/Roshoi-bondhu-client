import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  Flame,
  Tag,
  Clock,
  Sparkles,
  X,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';

const RightSidebar = ({
  activeCuisine = '',
  onSelectCuisine,
  activeTag = '',
  onSelectTag,
  activeMaxTime = '',
  onSelectMaxTime,
  onResetFilters,
}) => {
  const { t } = useLanguage();

  const cuisines = [
    { id: 'Bangladeshi', label: 'Bangladeshi', native: 'বাঙালি রান্না', icon: '🇧🇩' },
    { id: 'Indian', label: 'Indian Curries', native: 'ভারতীয় কারি', icon: '🍛' },
    { id: 'Mughlai', label: 'Mughlai & Biryani', native: 'মোগলাই ও বিরিয়ানি', icon: '🥘' },
    { id: 'Desserts', label: 'Desserts & Sweets', native: 'মিষ্টি ও ডেজার্ট', icon: '🍰' },
    { id: 'Chinese', label: 'Desi Chinese', native: 'চাইনিজ', icon: '🥢' },
    { id: 'Street Food', label: 'Street Food', native: 'স্ট্রিট ফুড', icon: '🥟' },
  ];

  const popularTags = [
    '#KacchiBiryani',
    '#Ilish',
    '#BeefBhuna',
    '#QuickMeal',
    '#ChickenRoast',
    '#Sweets',
    '#HealthyDiet',
    '#Spicy',
    '#TeaTimeSnacks',
    '#Pitha',
    '#Khichuri',
  ];

  const cookingTimes = [
    { label: 'Under 15 mins', value: '15', icon: '⚡' },
    { label: 'Under 30 mins', value: '30', icon: '⏱' },
    { label: 'Under 60 mins', value: '60', icon: '🍲' },
  ];

  const hasActiveFilters = Boolean(activeCuisine || activeTag || activeMaxTime);

  return (
    <aside className="w-full space-y-4 select-none pb-8 text-gray-800 dark:text-gray-200">
      {/* Header & Reset Button */}
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[#e02f21]" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Filter Recipes & Food
          </h3>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-[#e02f21] hover:underline cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Active Filters Summary Pill (if any active) */}
      {hasActiveFilters && (
        <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-xs space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Active Filters
          </p>
          <div className="flex flex-wrap gap-1">
            {activeCuisine && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e02f21] text-white text-[11px] font-bold">
                {activeCuisine}
                <button
                  type="button"
                  onClick={() => onSelectCuisine('')}
                  className="hover:text-black cursor-pointer"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {activeTag && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold">
                {activeTag}
                <button
                  type="button"
                  onClick={() => onSelectTag('')}
                  className="hover:text-black cursor-pointer"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {activeMaxTime && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-600 text-white text-[11px] font-bold">
                ≤ {activeMaxTime}m
                <button
                  type="button"
                  onClick={() => onSelectMaxTime('')}
                  className="hover:text-black cursor-pointer"
                >
                  <X size={11} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 1. Cuisines Section */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-gray-700 dark:text-gray-300">
          <Flame size={14} className="text-orange-500" />
          <span>Cuisines</span>
        </div>

        <div className="space-y-1">
          {cuisines.map((c) => {
            const isSelected = activeCuisine.toLowerCase() === c.id.toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCuisine(isSelected ? '' : c.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[#e02f21] text-white shadow-xs font-bold'
                    : 'hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">{c.icon}</span>
                  <div className="truncate">
                    <p className="truncate leading-tight">{c.label}</p>
                    <p
                      className={`text-[10px] ${
                        isSelected ? 'text-red-100' : 'text-gray-400'
                      }`}
                    >
                      {c.native}
                    </p>
                  </div>
                </div>

                {isSelected && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>

      {/* 2. Cooking Time Filter */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-gray-700 dark:text-gray-300">
          <Clock size={14} className="text-blue-500" />
          <span>Prep & Cooking Time</span>
        </div>

        <div className="grid grid-cols-1 gap-1">
          {cookingTimes.map((item) => {
            const isSelected = activeMaxTime === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onSelectMaxTime(isSelected ? '' : item.value)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] text-gray-800 dark:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 my-2"></div>

      {/* 3. Popular Food Tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-gray-700 dark:text-gray-300">
          <Tag size={14} className="text-emerald-500" />
          <span>Popular Food Tags</span>
        </div>

        <div className="flex flex-wrap gap-1.5 px-1">
          {popularTags.map((tag) => {
            const cleanTag = tag.replace('#', '');
            const isSelected =
              activeTag.toLowerCase() === cleanTag.toLowerCase() ||
              activeTag.toLowerCase() === tag.toLowerCase();

            return (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(isSelected ? '' : cleanTag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-gray-200/70 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300 hover:bg-gray-300/80 dark:hover:bg-gray-700'
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
