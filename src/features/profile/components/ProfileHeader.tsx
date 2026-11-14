import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import {
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  Plus,
  Edit3,
  Settings as SettingsIcon,
  UserPlus,
  UserCheck,
  UserX,
  MessageCircle,
  ChevronDown,
  ShieldAlert,
  Clock,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import defaultUserAvatar from "../../../assets/user-image.png";
import { useToast } from "../../../context/ToastContext";

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  friendsCount?: number;
  mutualCount?: number;
  relationshipStatus?: "NONE" | "FRIENDS" | "REQUEST_SENT" | "REQUEST_RECEIVED" | "SELF" | "BLOCKED" | "BLOCKING";
  onViewFriends?: () => void;
  onSendFriendRequest?: () => void;
  onCancelFriendRequest?: () => void;
  onAcceptFriendRequest?: () => void;
  onDeclineFriendRequest?: () => void;
  onUnfriend?: () => void;
  onBlock?: () => void;
  onMessage?: () => void;
  onOpenEditModal?: () => void;
  onOpenCreateRecipe?: () => void;
  onUpdateCover?: (file: File) => void;
  onUpdateAvatar?: (file: File) => void;
  uploadingCover?: boolean;
  uploadingAvatar?: boolean;
  isActionLoading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  friendsCount = 0,
  mutualCount = 0,
  relationshipStatus = "NONE",
  onViewFriends,
  onSendFriendRequest,
  onCancelFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onUnfriend,
  onBlock,
  onMessage,
  onOpenEditModal,
  onOpenCreateRecipe,
  onUpdateCover,
  onUpdateAvatar,
  uploadingCover,
  uploadingAvatar,
  isActionLoading = false,
}) => {
  const { notify } = useToast();
  const [isFriendsMenuOpen, setIsFriendsMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const friendsMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (friendsMenuRef.current && !friendsMenuRef.current.contains(e.target as Node)) {
        setIsFriendsMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateAvatar) {
      onUpdateAvatar(file);
    }
    e.target.value = "";
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateCover) {
      onUpdateCover(file);
    }
    e.target.value = "";
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsMoreMenuOpen(false);
    notify.success("Profile link copied to clipboard!");
  };

  return (
    <div className="w-full bg-white dark:bg-[#242526] shadow-xs">
      <div className="max-w-[1250px] mx-auto px-0 sm:px-6">
        {/* 1. Cover Image Container */}
        <div className="relative w-full h-48 sm:h-72 md:h-80 lg:h-96 rounded-b-none sm:rounded-b-2xl overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 group">
          <img
            src={
              profile.coverImage ||
              "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400"
            }
            alt="Cover"
            className="w-full h-full object-cover"
          />

          {isOwnProfile && (
            <label
              htmlFor="cover-upload"
              className="absolute bottom-4 right-4 bg-white/95 hover:bg-white dark:bg-[#242526]/90 dark:hover:bg-[#242526] text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition flex items-center gap-2 backdrop-blur-xs"
            >
              <Camera size={16} />
              <span>
                {uploadingCover ? "Uploading..." : "Edit cover photo"}
              </span>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                disabled={uploadingCover}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* 2. Profile Details & Action Bar */}
        <div className="relative px-4 sm:px-8 pb-5 pt-0 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6">
            {/* Left: Avatar (overlaps cover) + Info block */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              {/* Avatar with Camera Overlay */}
              <div className="-mt-16 sm:-mt-20 md:-mt-24 shrink-0 relative z-10">
                {/* Circular Avatar Container */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full ring-4 ring-white dark:ring-[#242526] overflow-hidden bg-white dark:bg-gray-800 shadow-xl">
                  <img
                    src={profile.image || defaultUserAvatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Camera upload badge - placed ON TOP of avatar ring at bottom right */}
                {isOwnProfile && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2 sm:p-2.5 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-md cursor-pointer transition ring-3 ring-white dark:ring-[#242526] z-20 flex items-center justify-center hover:scale-110 active:scale-95"
                    title="Update profile picture"
                  >
                    <Camera size={18} />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Profile Names, Friends Count & Details (Clean Facebook hierarchy) */}
              <div className="pt-2 sm:pt-4 pb-1 space-y-1.5 min-w-0">
                {/* Line 1: Name */}
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {profile.name}
                  </h1>
                </div>

                {/* Line 2: Friends Count (Clickable) */}
                <div className="flex items-center justify-center sm:justify-start text-sm sm:text-base text-gray-500 dark:text-gray-400 font-semibold">
                  <button
                    type="button"
                    onClick={onViewFriends}
                    className="hover:underline hover:text-gray-900 dark:hover:text-white transition cursor-pointer text-left inline-flex items-center gap-1.5"
                    title="View friends"
                  >
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      {friendsCount}
                    </span>{" "}
                    <span>{friendsCount === 1 ? "friend" : "friends"}</span>
                    {mutualCount > 0 && !isOwnProfile && (
                      <span className="text-gray-500 font-medium ml-1">
                        • {mutualCount} mutual
                      </span>
                    )}
                  </button>
                </div>

                {/* Line 3: Meta details row with bullet separators */}
                <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-2.5 flex-wrap text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium pt-0.5">
                  {profile.city && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} className="text-[#e02f21] shrink-0" />
                      <span>Lives in <strong className="font-semibold text-gray-800 dark:text-gray-200">{profile.city}</strong></span>
                    </span>
                  )}
                  {profile.work && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Briefcase size={14} className="text-gray-400 shrink-0" />
                        <span>{profile.work}</span>
                      </span>
                    </>
                  )}
                  {profile.education && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <GraduationCap size={14} className="text-gray-400 shrink-0" />
                        <span>{profile.education}</span>
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {profile.username
                      ? `@${profile.username}`
                      : `@${profile.name.toLowerCase().replace(/\s+/g, "_")}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-2.5 pb-1 shrink-0 flex-wrap">
              {isOwnProfile ? (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    icon={Plus}
                    onClick={onOpenCreateRecipe}
                    className="rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 font-bold text-sm shadow-xs"
                  >
                    Post Recipe
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    icon={Edit3}
                    onClick={onOpenEditModal}
                    className="rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 font-bold text-sm shadow-xs"
                  >
                    Edit profile
                  </Button>

                  {/* More Options Dropdown */}
                  <div className="relative" ref={moreMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsMoreMenuOpen((v) => !v)}
                      className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition shadow-xs cursor-pointer"
                      title="More options"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {isMoreMenuOpen && (
                      <div className="absolute right-0 top-12 z-30 w-52 bg-white dark:bg-[#242526] rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl p-1.5 space-y-0.5 animate-in fade-in duration-150">
                        <Link
                          to="/settings"
                          onClick={() => setIsMoreMenuOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition"
                        >
                          <SettingsIcon size={16} />
                          <span>Account Settings</span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleCopyProfileLink}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition"
                        >
                          <Share2 size={16} />
                          <span>Copy link to profile</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 relative flex-wrap justify-center sm:justify-end">
                  {/* 1. When Friends -> Show [Friends ▾] dropdown with Unfriend & Block */}
                  {relationshipStatus === "FRIENDS" && (
                    <div className="relative" ref={friendsMenuRef}>
                      <Button
                        variant="secondary"
                        size="md"
                        loading={isActionLoading}
                        disabled={isActionLoading}
                        onClick={() => setIsFriendsMenuOpen((v) => !v)}
                        className="rounded-xl px-4 py-2 font-bold text-sm flex items-center gap-2 shadow-xs active:scale-[0.98]"
                      >
                        <UserCheck size={18} className="text-emerald-600" />
                        <span>Friends</span>
                        <ChevronDown size={14} />
                      </Button>

                      {isFriendsMenuOpen && (
                        <div className="absolute right-0 top-12 z-30 w-48 bg-white dark:bg-[#242526] rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl p-1.5 space-y-0.5 animate-in fade-in duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              setIsFriendsMenuOpen(false);
                              if (onUnfriend) onUnfriend();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition"
                          >
                            <UserX size={15} />
                            <span>Unfriend</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsFriendsMenuOpen(false);
                              if (onBlock) onBlock();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition"
                          >
                            <ShieldAlert size={15} />
                            <span>Block</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. When Request Sent -> Show [Cancel Request] */}
                  {relationshipStatus === "REQUEST_SENT" && (
                    <Button
                      variant="secondary"
                      size="md"
                      loading={isActionLoading}
                      icon={isActionLoading ? undefined : Clock}
                      onClick={onCancelFriendRequest}
                      disabled={isActionLoading}
                      className="rounded-xl px-4 py-2 font-bold text-sm flex items-center gap-1.5 shadow-xs bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 active:scale-[0.98]"
                    >
                      Cancel Request
                    </Button>
                  )}

                  {/* 3. When Request Received -> Show [Accept] and [Decline] */}
                  {relationshipStatus === "REQUEST_RECEIVED" && (
                    <>
                      <Button
                        variant="primary"
                        size="md"
                        loading={isActionLoading}
                        icon={isActionLoading ? undefined : UserCheck}
                        onClick={onAcceptFriendRequest}
                        disabled={isActionLoading}
                        className="rounded-xl px-4 py-2 font-bold text-sm flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={onDeclineFriendRequest}
                        disabled={isActionLoading}
                        className="rounded-xl px-4 py-2 font-bold text-sm shadow-xs active:scale-[0.98]"
                      >
                        Decline
                      </Button>
                    </>
                  )}

                  {/* 4. When Not Friends -> Show [+ Add Friend] */}
                  {relationshipStatus === "NONE" && (
                    <Button
                      variant="primary"
                      size="md"
                      loading={isActionLoading}
                      icon={isActionLoading ? undefined : UserPlus}
                      onClick={onSendFriendRequest}
                      disabled={isActionLoading}
                      className="rounded-xl px-4 py-2 font-bold text-sm shadow-xs active:scale-[0.98]"
                    >
                      Add Friend
                    </Button>
                  )}

                  {/* Message Button (Facebook Blue #1877f2) */}
                  <Button
                    variant="primary"
                    size="md"
                    icon={MessageCircle}
                    onClick={onMessage}
                    className="rounded-xl px-4 py-2 font-bold text-sm shadow-xs active:scale-[0.98] bg-[#1877f2] hover:bg-[#166fe5] border-transparent text-white"
                  >
                    Message
                  </Button>

                  {/* More Options Dropdown for visitor */}
                  <div className="relative" ref={moreMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsMoreMenuOpen((v) => !v)}
                      className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition shadow-xs cursor-pointer"
                      title="More options"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {isMoreMenuOpen && (
                      <div className="absolute right-0 top-12 z-30 w-52 bg-white dark:bg-[#242526] rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl p-1.5 space-y-0.5 animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={handleCopyProfileLink}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition"
                        >
                          <Share2 size={16} />
                          <span>Copy link to profile</span>
                        </button>
                        {onBlock && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsMoreMenuOpen(false);
                              onBlock();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition"
                          >
                            <ShieldAlert size={16} />
                            <span>Block user</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
