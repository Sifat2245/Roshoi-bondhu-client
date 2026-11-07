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
      {/* 1. Contained Cover Photo Banner (Wider Facebook Desktop Container) */}
      <div className="w-full bg-gradient-to-b from-gray-200/50 via-gray-100/30 to-transparent dark:from-black/40 dark:via-[#18191a]/40 dark:to-transparent pt-0 sm:pt-4">
        <div className="max-w-[1250px] mx-auto px-0 sm:px-4">
          <div className="relative h-64 sm:h-80 md:h-[380px] lg:h-[420px] w-full bg-gray-200 dark:bg-gray-800 overflow-hidden sm:rounded-2xl shadow-sm">
            <img
              src={
                profile.coverImage ||
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400'
              }
              alt={profile.name}
              className="w-full h-full object-cover"
            />

            {/* Edit Cover Photo Button */}
            {isOwnProfile && (
              <label className="absolute bottom-4 right-4 bg-white/95 hover:bg-white dark:bg-[#242526]/95 dark:hover:bg-[#242526] text-gray-900 dark:text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition flex items-center gap-2 backdrop-blur-xs select-none">
                <Camera size={18} />
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

      {/* 2. Profile Details & Overlapping Avatar Row with Generous Spacing */}
      <div className="max-w-[1250px] mx-auto px-4 sm:px-8 pb-8 sm:pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 pt-4 sm:pt-6">
          {/* Left: Overlapping Avatar + Names with Ample Breathing Room Above the Name */}
          <div className="flex flex-col sm:flex-row sm:items-start md:items-center gap-6 sm:gap-8">
            {/* Avatar with Camera Button - Negative margin ONLY on Avatar to overlap cover photo */}
            <div className="relative self-center sm:self-auto inline-block -mt-16 sm:-mt-24 md:-mt-28 shrink-0">
              <img
                src={
                  profile.image ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                }
                alt={profile.name}
                className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full object-cover ring-4 sm:ring-[6px] ring-white dark:ring-[#242526] shadow-xl bg-white"
              />

              {isOwnProfile && (
                <label
                  title="Change profile picture"
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center shadow-md cursor-pointer transition ring-2 ring-white dark:ring-[#242526]"
                >
                  <Camera size={20} />
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

            {/* User Title, Username & Meta Line - Generous Spacing & High Gap at the Top of the Name */}
            <div className="text-center sm:text-left space-y-2.5 mt-2 sm:mt-10 md:mt-14 mb-2">
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                  {profile.name}
                </h1>
                {profile.role && profile.role !== 'USER' && (
                  <span className="text-xs sm:text-sm font-black uppercase px-3 py-1 rounded-full bg-[#e02f21] text-white tracking-wider shadow-xs">
                    {profile.role}
                  </span>
                )}
              </div>

              {/* Username & Follower Count */}
              <div className="flex items-center justify-center sm:justify-start gap-3 text-sm sm:text-base text-gray-500 font-semibold flex-wrap">
                <span className="text-gray-800 dark:text-gray-200 font-bold">
                  {profile.username
                    ? `@${profile.username}`
                    : `@${profile.name.toLowerCase().replace(/\s+/g, '_')}`}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-gray-900 dark:text-white font-bold">{followersCount}</strong> friends / followers
                </span>
              </div>

              {/* Meta details (Lives in, Work, Education) */}
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium pt-1">
                {profile.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={18} className="text-[#e02f21]" /> {profile.city}
                  </span>
                )}
                {profile.work && (
                  <span className="flex items-center gap-1.5">
                    • <Briefcase size={18} className="text-gray-400" /> {profile.work}
                  </span>
                )}
                {profile.education && (
                  <span className="flex items-center gap-1.5">
                    • <GraduationCap size={18} className="text-gray-400" /> {profile.education}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action Buttons with Enhanced Text and Sizing */}
          <div className="flex items-center justify-center sm:justify-end gap-3 pt-3 md:mt-10 pb-2">
            {isOwnProfile ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  icon={Plus}
                  onClick={onOpenCreateRecipe}
                  className="rounded-xl px-5 py-2.5 font-bold text-sm sm:text-base shadow-sm"
                >
                  Post Recipe
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  icon={Edit3}
                  onClick={onOpenEditModal}
                  className="rounded-xl px-5 py-2.5 font-bold text-sm sm:text-base shadow-sm"
                >
                  Edit profile
                </Button>

                <Link
                  to="/settings"
                  title="Account Settings"
                  className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition shadow-xs"
                >
                  <SettingsIcon size={20} />
                </Link>
              </>
            ) : (
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                size="md"
                icon={isFollowing ? Check : Plus}
                onClick={onFollowToggle}
                className="rounded-xl px-6 py-2.5 font-bold text-sm sm:text-base shadow-sm"
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
