import React from 'react';
import { Link } from 'react-router';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import {
  Camera,
  Edit3,
  Settings as SettingsIcon,
  Plus,
  Check,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
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
    <div className="bg-white dark:bg-[#242526] rounded-b-2xl shadow-xs border-b border-gray-200 dark:border-gray-800">
      {/* 1. Cover Photo Banner (Matching Image 2) */}
      <div className="relative h-60 sm:h-80 md:h-96 w-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-600 overflow-hidden sm:rounded-b-2xl">
        <img
          src={
            profile.coverImage ||
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400'
          }
          alt={profile.name}
          className="w-full h-full object-cover"
        />

        {/* Edit Cover Photo Button (Bottom-Right, Matching Image 2) */}
        {isOwnProfile && (
          <label className="absolute bottom-4 right-4 bg-white/90 hover:bg-white dark:bg-[#242526]/90 dark:hover:bg-[#242526] text-gray-900 dark:text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-2 backdrop-blur-xs">
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

      {/* 2. Profile Details & Avatar Bar */}
      <div className="max-w-[1150px] mx-auto px-4 sm:px-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 sm:-mt-24 relative z-10">
          {/* Left: Avatar + Names */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            {/* Avatar with Camera Button */}
            <div className="relative self-center sm:self-auto inline-block">
              <img
                src={
                  profile.image ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                }
                alt={profile.name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-white dark:ring-[#242526] shadow-xl bg-white"
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

            {/* User Title, Handle & Quick Meta */}
            <div className="text-center sm:text-left space-y-1 mb-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  {profile.name}
                </h1>
                {profile.role && profile.role !== 'USER' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#e02f21] text-white tracking-wider">
                    {profile.role}
                  </span>
                )}
              </div>

              {/* Username & Follower stats */}
              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-gray-500 font-semibold">
                <span className="text-gray-700 dark:text-gray-300 font-bold">
                  {profile.username ? `@${profile.username}` : `@${profile.name.toLowerCase().replace(/\s+/g, '_')}`}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-gray-900 dark:text-white">{followersCount}</strong> friends / followers
                </span>
              </div>

              {/* Quick Details Line (Matching Image 2) */}
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap text-xs text-gray-500 dark:text-gray-400 pt-0.5">
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {profile.city}
                  </span>
                )}
                {profile.work && (
                  <span className="flex items-center gap-1">
                    • <Briefcase size={12} /> {profile.work}
                  </span>
                )}
                {profile.education && (
                  <span className="flex items-center gap-1">
                    • <GraduationCap size={12} /> {profile.education}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action Buttons (Matching Image 2: + Add to story / recipe, Edit profile, Settings) */}
          <div className="flex items-center justify-center sm:justify-end gap-2.5 pb-2">
            {isOwnProfile ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={onOpenCreateRecipe}
                >
                  Post Recipe
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit3}
                  onClick={onOpenEditModal}
                >
                  Edit profile
                </Button>

                <Link
                  to="/settings"
                  title="Account Settings"
                  className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
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

