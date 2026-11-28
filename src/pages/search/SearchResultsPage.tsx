import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import {
  Compass,
  Users,
  Layers,
  ChevronDown,
  Search,
  UserPlus,
  UserCheck,
  Check,
  Globe,
  Lock,
  Utensils,
  MapPin,
  Calendar,
  Filter,
} from "lucide-react";
import SocialHeader from "../../widgets/navbar/SocialHeader";
import PostCard from "../../features/posts/components/PostCard";
import PostDetailsModal from "../../features/posts/components/PostDetailsModal";
import SharePostModal from "../../features/posts/components/SharePostModal";
import { PostSkeleton } from "../../components/ui/Skeleton";
import ResponsiveTabs from "../../components/ui/ResponsiveTabs";
import searchApi, {
  type UserSearchResult,
  type GroupSearchResult,
} from "../../features/search/api/search.api";
import {
  useSearchAllQuery,
  useInvalidateSearchQueries,
} from "../../features/search/hooks/useSearchQueries";
import { friendsApi } from "../../features/friends/api/friends.api";
import { groupsApi } from "../../features/groups/api/groups.api";
import { useSession } from "../../lib/auth-client";
import defaultAvatar from "../../assets/user-image.png";

type SearchTab = "all" | "people" | "groups";

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const token = session?.session?.token;

  const query = searchParams.get("q") || "";
  const activeTab = (searchParams.get("type") as SearchTab) || "all";

  // Post Sub-filters (Facebook style)
  const [recentPosts, setRecentPosts] = useState(false);
  const [postsSeen, setPostsSeen] = useState(false);
  const [datePosted, setDatePosted] = useState("ANY_TIME");
  const [postsFrom, setPostsFrom] = useState("ANYONE");
  const [taggedLocation, setTaggedLocation] = useState("");

  // TanStack Query for 10-minute caching (instant back-navigation)
  const { data: searchData, isLoading: isSearchLoading } = useSearchAllQuery(
    query,
    {
      recentPosts,
      datePosted,
      postsFrom,
      taggedLocation,
    }
  );

  const {
    updateUserInSearch,
    updateGroupInSearch,
    deletePostInSearch,
    updatePostInSearch,
  } = useInvalidateSearchQueries();

  const users = searchData?.users || [];
  const groups = searchData?.groups || [];
  const posts = searchData?.posts || [];
  const loading = !query.trim() ? false : isSearchLoading;

  // Modals state for post interactions
  const [selectedPostForComments, setSelectedPostForComments] = useState<any>(null);
  const [sharingPost, setSharingPost] = useState<any>(null);

  // Optimistic tracking for friend requests and group joins
  const [pendingFriendIds, setPendingFriendIds] = useState<Set<string>>(new Set());
  const [pendingGroupIds, setPendingGroupIds] = useState<Set<string>>(new Set());

  const handleTabChange = (tab: SearchTab) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === "all") {
      nextParams.delete("type");
    } else {
      nextParams.set("type", tab);
    }
    setSearchParams(nextParams);
  };

  // Friend Request Action (optimistically cached in React Query)
  const handleSendFriendRequest = async (targetUserId: string) => {
    setPendingFriendIds((prev) => new Set(prev).add(targetUserId));
    updateUserInSearch(targetUserId, (u) => ({
      ...u,
      friendshipStatus: "PENDING_SENT",
    }));

    try {
      await friendsApi.sendFriendRequest(targetUserId, token);
    } catch (err) {
      console.warn("Failed to send friend request:", err);
      updateUserInSearch(targetUserId, (u) => ({
        ...u,
        friendshipStatus: "NONE",
      }));
    } finally {
      setPendingFriendIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }
  };

  // Group Join / Leave Action (optimistically cached in React Query)
  const handleToggleGroupJoin = async (group: GroupSearchResult) => {
    setPendingGroupIds((prev) => new Set(prev).add(group.id));
    const wasMember = group.isMember;
    const isPending = group.membershipStatus === "PENDING";

    updateGroupInSearch(group.id, (g) => ({
      ...g,
      isMember: !(wasMember || isPending),
      membersCount: wasMember ? Math.max(0, g.membersCount - 1) : g.membersCount + 1,
    }));

    try {
      if (wasMember || isPending) {
        await groupsApi.leaveGroup(group.id, token);
      } else {
        const res = await groupsApi.joinGroup(group.id, token);
        if (res?.isApproved === false) {
          updateGroupInSearch(group.id, (g) => ({
            ...g,
            isMember: false,
            membershipStatus: "PENDING",
            membersCount: group.membersCount,
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to toggle group membership:", err);
      updateGroupInSearch(group.id, (g) => ({
        ...g,
        isMember: wasMember,
        membersCount: wasMember ? g.membersCount + 1 : Math.max(0, g.membersCount - 1),
      }));
    } finally {
      setPendingGroupIds((prev) => {
        const next = new Set(prev);
        next.delete(group.id);
        return next;
      });
    }
  };

  const hasAnyResults = users.length > 0 || groups.length > 0 || posts.length > 0;

  return (
    <div className="h-dvh flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      {/* Top Header */}
      <SocialHeader />

      <div className="flex-1 min-h-0 mt-[100px] md:mt-14 flex overflow-hidden">
        {/* Left Sidebar: Filters & Navigation (Screenshot 3) */}
        <aside className="w-80 2xl:w-88 shrink-0 bg-white dark:bg-[#242526] border-r border-gray-100 dark:border-gray-800 p-4 overflow-y-auto no-scrollbar hidden md:block">
          <div className="pb-3 border-b border-gray-100 dark:border-gray-800 mb-3">
            <h1 className="text-xl font-black text-gray-900 dark:text-white">
              Search results
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Filters for &ldquo;<span className="text-[#e02f21] font-semibold">{query}</span>&rdquo;
            </p>
          </div>

          {/* Navigation Category Tabs */}
          <div className="space-y-1">
            {/* 1. All */}
            <div>
              <button
                type="button"
                onClick={() => handleTabChange("all")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer select-none ${
                  activeTab === "all"
                    ? "bg-red-50 dark:bg-red-950/30 text-[#e02f21]"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activeTab === "all"
                      ? "bg-[#e02f21] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                  }`}
                >
                  <Compass size={18} />
                </div>
                <span>All</span>
              </button>

              {/* Sub-filters under All (Facebook style) */}
              {activeTab === "all" && (
                <div className="mt-2.5 px-1 space-y-3.5 py-1">
                  {/* Recent Posts Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        Recent posts
                      </p>
                      <p className="text-[11px] text-gray-400">Sort by newest</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecentPosts((prev) => !prev)}
                      className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                        recentPosts ? "bg-[#e02f21]" : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform shadow-xs ${
                          recentPosts ? "translate-x-4.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Posts you've seen toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                        Posts you&apos;ve seen
                      </p>
                      <p className="text-[11px] text-gray-400">Include previously viewed</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPostsSeen((prev) => !prev)}
                      className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                        postsSeen ? "bg-[#e02f21]" : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform shadow-xs ${
                          postsSeen ? "translate-x-4.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Date posted dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Date posted
                    </label>
                    <select
                      value={datePosted}
                      onChange={(e) => setDatePosted(e.target.value)}
                      className="w-full text-xs bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-gray-800 dark:text-gray-200 focus:outline-none"
                    >
                      <option value="ANY_TIME">Any time</option>
                      <option value="TODAY">Today</option>
                      <option value="THIS_WEEK">This week</option>
                      <option value="THIS_MONTH">This month</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>

                  {/* Posts from dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Posts from
                    </label>
                    <select
                      value={postsFrom}
                      onChange={(e) => setPostsFrom(e.target.value)}
                      className="w-full text-xs bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-lg p-2 font-medium text-gray-800 dark:text-gray-200 focus:outline-none"
                    >
                      <option value="ANYONE">Anyone</option>
                      <option value="YOU">You</option>
                      <option value="FRIENDS">Your friends</option>
                      <option value="GROUPS">Your groups</option>
                    </select>
                  </div>

                  {/* Tagged location */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Tagged location
                    </label>
                    <div className="relative">
                      <MapPin
                        size={13}
                        className="absolute left-2.5 top-2.5 text-gray-400"
                      />
                      <input
                        type="text"
                        value={taggedLocation}
                        onChange={(e) => setTaggedLocation(e.target.value)}
                        placeholder="Anywhere (e.g. Dhaka)"
                        className="w-full text-xs pl-8 pr-2.5 py-2 bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-lg font-medium text-gray-800 dark:text-gray-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. People Tab */}
            <button
              type="button"
              onClick={() => handleTabChange("people")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer select-none ${
                activeTab === "people"
                  ? "bg-red-50 dark:bg-red-950/30 text-[#e02f21]"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activeTab === "people"
                    ? "bg-[#e02f21] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}
              >
                <Users size={18} />
              </div>
              <span>People</span>
            </button>

            {/* 3. Groups Tab */}
            <button
              type="button"
              onClick={() => handleTabChange("groups")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer select-none ${
                activeTab === "groups"
                  ? "bg-red-50 dark:bg-red-950/30 text-[#e02f21]"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activeTab === "groups"
                    ? "bg-[#e02f21] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}
              >
                <Layers size={18} />
              </div>
              <span>Groups</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 h-full overflow-y-auto no-scrollbar p-3 sm:p-5 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Mobile Filter Tabs (Visible on screens < md) */}
            <ResponsiveTabs
              items={[
                { id: "all", label: "All" },
                { id: "people", label: "People" },
                { id: "groups", label: "Groups" },
              ]}
              activeId={activeTab}
              onSelect={(id) => handleTabChange(id as SearchTab)}
              breakpoints={{ xs: 2, sm: 3, md: 3, lg: 3 }}
              size="sm"
              dropdownAlign="left"
              className="md:hidden pb-1"
            />

            {loading ? (
              <div className="space-y-4">
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    </div>
                  </div>
                </div>
                <PostSkeleton />
                <PostSkeleton />
              </div>
            ) : !hasAnyResults ? (
              /* Empty Results State */
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center mx-auto">
                  <Search size={32} />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                  No results for &ldquo;{query}&rdquo;
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                  Check your spelling or try searching for another chef, food group, or recipe name.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-[#e02f21] text-white text-xs font-bold rounded-xl hover:bg-[#c22417] transition cursor-pointer"
                >
                  Back to Feed
                </button>
              </div>
            ) : (
              <>
                {/* 1. PEOPLE SECTION (Shown in 'all' or 'people') */}
                {(activeTab === "all" || activeTab === "people") && users.length > 0 && (
                  <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <Users size={18} className="text-[#e02f21]" />
                        <h2 className="font-bold text-base text-gray-900 dark:text-white">
                          People
                        </h2>
                      </div>
                      {activeTab === "all" && users.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleTabChange("people")}
                          className="text-xs font-bold text-[#e02f21] hover:underline cursor-pointer"
                        >
                          See all
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                      {(activeTab === "all" ? users.slice(0, 4) : users).map((u) => {
                        const isPending = pendingFriendIds.has(u.id);

                        return (
                          <div
                            key={u.id}
                            className="flex items-center justify-between gap-3 py-3"
                          >
                            <Link
                              to={`/profile/${u.id}`}
                              className="flex items-center gap-3 min-w-0 group"
                            >
                              <img
                                src={u.image || defaultAvatar}
                                alt={u.name}
                                className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-100 dark:border-gray-700"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = defaultAvatar;
                                }}
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:underline truncate">
                                  {u.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {u.username ? `@${u.username}` : u.role || "Foodie"}
                                  {u.city ? ` • Lives in ${u.city}` : ""}
                                </p>
                                {Boolean(u.mutualFriendsCount && u.mutualFriendsCount > 0) && (
                                  <p className="text-[11px] text-gray-400">
                                    {u.mutualFriendsCount} mutual friend
                                    {u.mutualFriendsCount === 1 ? "" : "s"}
                                  </p>
                                )}
                              </div>
                            </Link>

                            {/* Action Buttons */}
                            {!u.isMe && (
                              <div className="flex items-center gap-2 shrink-0">
                                {u.friendshipStatus === "FRIENDS" ? (
                                  <Link
                                    to={`/profile/${u.id}`}
                                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition"
                                  >
                                    View profile
                                  </Link>
                                ) : u.friendshipStatus === "PENDING_SENT" ? (
                                  <button
                                    type="button"
                                    disabled
                                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500 opacity-80 cursor-default flex items-center gap-1"
                                  >
                                    <Check size={13} />
                                    <span>Request sent</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleSendFriendRequest(u.id)}
                                    disabled={isPending}
                                    className="px-3.5 py-1.5 rounded-xl bg-[#e02f21] text-white text-xs font-bold hover:bg-[#c22417] transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
                                  >
                                    <UserPlus size={13} />
                                    <span>{isPending ? "Adding…" : "Add friend"}</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. GROUPS SECTION (Shown in 'all' or 'groups') */}
                {(activeTab === "all" || activeTab === "groups") && groups.length > 0 && (
                  <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <Layers size={18} className="text-[#e02f21]" />
                        <h2 className="font-bold text-base text-gray-900 dark:text-white">
                          Groups
                        </h2>
                      </div>
                      {activeTab === "all" && groups.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleTabChange("groups")}
                          className="text-xs font-bold text-[#e02f21] hover:underline cursor-pointer"
                        >
                          See all
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                      {(activeTab === "all" ? groups.slice(0, 4) : groups).map((g) => {
                        const isPending = pendingGroupIds.has(g.id);

                        return (
                          <div
                            key={g.id}
                            className="flex items-center justify-between gap-3 py-3"
                          >
                            <Link
                              to={`/group/${g.slug}`}
                              className="flex items-center gap-3 min-w-0 group"
                            >
                              {g.avatar ? (
                                <img
                                  src={g.avatar}
                                  alt={g.name}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-gray-700"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
                                  <Users size={20} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:underline truncate">
                                  {g.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1.5">
                                  {g.privacy === "PUBLIC" ? (
                                    <>
                                      <Globe size={11} />
                                      <span>Public group</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock size={11} />
                                      <span>Private group</span>
                                    </>
                                  )}
                                  {/* Member count shown in result page as requested */}
                                  <span>•</span>
                                  <span>
                                    {g.membersCount} member{g.membersCount === 1 ? "" : "s"}
                                  </span>
                                </p>
                                {g.description && (
                                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                                    {g.description}
                                  </p>
                                )}
                              </div>
                            </Link>

                            <div className="shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleGroupJoin(g)}
                                disabled={isPending}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
                                  g.isMember
                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
                                    : "bg-[#e02f21] text-white hover:bg-[#c22417]"
                                }`}
                              >
                                {isPending ? "Updating…" : g.isMember ? "Joined" : "Join group"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. POSTS SECTION (Shown in 'all') */}
                {activeTab === "all" && posts.length > 0 && (
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center gap-2 px-1">
                      <Utensils size={18} className="text-[#e02f21]" />
                      <h2 className="font-bold text-base text-gray-900 dark:text-white">
                        Posts & Recipes
                      </h2>
                    </div>

                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onOpenComments={(selected) =>
                          setSelectedPostForComments(selected)
                        }
                        onOpenShare={(selected) => setSharingPost(selected)}
                        onDeletePost={(deletedId) =>
                          deletePostInSearch(deletedId)
                        }
                        onUpdatePost={(updated) =>
                          updatePostInSearch(updated)
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Post Comments Modal */}
      {selectedPostForComments && (
        <PostDetailsModal
          isOpen={Boolean(selectedPostForComments)}
          onClose={() => setSelectedPostForComments(null)}
          post={selectedPostForComments}
        />
      )}

      {/* Share Post Modal */}
      {sharingPost && (
        <SharePostModal
          isOpen={Boolean(sharingPost)}
          onClose={() => setSharingPost(null)}
          post={sharingPost}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;

