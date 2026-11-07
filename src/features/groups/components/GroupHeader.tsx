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
      {/* 1. Contained Cover Image Banner (Matching Image 3) */}
      <div className="w-full bg-gradient-to-b from-gray-200/50 via-gray-100/30 to-transparent dark:from-black/40 dark:via-[#18191a]/40 dark:to-transparent pt-0 sm:pt-4">
        <div className="max-w-[1095px] mx-auto px-0 sm:px-4">
          <div className="relative h-48 sm:h-72 md:h-80 w-full bg-gray-200 dark:bg-gray-800 relative sm:rounded-2xl overflow-hidden shadow-sm">
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
      <div className="max-w-[1095px] mx-auto px-4 sm:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {group.name}
            </h1>

            {/* Subtitle Line */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1 font-semibold">
                {group.privacy === 'PRIVATE' ? <Lock size={12} /> : <Globe size={12} />}
                {group.privacy === 'PRIVATE' ? 'Private group' : 'Public group'}
              </span>
              <span>•</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {group.membersCount || 1} members
              </span>
            </div>

            {/* Facebook Member Avatars Cluster (Matching Image 3!) */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex -space-x-2 overflow-hidden py-1">
                {avatarCluster.slice(0, 8).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Member"
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#242526] object-cover"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons (Matching Image 3: + Invite, Share, Joined ▾, ...) */}
          <div className="flex items-center gap-2 flex-wrap">
            {isMember && (
              <Button
                onClick={handleInvite}
                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <UserPlus size={15} />
                <span>Invite</span>
              </Button>
            )}

            <Button
              onClick={handleShare}
              variant="secondary"
              className="px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Share2 size={15} />
              <span>Share</span>
            </Button>

            <Button
              onClick={handleAction}
              loading={loading}
              variant={isMember ? 'secondary' : 'primary'}
              className="px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              {isMember ? (
                <>
                  <Check size={14} className="text-emerald-500" />
                  <span>Joined ▾</span>
                </>
              ) : (
                <span>Join Group</span>
              )}
            </Button>

            <button
              type="button"
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* 3. Navigation Tabs (Matching Image 3: About, Discussion, Featured, Recipes, Members, Media) */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 mt-5 pt-1 text-xs font-bold overflow-x-auto">
          <div className="flex items-center gap-1">
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
                className={`px-4 py-3 border-b-3 transition cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#6366f1] text-[#6366f1]'
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
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition"
              title="Search this group"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;

