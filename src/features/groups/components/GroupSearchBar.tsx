import React from 'react';
import { Search, Plus, Sparkles } from 'lucide-react';
import Button from '../../../components/ui/Button';

const GroupSearchBar = ({
  search,
  onSearchChange,
  onSearchSubmit,
  activeTab,
  onTabChange,
  onOpenCreate,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <form onSubmit={onSearchSubmit} className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search foodie groups by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#e02f21]"
          />
        </form>

        {/* Create Group Button */}
        <Button
          onClick={onOpenCreate}
          className="py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus size={16} />
          <span>Create New Group</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
        <button
          type="button"
          onClick={() => onTabChange('ALL')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'ALL'
              ? 'bg-[#e02f21] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
          }`}
        >
          Discover Groups
        </button>
        <button
          type="button"
          onClick={() => onTabChange('MY')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'MY'
              ? 'bg-[#e02f21] text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
          }`}
        >
          My Groups
        </button>
      </div>
    </div>
  );
};

export default GroupSearchBar;

