import React, { useState } from 'react';
import { Users, Lock, Globe, Check, UserPlus, Share2, Settings } from 'lucide-react';
import Button from '../ui/Button';

const GroupHeader = ({
  group,
  user,
  activeTab,
  onSelectTab,
  onJoinToggle,
  isMember,
  isAdmin,
}) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      await onJoinToggle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#242526] rounded-b-2xl shadow-sm border-b border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Cover Image */}
      <div className="h-48 sm:h-72 w-full bg-gray-200 dark:bg-gray-800 relative">
        {group.coverImage ? (
          <img
            src={group.coverImage}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-red-600/30 to-orange-500/30">
            <Users size={64} className="text-[#e02f21]/40" />
          </div>
        )}
      </div>

      {/* Group Title & Details */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {group.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1 font-semibold">
                {group.privacy === 'PRIVATE' ? <Lock size={12} /> : <Globe size={12} />}
                {group.privacy === 'PRIVATE' ? 'Private Group' : 'Public Group'}
              </span>
              <span>•</span>
              <span>{group.membersCount || 1} members</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAction}
              loading={loading}
              variant={isMember ? 'outline' : 'primary'}
              className="px-5 py-2.5 text-xs font-bold rounded-xl"
            >
              {isMember ? (
                <span className="flex items-center gap-1.5">
                  <Check size={14} /> Joined
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <UserPlus size={14} /> Join Group
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-gray-100 dark:border-gray-800 mt-5 pt-1 text-xs font-bold overflow-x-auto">
          {[
            { id: 'DISCUSSION', label: 'Discussion' },
            { id: 'ABOUT', label: 'About' },
            { id: 'MEMBERS', label: 'Members' },
            ...(isAdmin ? [{ id: 'SETTINGS', label: 'Settings' }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`px-4 py-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#e02f21] text-[#e02f21]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-t-lg'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;

