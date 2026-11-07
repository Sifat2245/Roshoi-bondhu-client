import React, { useState } from 'react';
import {
  Users,
  Lock,
  Globe,
  Check,
  UserPlus,
  Share2,
  MoreHorizontal,
  Search,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';

const GroupHeader = ({
  group,
  activeTab,
  onSelectTab,
  onJoinToggle,
  isMember,
  isAdmin,
}) => {
  const [loading, setLoading] = useState(false);
  const { notify } = useToast();

  const handleAction = async () => {
    setLoading(true);
    try {
      await onJoinToggle();
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    notify.success('Group link copied to clipboard!');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    notify.success('Group link copied to clipboard!');
  };

  // Mock members for avatar cluster matching Image 3
  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
  ];

  const groupMembers = group.members?.map((m) => m.user?.image).filter(Boolean) || [];
  const avatarCluster = groupMembers.length >= 3 ? groupMembers : sampleAvatars;

  return (
    <div className="w-full bg-white dark:bg-[#242526] shadow-xs border-b border-gray-200 dark:border-gray-800">
      {/* 1. Contained Cover Image Banner */}
      <div className="w-full bg-gradient-to-b from-gray-200/50 via-gray-100/30 to-transparent dark:from-black/40 dark:via-[#18191a]/40 dark:to-transparent pt-0 sm:pt-4">
        <div className="max-w-[1250px] mx-auto px-0 sm:px-4">
          <div className="relative h-56 sm:h-72 md:h-84 w-full bg-gray-200 dark:bg-gray-800 relative sm:rounded-2xl overflow-hidden shadow-sm">
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
        </div>
      </div>

      {/* 2. Group Info, Member Avatar Cluster, Action Buttons */}
      <div className="max-w-[1250px] mx-auto px-4 sm:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2.5">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              {group.name}
            </h1>

            {/* Subtitle Line */}
            <div className="flex items-center gap-2.5 text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1.5 font-bold">
                {group.privacy === 'PRIVATE' ? <Lock size={15} /> : <Globe size={15} />}
                {group.privacy === 'PRIVATE' ? 'Private group' : 'Public group'}
              </span>
              <span>•</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">
                {group.membersCount || 1} members
              </span>
            </div>

            {/* Member Avatars Cluster */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex -space-x-2 overflow-hidden py-1">
                {avatarCluster.slice(0, 8).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Member"
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#242526] object-cover"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isMember && (
              <Button
                onClick={handleInvite}
                className="bg-[#e02f21] hover:bg-[#c92518] text-white px-5 py-2.5 text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <UserPlus size={17} />
                <span>Invite</span>
              </Button>
            )}

            <Button
              onClick={handleShare}
              variant="secondary"
              className="px-5 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <Share2 size={17} />
              <span>Share</span>
            </Button>

            <Button
              onClick={handleAction}
              loading={loading}
              variant={isMember ? 'secondary' : 'primary'}
              className="px-5 py-2.5 text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer"
            >
              {isMember ? (
                <>
                  <Check size={16} className="text-emerald-500" />
                  <span>Joined ▾</span>
                </>
              ) : (
                <span>Join Group</span>
              )}
            </Button>

            <button
              type="button"
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 mt-6 pt-1 text-sm sm:text-base font-bold overflow-x-auto">
          <div className="flex items-center gap-2">
            {[
              { id: 'DISCUSSION', label: 'Discussion' },
              { id: 'FEATURED', label: 'Featured' },
              { id: 'ABOUT', label: 'About' },
              { id: 'MEMBERS', label: 'Members' },
              ...(isAdmin ? [{ id: 'SETTINGS', label: 'Settings' }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`px-4 py-3.5 border-b-3 transition cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#e02f21] text-[#e02f21]'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-t-lg'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition cursor-pointer"
              title="Search this group"
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;

