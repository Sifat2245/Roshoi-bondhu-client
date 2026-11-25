import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import { useToast } from '../../context/ToastContext';
import groupsApi from '../../features/groups/api/groups.api';
import { useInvalidateGroupQueries } from '../../features/groups/hooks/useGroupQueries';
import { useFriendsQuery } from '../../features/friends/hooks/useFriendsQueries';
import type { Friend } from '../../features/friends/types/friends.types';
import Avatar from '../../components/ui/Avatar';
import defaultGroupCover from '../../assets/group/group-default.png';
import {
  X,
  Globe,
  Lock,
  ChevronDown,
  Monitor,
  Smartphone,
  Users,
  Image as ImageIcon,
  Smile,
  Video,
  Search,
  Check,
  Loader2,
  UserPlus,
} from 'lucide-react';

const CreateGroupPage: React.FC = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { notify } = useToast();
  const { invalidateAllGroups } = useInvalidateGroupQueries();
  const currentUser = session?.user;
  const token = session?.session?.token;

  // Form states
  const [groupName, setGroupName] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [description, setDescription] = useState('');
  const [invitedFriends, setInvitedFriends] = useState<Friend[]>([]);
  const [friendInput, setFriendInput] = useState('');
  const [debouncedFriendSearch, setDebouncedFriendSearch] = useState('');
  const [isFriendsDropdownOpen, setIsFriendsDropdownOpen] = useState(false);
  const [hasOpenedFriendsDropdown, setHasOpenedFriendsDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const friendPickerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Preview Mode: 'DESKTOP' | 'MOBILE'
  const [previewMode, setPreviewMode] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');

  // Debounce search text for GraphQL friends query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFriendSearch(friendInput.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [friendInput]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (friendPickerRef.current && !friendPickerRef.current.contains(event.target as Node)) {
        setIsFriendsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll dropdown into view inside the sidebar form when opened
  useEffect(() => {
    if (isFriendsDropdownOpen) {
      requestAnimationFrame(() => {
        dropdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [isFriendsDropdownOpen]);

  // Fetch user's friends from GraphQL GET API once dropdown is opened
  const {
    data: friendsList = [],
    isLoading: isLoadingFriends,
    isFetching: isFetchingFriends,
  } = useFriendsQuery(token, debouncedFriendSearch, currentUser?.id, {
    enabled: hasOpenedFriendsDropdown && Boolean(currentUser?.id),
  });

  const displayedFriends = useMemo(() => {
    const q = friendInput.trim().toLowerCase();
    if (!q) return friendsList;
    return friendsList.filter(
      (f) =>
        (f.name || '').toLowerCase().includes(q) ||
        (f.username || '').toLowerCase().includes(q)
    );
  }, [friendsList, friendInput]);

  const invitedIds = useMemo(() => new Set(invitedFriends.map((f) => f.id)), [invitedFriends]);

  const handleToggleFriend = (friend: Friend) => {
    if (invitedIds.has(friend.id)) {
      setInvitedFriends((prev) => prev.filter((f) => f.id !== friend.id));
    } else {
      setInvitedFriends((prev) => [...prev, friend]);
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    setInvitedFriends((prev) => prev.filter((f) => f.id !== friendId));
  };

  const handleOpenFriendsDropdown = () => {
    setHasOpenedFriendsDropdown(true);
    setIsFriendsDropdownOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      notify.error('Please enter a group name');
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await groupsApi.createGroup(
        {
          name: groupName.trim(),
          description: description.trim() || `Welcome to ${groupName.trim()}! A community for passionate cooks and food lovers on Heshel.`,
          privacy,
          invitedUserIds: invitedFriends.map((f) => f.id),
        },
        session?.session?.token
      );

      notify.success('Group created successfully!');
      invalidateAllGroups();
      const slug = res?.slug || res?.data?.slug || groupName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      navigate(`/group/${slug}`);
    } catch (err: any) {
      notify.error(err.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-dvh w-full flex flex-col md:flex-row bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      {/* LEFT COLUMN: Sidebar Form (Matching Image 3) */}
      <aside className="w-full md:w-[380px] lg:w-[420px] shrink-0 bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-gray-800 flex flex-col h-full shadow-lg z-20">
        {/* Top Header Row with Close & Heshel Logo */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/groups')}
              title="Close and return to groups"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-200 transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-[#e02f21] flex items-center justify-center text-white font-black text-xl shadow-xs">
                হ
              </span>
              <span className="font-black text-xl text-[#e02f21] tracking-tight">Heshel</span>
            </Link>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Breadcrumb & Title */}
          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold mb-1.5">
              <Link to="/groups" className="hover:underline">Groups</Link>
              <span>›</span>
              <span className="text-gray-700 dark:text-gray-300">Create group</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Create group
            </h1>
          </div>

          {/* User Profile Row (Admin) */}
          <div className="flex items-center gap-3.5">
            <Avatar src={currentUser?.image} alt={currentUser?.name} size="md" />
            <div>
              <p className="font-bold text-base text-gray-900 dark:text-white leading-snug">
                {currentUser?.name || 'Chef Sifat'}
              </p>
              <p className="text-sm text-gray-500 font-medium">Admin</p>
            </div>
          </div>

          {/* Field 1: Group Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
              Group name
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Secret Grandma Recipes, Bengali Sweet Tooth"
              className="w-full px-4 py-3.5 bg-white dark:bg-[#18191a] border border-gray-300 dark:border-gray-700 rounded-xl text-sm sm:text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e02f21] transition"
            />
          </div>

          <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="What will your cooking community share?" className="mt-2 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-sm font-normal resize-y" /></label>
          {/* Field 2: Privacy Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
              Choose privacy
            </label>
            <div className="relative">
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as 'PUBLIC' | 'PRIVATE')}
                className="w-full appearance-none px-4 py-3.5 bg-white dark:bg-[#18191a] border border-gray-300 dark:border-gray-700 rounded-xl text-sm sm:text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e02f21] pr-10 cursor-pointer transition"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
              <ChevronDown
                size={20}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 pt-1 leading-normal">
              {privacy === 'PUBLIC'
                ? 'Anyone can see who is in the group and what they post.'
                : 'Only members can see who is in the group and what they post.'}
            </p>
          </div>

          {/* Field 3: Invite Friends (GraphQL Friends Dropdown) */}
          <div className="space-y-2 pb-4" ref={friendPickerRef}>
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
              Invite friends (optional)
            </label>

            {/* Selected Friend Chips */}
            {invitedFriends.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-1">
                {invitedFriends.map((friend) => (
                  <span
                    key={friend.id}
                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-[#e02f21] text-xs sm:text-sm font-bold rounded-full border border-red-100 dark:border-red-900/40"
                  >
                    <Avatar src={friend.image} alt={friend.name} size="xs" />
                    <span className="max-w-[140px] truncate">{friend.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(friend.id)}
                      title={`Remove ${friend.name}`}
                      className="hover:text-red-800 dark:hover:text-red-300 cursor-pointer ml-0.5"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Searchable Friends Input */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={friendInput}
                onFocus={handleOpenFriendsDropdown}
                onClick={handleOpenFriendsDropdown}
                onChange={(e) => {
                  setFriendInput(e.target.value);
                  if (!isFriendsDropdownOpen) {
                    handleOpenFriendsDropdown();
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setIsFriendsDropdownOpen(false);
                  } else if (event.key === 'Enter') {
                    event.preventDefault();
                    if (displayedFriends.length > 0 && friendInput.trim()) {
                      const firstMatch =
                        displayedFriends.find((f) => !invitedIds.has(f.id)) || displayedFriends[0];
                      handleToggleFriend(firstMatch);
                      setFriendInput('');
                      setDebouncedFriendSearch('');
                    }
                  }
                }}
                placeholder="Type a friend's name to invite..."
                className="w-full pl-10 pr-16 py-3.5 bg-white dark:bg-[#18191a] border border-gray-300 dark:border-gray-700 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e02f21] transition"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {friendInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setFriendInput('');
                      setDebouncedFriendSearch('');
                    }}
                    title="Clear search"
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isFriendsDropdownOpen) {
                      setIsFriendsDropdownOpen(false);
                    } else {
                      handleOpenFriendsDropdown();
                    }
                  }}
                  aria-label="Toggle friends dropdown"
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${
                      isFriendsDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Friends Dropdown List */}
            {isFriendsDropdownOpen && (
              <div
                ref={dropdownRef}
                className="mt-1.5 bg-white dark:bg-[#18191a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="px-3.5 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-semibold text-gray-500">
                  <span>Your Friends</span>
                  {isFetchingFriends && (
                    <span className="inline-flex items-center gap-1 text-[#e02f21]">
                      <Loader2 size={12} className="animate-spin" />
                      <span>Searching...</span>
                    </span>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/70">
                  {!currentUser?.id ? (
                    <div className="py-6 px-4 text-center text-sm text-gray-500">
                      Please sign in to see your friends list.
                    </div>
                  ) : isLoadingFriends && displayedFriends.length === 0 ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-sm text-gray-400">
                      <Loader2 size={20} className="animate-spin text-[#e02f21]" />
                      <span>Loading friends...</span>
                    </div>
                  ) : displayedFriends.length > 0 ? (
                    displayedFriends.map((friend) => {
                      const isSelected = invitedIds.has(friend.id);
                      return (
                        <button
                          key={friend.id}
                          type="button"
                          onClick={() => handleToggleFriend(friend)}
                          className={`w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-red-50/70 dark:bg-red-950/25'
                              : 'hover:bg-gray-50 dark:hover:bg-[#242526]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar src={friend.image} alt={friend.name} size="sm" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {friend.name}
                              </p>
                              {(friend.username || friend.bio) && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {friend.username ? `@${friend.username}` : friend.bio}
                                </p>
                              )}
                            </div>
                          </div>

                          {isSelected ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e02f21] text-white text-xs font-bold shrink-0">
                              <Check size={13} />
                              <span>Invited</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-200 text-xs font-semibold shrink-0">
                              <UserPlus size={13} />
                              <span>Invite</span>
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : friendInput.trim() ? (
                    <div className="py-7 px-4 text-center text-sm text-gray-500 space-y-1">
                      <Users size={22} className="mx-auto text-gray-300 dark:text-gray-600" />
                      <p>No friends found matching &quot;{friendInput.trim()}&quot;</p>
                    </div>
                  ) : (
                    <div className="py-7 px-4 text-center text-sm text-gray-500 space-y-1">
                      <Users size={22} className="mx-auto text-gray-300 dark:text-gray-600" />
                      <p>No friends found in your friend list yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Fixed Bottom Action Button */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#242526]">
          <button
            type="button"
            disabled={!groupName.trim() || isSubmitting}
            onClick={handleSubmit}
            className="w-full py-4 bg-[#e02f21] hover:bg-[#c92518] text-white font-black text-base rounded-xl transition cursor-pointer disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            {isSubmitting ? 'Creating group...' : 'Create'}
          </button>
        </div>
      </aside>

      {/* RIGHT COLUMN: Interactive Live Preview (Matching Image 3) */}
      <main className="hidden md:flex min-w-0 flex-1 bg-[#f0f2f5] dark:bg-[#18191a] h-full overflow-y-auto p-4 sm:p-8 flex-col items-center">
        {/* Device Switcher Header */}
        <div className="w-full max-w-[940px] flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {previewMode === 'DESKTOP' ? 'Desktop Preview' : 'Mobile Preview'}
          </p>
          <div className="flex items-center gap-1 bg-white dark:bg-[#242526] p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
            <button
              type="button"
              onClick={() => setPreviewMode('DESKTOP')}
              title="Desktop preview"
              className={`p-2 rounded-lg transition cursor-pointer ${
                previewMode === 'DESKTOP'
                  ? 'bg-red-50 dark:bg-red-950/40 text-[#e02f21]'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              <Monitor size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('MOBILE')}
              title="Mobile preview"
              className={`p-2 rounded-lg transition cursor-pointer ${
                previewMode === 'MOBILE'
                  ? 'bg-red-50 dark:bg-red-950/40 text-[#e02f21]'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              <Smartphone size={18} />
            </button>
          </div>
        </div>

        {/* Live Mock Frame */}
        <div
          className={`w-full transition-all duration-300 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden ${
            previewMode === 'DESKTOP'
              ? 'max-w-[940px]'
              : 'max-w-[400px] ring-8 ring-gray-900/10 dark:ring-white/10 my-4'
          }`}
        >
          {/* Cover Art Banner (Defaulting to group-default.png) */}
          <div
            className={`relative w-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center ${
              previewMode === 'MOBILE' ? 'h-44 sm:h-48' : 'h-56 sm:h-72'
            }`}
          >
            <img
              src={defaultGroupCover}
              alt="Group cover preview"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Group Header Info */}
          <div
            className={`${
              previewMode === 'MOBILE' ? 'p-4 sm:p-5' : 'p-5 sm:p-7'
            } border-b border-gray-100 dark:border-gray-800`}
          >
            <h2
              className={`font-black text-gray-900 dark:text-white tracking-tight break-words ${
                previewMode === 'MOBILE' ? 'text-xl' : 'text-2xl sm:text-3xl'
              }`}
            >
              {groupName.trim() || 'Group name'}
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-semibold mt-1">
              <span className="flex items-center gap-1">
                {privacy === 'PUBLIC' ? <Globe size={14} /> : <Lock size={14} />}
                <span>{privacy === 'PUBLIC' ? 'Public group' : 'Private group'}</span>
              </span>
              <span>•</span>
              <span>
                {1 + invitedFriends.length}{' '}
                {invitedFriends.length === 0 ? 'member' : 'members'}
              </span>
            </div>
          </div>

          {/* Mock Navigation Tabs (Responsive with More ▾ on mobile) */}
          <div
            className={`${
              previewMode === 'MOBILE' ? 'px-4 sm:px-5' : 'px-5 sm:px-7'
            } border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 sm:gap-6 text-sm font-bold text-gray-500`}
          >
            <span className="py-3 border-b-3 border-[#e02f21] text-[#e02f21] whitespace-nowrap">About</span>
            <span className="py-3 whitespace-nowrap">Posts</span>
            {previewMode === 'MOBILE' ? (
              <span className="py-3 flex items-center gap-1 text-gray-600 dark:text-gray-400 whitespace-nowrap cursor-pointer">
                <span>More</span>
                <ChevronDown size={14} />
              </span>
            ) : (
              <>
                <span className="py-3.5 whitespace-nowrap">Members</span>
                <span className="py-3.5 whitespace-nowrap">Events</span>
              </>
            )}
          </div>

          {/* Mock Content Columns */}
          <div
            className={`bg-[#f0f2f5]/40 dark:bg-[#18191a]/40 ${
              previewMode === 'MOBILE'
                ? 'p-3.5 space-y-3.5 flex flex-col'
                : 'p-5 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-5'
            }`}
          >
            {/* Post Trigger: full width in mobile preview, 2 cols on desktop */}
            <div className={previewMode === 'MOBILE' ? 'w-full' : 'md:col-span-2 space-y-4'}>
              <div
                className={`bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs ${
                  previewMode === 'MOBILE' ? 'p-3 space-y-2.5' : 'p-4 space-y-3'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar src={currentUser?.image} alt="" size="sm" />
                  <div className="flex-1 bg-gray-100 dark:bg-[#3a3b3c] text-gray-400 rounded-full px-3.5 py-2 text-xs font-medium cursor-not-allowed truncate">
                    What's on your mind?
                  </div>
                </div>
                <div
                  className={`flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 font-semibold text-gray-500 ${
                    previewMode === 'MOBILE' ? 'text-[11px] px-1' : 'text-xs'
                  }`}
                >
                  <span className="flex items-center gap-1 opacity-70 whitespace-nowrap">
                    <Video size={previewMode === 'MOBILE' ? 14 : 16} className="text-red-500 shrink-0" />
                    <span>{previewMode === 'MOBILE' ? 'Live' : 'Live video'}</span>
                  </span>
                  <span className="flex items-center gap-1 opacity-70 whitespace-nowrap">
                    <ImageIcon size={previewMode === 'MOBILE' ? 14 : 16} className="text-green-500 shrink-0" />
                    <span>Photo/video</span>
                  </span>
                  <span className="flex items-center gap-1 opacity-70 whitespace-nowrap">
                    <Smile size={previewMode === 'MOBILE' ? 14 : 16} className="text-amber-500 shrink-0" />
                    <span>{previewMode === 'MOBILE' ? 'Feeling' : 'Feeling/activity'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* About Box: full width stacked below in mobile preview, right col on desktop */}
            <div className={previewMode === 'MOBILE' ? 'w-full' : 'space-y-4'}>
              <div
                className={`bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs ${
                  previewMode === 'MOBILE' ? 'p-3.5 space-y-2' : 'p-4 space-y-2'
                }`}
              >
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">About</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {privacy === 'PUBLIC'
                    ? 'Anyone can see who is in the group and what they post.'
                    : 'Only members can see who is in the group and what they post.'}
                </p>
                <div className="pt-2 text-xs font-semibold text-gray-600 dark:text-gray-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe size={15} />
                    <span>{privacy === 'PUBLIC' ? 'Public' : 'Private'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={15} />
                    <span>General group</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateGroupPage;

