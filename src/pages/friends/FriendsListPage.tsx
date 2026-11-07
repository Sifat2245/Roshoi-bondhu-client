import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useSession } from '../../lib/auth-client';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import PostCard from '../../features/posts/components/PostCard';
import { friendsApi } from '../../features/friends/api/friends.api';
import { profileApi } from '../../features/profile/api/profile.api';
import { postsApi } from '../../features/posts/api/posts.api';
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  MessageCircle,
  UserCheck,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Utensils,
  ExternalLink,
  Users,
} from 'lucide-react';

export const FriendsListPage = () => {
  const { data: session } = useSession();
  const token = session?.session?.token;
  const [searchParams, setSearchParams] = useSearchParams();

  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(
    searchParams.get('uid') || null
  );

  // Selected friend's detailed profile & posts
  const [activeTab, setActiveTab] = useState('ALL');
  const [friendProfile, setFriendProfile] = useState<any>(null);
  const [friendPosts, setFriendPosts] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Load all friends
  useEffect(() => {
    let isMounted = true;
    const fetchFriends = async () => {
      setLoading(true);
      try {
        const data = await friendsApi.getAllFriends(token);
        if (isMounted && data) {
          setFriends(data);
        }
      } catch (err) {
        console.error('Failed to load friends:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFriends();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Filter friends list by search input
  const filteredFriends = useMemo(() => {
    if (!search.trim()) return friends;
    const q = search.toLowerCase();
    return friends.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q) ||
        f.username?.toLowerCase().includes(q)
    );
  }, [friends, search]);

  // Load selected friend profile data
  const loadFriendProfile = useCallback(
    async (friendId: string) => {
      setLoadingProfile(true);
      try {
        const [profileData, postsData] = await Promise.all([
          profileApi.getUserProfile(friendId, token),
          postsApi.getPosts({ authorId: friendId }, token),
        ]);
        setFriendProfile(profileData);
        setFriendPosts(postsData || []);
      } catch (err) {
        console.error('Failed to load friend profile data:', err);
      } finally {
        setLoadingProfile(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (selectedFriendId) {
      loadFriendProfile(selectedFriendId);
    } else {
      setFriendProfile(null);
      setFriendPosts([]);
    }
  }, [selectedFriendId, loadFriendProfile]);

  const handleSelectFriend = (friend: any) => {
    setSelectedFriendId(friend.id);
    setSearchParams({ uid: friend.id });
  };

  const selectedFriend = useMemo(() => {
    if (!selectedFriendId) return null;
    return friends.find((f) => f.id === selectedFriendId) || friendProfile;
  }, [selectedFriendId, friends, friendProfile]);

  const displayedPosts = useMemo(() => {
    if (activeTab === 'RECIPES') {
      return friendPosts.filter((p) => p.postType === 'RECIPE');
    }
    if (activeTab === 'PHOTOS') {
      return friendPosts.filter((p) => p.image);
    }
    return friendPosts;
  }, [friendPosts, activeTab]);

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden select-none">
      {/* 1. Fixed Topbar */}
      <SocialHeader />

      {/* 2. Main 2-Column Container */}
      <div className="flex-1 mt-[100px] md:mt-14 flex overflow-hidden">
        {/* Left Sidebar: All Friends List (matching Facebook Screenshot 5) */}
        <aside className="w-full md:w-[340px] lg:w-[360px] h-full shrink-0 bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xs">
          {/* Header with Back Arrow to /friends */}
          <div className="p-3 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/friends"
                className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 transition cursor-pointer"
                title="Back to Friends"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 block -mb-0.5">
                  Friends
                </span>
                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  All friends
                </h1>
              </div>
            </div>

            {/* Search Friends Input */}
            <div className="relative mt-2">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search friends"
                className="w-full pl-9 pr-3 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-sm font-medium dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21] transition"
              />
            </div>

            {/* Friend count */}
            <div className="pt-2 px-1">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
              </p>
            </div>
          </div>

          {/* Scrollable Friends Vertical List */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
            {loading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : filteredFriends.length > 0 ? (
              filteredFriends.map((f) => {
                const isSelected = selectedFriendId === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => handleSelectFriend(f)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-gray-100 dark:bg-[#3a3b3c]'
                        : 'hover:bg-gray-100/70 dark:hover:bg-[#3a3b3c]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={f.image} alt={f.name} size="md" />
                      <div className="truncate">
                        <p className="font-bold text-base truncate text-gray-900 dark:text-white">
                          {f.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                          {f.mutualCount || 2} mutual friends
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                <Users size={28} className="mx-auto mb-2 text-gray-400" />
                No friends found matching "{search}"
              </div>
            )}
          </div>
        </aside>

        {/* Right / Main Area: Preview Profile OR Empty State (matching Facebook Screenshot 5) */}
        <main className="flex-1 h-full overflow-y-auto no-scrollbar">
          {!selectedFriend ? (
            /* Empty State: exactly matching Facebook Screenshot 5 */
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 mb-4 flex items-center justify-center text-gray-300 dark:text-gray-600">
                <svg
                  className="w-24 h-24"
                  viewBox="0 0 112 112"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="44" cy="40" r="20" fill="currentColor" />
                  <path
                    d="M16 94C16 78 28 66 44 66C60 66 72 78 72 94H16Z"
                    fill="currentColor"
                  />
                  <circle cx="76" cy="46" r="14" fill="#9ca3af" />
                  <path
                    d="M58 94C58 82 66 72 78 72C89 72 98 82 98 94H58Z"
                    fill="#9ca3af"
                  />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-500 dark:text-gray-400 max-w-sm leading-snug">
                Select people's names to preview their profile.
              </p>
            </div>
          ) : (
            /* Selected Friend's Full Profile: matching UserProfilePage design */
            <div className="pb-16 animate-in fade-in duration-200">
              {/* Profile Header & Cover Photo */}
              <div className="w-full bg-white dark:bg-[#242526] shadow-xs">
                {/* Contained Cover Photo Banner */}
                <div className="w-full bg-gradient-to-b from-gray-200/50 via-gray-100/30 to-transparent dark:from-black/40 dark:via-[#18191a]/40 dark:to-transparent pt-0 sm:pt-4">
                  <div className="max-w-[1095px] mx-auto px-0 sm:px-4">
                    <div className="relative h-60 sm:h-80 md:h-[320px] w-full bg-gray-200 dark:bg-gray-800 overflow-hidden sm:rounded-2xl shadow-sm">
                      <img
                        src={
                          friendProfile?.coverImage ||
                          selectedFriend?.coverImage ||
                          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400'
                        }
                        alt={selectedFriend.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Identity Bar */}
                <div className="max-w-[1095px] mx-auto px-4 sm:px-8 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-3">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                      {/* Avatar */}
                      <div className="relative self-center sm:self-auto">
                        <Avatar
                          src={friendProfile?.image || selectedFriend?.image}
                          alt={selectedFriend.name}
                          size="xl"
                          className="w-32 h-32 sm:w-36 sm:h-36 rounded-full ring-4 ring-white dark:ring-[#242526] shadow-xl object-cover"
                        />
                      </div>

                      {/* Name & Stats */}
                      <div className="pb-1 text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                          {selectedFriend.name}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                          {selectedFriend.mutualCount || 3} mutual friends •{' '}
                          {friendProfile?.followersCount || 12} followers
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons: Message + Friends + View Full Profile */}
                    <div className="flex items-center gap-2.5 self-center sm:self-end flex-wrap justify-center">
                      <Button
                        variant="secondary"
                        className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <UserCheck size={16} className="text-[#e02f21]" />
                        <span>Friends</span>
                      </Button>

                      <Button
                        variant="secondary"
                        className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <MessageCircle size={16} />
                        <span>Message</span>
                      </Button>

                      <Link
                        to={`/profile/${selectedFriend.id}`}
                        className="px-5 py-2.5 bg-[#e02f21] hover:bg-[#c22417] text-white rounded-xl text-sm font-bold shadow-xs transition flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink size={16} />
                        <span>View Full Profile</span>
                      </Link>
                    </div>
                  </div>

                  {/* Profile Bio */}
                  {(friendProfile?.bio || selectedFriend?.bio) && (
                    <div className="pt-2 text-sm text-gray-600 dark:text-gray-300 italic max-w-xl">
                      "{friendProfile?.bio || selectedFriend?.bio}"
                    </div>
                  )}

                  {/* Navigation Tabs: All, About, Friends, Photos, Recipes */}
                  <div className="flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 mt-4 pt-1 overflow-x-auto no-scrollbar">
                    {['ALL', 'ABOUT', 'FRIENDS', 'PHOTOS', 'RECIPES'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2.5 text-sm font-bold rounded-xl transition cursor-pointer shrink-0 ${
                          activeTab === tab
                            ? 'bg-[#e02f21] text-white shadow-xs'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {tab === 'ALL'
                          ? 'All'
                          : tab === 'ABOUT'
                          ? 'About'
                          : tab === 'FRIENDS'
                          ? 'Friends'
                          : tab === 'PHOTOS'
                          ? 'Photos'
                          : 'Recipes'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area: Intro Card + Posts Stream */}
              <div className="max-w-[1095px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
                  {/* Left Column: Personal Details Card */}
                  <div className="w-full lg:w-[360px] shrink-0 bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      Personal details
                    </h3>

                    <div className="space-y-3 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2.5">
                        <MapPin size={16} className="text-[#e02f21] shrink-0" />
                        <span>
                          Lives in{' '}
                          <b className="text-gray-800 dark:text-gray-200">
                            {friendProfile?.city || 'Dhaka, Bangladesh'}
                          </b>
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Briefcase size={16} className="text-gray-500 dark:text-gray-400 shrink-0" />
                        <span>
                          Works as{' '}
                          <b className="text-gray-800 dark:text-gray-200">
                            {friendProfile?.work || 'Culinary Creator'}
                          </b>
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <GraduationCap size={16} className="text-emerald-500 shrink-0" />
                        <span>
                          Studied at{' '}
                          <b className="text-gray-800 dark:text-gray-200">
                            {friendProfile?.education || 'Heshel Cooking Academy'}
                          </b>
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Calendar size={16} className="text-purple-500 shrink-0" />
                        <span>
                          Joined{' '}
                          <b className="text-gray-800 dark:text-gray-200">
                            Heshel Network
                          </b>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Posts Stream */}
                  <div className="flex-1 max-w-[700px] w-full mx-auto space-y-4">
                    {loadingProfile ? (
                      [1, 2].map((i) => (
                        <div
                          key={i}
                          className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-200 dark:border-gray-800 animate-pulse space-y-3"
                        >
                          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                          <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                        </div>
                      ))
                    ) : displayedPosts.length > 0 ? (
                      displayedPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onOpenComments={() => {}}
                          onOpenShare={() => {}}
                          onRequireAuth={() => {}}
                        />
                      ))
                    ) : (
                      <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
                        <Utensils size={28} className="mx-auto text-gray-400" />
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          No Posts Yet
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedFriend.name} hasn't shared any public recipes or stories yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FriendsListPage;

