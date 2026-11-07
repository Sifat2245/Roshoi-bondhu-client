import React from 'react';
import { Link } from 'react-router';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import {
  Camera,
  Edit3,
  Settings as SettingsIcon,
  Plus,
  Check,
  MapPin,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

const ProfileHeader = ({
  profile,
  isOwnProfile,
  isFollowing,
  followersCount,
  onFollowToggle,
  onOpenEditModal,
  onOpenCreateRecipe,
  onUpdateCover,
  onUpdateAvatar,
  uploadingCover,
  uploadingAvatar,
}) => {
  return (
    <div className="w-full bg-white dark:bg-[#242526] shadow-xs">
      {/* 1. Contained Cover Photo Banner (NOT full width - matching Facebook in Image 2) */}
      <div className="w-full bg-gradient-to-b from-gray-200/50 via-gray-100/30 to-transparent dark:from-black/40 dark:via-[#18191a]/40 dark:to-transparent pt-0 sm:pt-4">
        <div className="max-w-[1095px] mx-auto px-0 sm:px-4">
          <div className="relative h-60 sm:h-80 md:h-[360px] lg:h-[380px] w-full bg-gray-200 dark:bg-gray-800 overflow-hidden sm:rounded-2xl shadow-sm">
            <img
              src={
                profile.coverImage ||
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400'
              }
              alt={profile.name}
              className="w-full h-full object-cover"
            />

            {/* Edit Cover Photo Button (Bottom-Right, matching Facebook Image 2) */}
            {isOwnProfile && (
              <label className="absolute bottom-4 right-4 bg-white/95 hover:bg-white dark:bg-[#242526]/95 dark:hover:bg-[#242526] text-gray-900 dark:text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-2 backdrop-blur-xs select-none">
                <Camera size={16} />
                <span>{uploadingCover ? 'Uploading...' : 'Edit cover photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingCover}
                  onChange={(e) => onUpdateCover && onUpdateCover(e.target.files?.[0])}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* 2. Profile Details & Overlapping Avatar Row */}
      <div className="max-w-[1095px] mx-auto px-4 sm:px-8 pb-3">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 sm:-mt-24 relative z-10">
          {/* Left: Overlapping Avatar + Names */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Avatar with Camera Button */}
            <div className="relative self-center sm:self-auto inline-block">
              <img
                src={
                  profile.image ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                }
                alt={profile.name}
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover ring-4 sm:ring-[5px] ring-white dark:ring-[#242526] shadow-xl bg-white"
              />

              {isOwnProfile && (
                <label
                  title="Change profile picture"
                  className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center shadow-md cursor-pointer transition ring-2 ring-white dark:ring-[#242526]"
                >
                  <Camera size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingAvatar}
                    onChange={(e) => onUpdateAvatar && onUpdateAvatar(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>

            {/* User Title, Username & Meta Line */}
            <div className="text-center sm:text-left space-y-1 mb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  {profile.name}
                </h1>
                {profile.role && profile.role !== 'USER' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#e02f21] text-white tracking-wider">
                    {profile.role}
                  </span>
                )}
              </div>

              {/* Username & Follower Count */}
              <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs text-gray-500 font-semibold flex-wrap">
                <span className="text-gray-700 dark:text-gray-300 font-bold">
                  {profile.username
                    ? `@${profile.username}`
                    : `@${profile.name.toLowerCase().replace(/\s+/g, '_')}`}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-gray-900 dark:text-white">{followersCount}</strong> friends / followers
                </span>
              </div>

              {/* Meta details (Lives in, Work, Education) */}
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap text-xs text-gray-500 dark:text-gray-400 pt-0.5">
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {profile.city}
                  </span>
                )}
                {profile.work && (
                  <span className="flex items-center gap-1">
                    • <Briefcase size={13} /> {profile.work}
                  </span>
                )}
                {profile.education && (
                  <span className="flex items-center gap-1">
                    • <GraduationCap size={13} /> {profile.education}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action Buttons (Matching Image 2: + Post Recipe, Edit profile, Settings) */}
          <div className="flex items-center justify-center sm:justify-end gap-2.5 pb-2">
            {isOwnProfile ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={onOpenCreateRecipe}
                  className="rounded-xl px-4 py-2 font-bold text-xs"
                >
                  Post Recipe
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit3}
                  onClick={onOpenEditModal}
                  className="rounded-xl px-4 py-2 font-bold text-xs"
                >
                  Edit profile
                </Button>

                <Link
                  to="/settings"
                  title="Account Settings"
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
                >
                  <SettingsIcon size={18} />
                </Link>
              </>
            ) : (
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                size="sm"
                icon={isFollowing ? Check : Plus}
                onClick={onFollowToggle}
                className="rounded-xl px-5 py-2 font-bold text-xs"
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
