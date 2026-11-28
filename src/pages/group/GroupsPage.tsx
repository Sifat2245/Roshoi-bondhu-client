import { useSocial } from '../../features/community/model/useSocial';
import { resolveGroup } from '../../features/community/model/community-domain';
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useSession } from '../../lib/auth-client';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import PostCard from '../../features/posts/components/PostCard';
import {
  PostSkeleton,
  GroupCardSkeleton,
  GroupSidebarItemSkeleton,
  GroupCompactCardSkeleton,
} from '../../components/ui/Skeleton';
import ResponsiveTabs from '../../components/ui/ResponsiveTabs';
import groupsApi from '../../features/groups/api/groups.api';
import postsApi from '../../features/posts/api/posts.api';
import {
  useGroupsListQuery,
  useGroupFeedPostsQuery,
  useInvalidateGroupQueries,
  MOCK_FALLBACK_GROUPS,
} from '../../features/groups/hooks/useGroupQueries';
import { useInvalidateFeedQueries } from '../../features/posts/hooks/useFeedQueries';
import { useToast } from '../../context/ToastContext';
import defaultGroupCover from '../../assets/group/group-default.png';
import {
  Users,
  Compass,
  Rss,
  Plus,
  Search,
  Settings as SettingsIcon,
  Globe,
  Lock,
  Utensils,
  ChevronRight,
} from 'lucide-react';

type GroupView = 'FEED' | 'DISCOVER' | 'YOUR_GROUPS';

const DISCOVER_CATEGORIES = [
  'All',
  'Heirloom & Traditional',
  'Baking & Pastry',
  'Biryani & Mughlai',
  'Street Food',
  'Healthy Diet',
];

const GroupsPage: React.FC = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notify } = useToast();
  const { user, state: social } = useSocial();
  const token = session?.session?.token;

  // View state: 'FEED' | 'DISCOVER' | 'YOUR_GROUPS'
  const initialView = (searchParams.get('tab') as GroupView) || 'FEED';
  const [activeView, setActiveView] = useState<GroupView>(initialView);

  const [groupSearch, setGroupSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const currentUserId = user?.id || session?.user?.id;

  // TanStack Query + localStorage SWR 10-min caching
  const {
    data: rawGroups = [],
    isLoading: loadingGroups,
  } = useGroupsListQuery({}, token, currentUserId);

  const {
    data: groupPosts = [],
    isLoading: loadingPosts,
  } = useGroupFeedPostsQuery(token, user?.id);

  const {
    updateGroupMembershipInCache,
    invalidateAllGroups,
    invalidateGroupFeed,
    deletePostFromGroup,
    updatePostInGroup,
  } = useInvalidateGroupQueries();
  const { invalidateFeed, updatePostInFeed, deletePostFromFeed } =
    useInvalidateFeedQueries();

  const groups = rawGroups.map((group) =>
    resolveGroup(group, social.members[group.id], user?.id)
  );

  const handleSelectView = (view: GroupView) => {
    setActiveView(view);
    setSearchParams(view === 'FEED' ? {} : { tab: view });
  };

  const handleJoinToggle = async (group: any) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isPending = group.myMembershipStatus === 'PENDING';
    const wasMember = Boolean(group.isMember);

    if (wasMember || isPending) {
      updateGroupMembershipInCache(group.id, false, false);
      try {
        await groupsApi.leaveGroup(group.id || group.slug, token);
        notify.info(isPending ? `Cancelled request to join ${group.name}` : `Left ${group.name}`);
        invalidateAllGroups();
        invalidateGroupFeed();
        invalidateFeed();
      } catch (err: any) {
        updateGroupMembershipInCache(group.id, wasMember, isPending);
        notify.error(err.message || 'Action failed');
      }
      return;
    }

    const willAwaitApproval = group.joinMode === 'ADMIN_APPROVAL';
    updateGroupMembershipInCache(group.id, !willAwaitApproval, willAwaitApproval);

    try {
      const res = await groupsApi.joinGroup(group.id || group.slug, token);
      if (res?.isApproved === false) {
        updateGroupMembershipInCache(group.id, false, true);
        notify.info(`Join request sent for ${group.name}. Waiting for admin approval.`);
      } else {
        updateGroupMembershipInCache(group.id, true, false);
        notify.success(`Joined ${group.name}!`, 'Joined', true);
      }
      invalidateAllGroups();
      invalidateGroupFeed();
      invalidateFeed();
    } catch (err: any) {
      updateGroupMembershipInCache(group.id, false, false);
      notify.error(err.message || 'Action failed');
    }
  };

  const isGroupManaged = (g: any) => {
    // 1. Role-based: admin or moderator
    const role = (g.currentUserRole || g.membershipRole || g.role || '').toUpperCase();
    if (role === 'ADMIN' || role === 'MODERATOR') return true;

    // 2. Permission-based: canModerate flag from GraphQL
    if (g.canModerate) return true;

    // 3. Creator-based
    if (g.isCreator) return true;
    if (currentUserId) {
      if (g.createdById === currentUserId) return true;
      if (g.createdBy?.id === currentUserId) return true;
      if (g.creatorId === currentUserId) return true;
      if (g.creator?.id === currentUserId) return true;
    }

    // 4. Nested members check if present
    if (currentUserId && Array.isArray(g.members)) {
      const myMember = g.members.find(
        (m: any) => m.userId === currentUserId || m.user?.id === currentUserId
      );
      if (myMember) {
        const memRole = (myMember.role || '').toUpperCase();
        if (memRole === 'ADMIN' || memRole === 'MODERATOR') return true;
      }
    }

    return false;
  };

  // Groups managed by the user (Admin or Moderator)
  const managedGroups = groups.filter(isGroupManaged);
  // Joined groups
  const joinedGroups = groups.filter((g) => g.isMember);
  // Joined groups excluding the ones managed by user (to prevent duplication in sidebar)
  const nonManagedJoinedGroups = groups.filter((g) => g.isMember && !isGroupManaged(g));
  const joinedGroupsSidebar = nonManagedJoinedGroups.length > 0
    ? nonManagedJoinedGroups
    : (managedGroups.length === 0 ? joinedGroups : []);
  // All your groups (managed + joined communities)
  const allYourGroups = groups.filter((g) => g.isMember || isGroupManaged(g));

  // Filtered groups by search
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase()) && (selectedCategory === 'All' || g.category === selectedCategory || `${g.name} ${g.description}`.toLowerCase().includes(selectedCategory.split(' & ')[0].toLowerCase()))
  );
  useEffect(() => { const tab = searchParams.get('tab'); setActiveView(tab === 'DISCOVER' || tab === 'YOUR_GROUPS' ? tab : 'FEED'); }, [searchParams]);

  return (
    <div className="h-dvh flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      {/* 1. Fixed Topbar */}
      <SocialHeader />

      {/* 2. Main 2-Column Facebook Groups Body */}
      <div className="flex-1 min-h-0 mt-[100px] md:mt-14 flex overflow-hidden">
        {/* LEFT COLUMN: Facebook Groups Sidebar (Visible on desktop lg: and up) */}
        <aside className="hidden lg:flex lg:w-[360px] xl:w-[380px] shrink-0 bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-gray-800 flex-col h-full shadow-xs">
          {/* Top Title & Settings */}
          <div className="p-4 pb-2 flex items-center justify-between">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Groups
            </h1>
            <Link
              to="/settings"
              title="Group settings"
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 transition"
            >
              <SettingsIcon size={18} />
            </Link>
          </div>

          {/* Search Groups Bar */}
          <div className="px-4 py-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                placeholder="Search groups"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#3a3b3c] rounded-full text-sm font-medium text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e02f21] transition"
              />
            </div>
          </div>

          {/* Navigation Items (Your Feed, Discover, Your Groups) */}
          <nav className="px-3 py-2 space-y-1">
            {/* 1. Your Feed */}
            <button
              type="button"
              onClick={() => handleSelectView('FEED')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeView === 'FEED'
                  ? 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  activeView === 'FEED'
                    ? 'bg-[#e02f21] text-white shadow-xs'
                    : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300'
                }`}
              >
                <Rss size={18} />
              </div>
              <span className="text-base">Your feed</span>
            </button>

            {/* 2. Discover */}
            <button
              type="button"
              onClick={() => handleSelectView('DISCOVER')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeView === 'DISCOVER'
                  ? 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  activeView === 'DISCOVER'
                    ? 'bg-[#e02f21] text-white shadow-xs'
                    : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300'
                }`}
              >
                <Compass size={18} />
              </div>
              <span className="text-base">Discover</span>
            </button>

            {/* 3. Your Groups */}
            <button
              type="button"
              onClick={() => handleSelectView('YOUR_GROUPS')}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeView === 'YOUR_GROUPS'
                  ? 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  activeView === 'YOUR_GROUPS'
                    ? 'bg-[#e02f21] text-white shadow-xs'
                    : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300'
                }`}
              >
                <Users size={18} />
              </div>
              <span className="text-base">Your groups</span>
            </button>
          </nav>

          {/* + Create New Group Button (Matching Image 2 & 3) */}
          <div className="px-4 py-2">
            <Link
              to="/groups/create"
              className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-[#e02f21] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
            >
              <Plus size={18} />
              <span>Create new group</span>
            </Link>
          </div>

          <div className="mx-4 my-2 border-t border-gray-100 dark:border-gray-800" />

          {/* Scrollable Groups Lists */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 no-scrollbar">
            {/* Section: Groups you manage */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                Groups you manage
              </h3>
              {loadingGroups && managedGroups.length === 0 ? (
                <div className="space-y-1">
                  {[1, 2].map((i) => (
                    <GroupSidebarItemSkeleton key={i} />
                  ))}
                </div>
              ) : managedGroups.length > 0 ? (
                <div className="space-y-1">
                  {managedGroups.map((group) => {
                    const roleLabel =
                      group.currentUserRole === 'MODERATOR' ? 'Moderator' : 'Admin';
                    return (
                      <Link
                        key={group.id}
                        to={`/group/${group.slug}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <img
                          src={group.avatar || group.coverImage || defaultGroupCover}
                          alt={group.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-base text-gray-900 dark:text-white truncate">
                            {group.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                            <span className="font-bold text-[#e02f21]">{roleLabel}</span>
                            <span>•</span>
                            <span>Last active {group.lastActive || 'recently'}</span>
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-1">
                  You do not manage any groups yet.
                </p>
              )}
            </div>

            {/* Section: Groups you've joined */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Groups you've joined
                </h3>
                <button
                  type="button"
                  onClick={() => handleSelectView('YOUR_GROUPS')}
                  className="text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                >
                  See all
                </button>
              </div>

              {loadingGroups && joinedGroupsSidebar.length === 0 ? (
                <div className="space-y-1">
                  {[1, 2, 3].map((i) => (
                    <GroupSidebarItemSkeleton key={i} />
                  ))}
                </div>
              ) : joinedGroupsSidebar.length > 0 ? (
                <div className="space-y-1">
                  {joinedGroupsSidebar.map((group) => (
                    <Link
                      key={group.id}
                      to={`/group/${group.slug}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <img
                        src={group.avatar || group.coverImage || defaultGroupCover}
                        alt={group.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-base text-gray-900 dark:text-white truncate">
                          {group.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Last active {group.lastActive || 'recently'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-1">
                  Explore Discover to join food circles!
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* CENTER / MAIN CONTENT (Feed, Discover, or Your Groups) */}
        <main className="flex-1 min-w-0 min-h-0 w-full h-full overflow-y-auto no-scrollbar py-4 sm:py-6 px-3.5 sm:px-6 lg:px-8">
          {/* Mobile Navigation Tabs (< lg screens) with More dropdown */}
          <ResponsiveTabs
            items={[
              { id: 'FEED', label: 'Your feed', icon: <Rss size={15} /> },
              { id: 'DISCOVER', label: 'Discover', icon: <Compass size={15} /> },
              { id: 'YOUR_GROUPS', label: 'Your groups', icon: <Users size={15} /> },
              { id: 'CREATE_GROUP', label: 'Create group', icon: <Plus size={15} />, accent: true },
            ]}
            activeId={activeView}
            onSelect={(id) => {
              if (id === 'CREATE_GROUP') {
                navigate('/groups/create');
              } else {
                handleSelectView(id as GroupView);
              }
            }}
            breakpoints={{ xs: 2, sm: 4, md: 4, lg: 4 }}
            className="lg:hidden mb-5"
          />
          {/* VIEW 1: All Posts from All Groups (Requirement 3 - Image 2) */}
          {activeView === 'FEED' && (
            <div className="max-w-[700px] xl:max-w-[740px] mx-auto space-y-4">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider">
                  Recent activity
                </h2>
              </div>

              {/* Feed Stream */}
              {loadingPosts ? (
                <div className="space-y-4">
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </div>
              ) : groupPosts.length > 0 ? (
                groupPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onOpenComments={(post) => navigate(`/post/${post.id}`)}
                    onRequireAuth={() => navigate('/login')}
                    onDeletePost={(deletedId) => {
                      deletePostFromGroup(post.groupId || '', deletedId);
                      deletePostFromFeed(deletedId);
                    }}
                    onUpdatePost={(updated) => {
                      updatePostInGroup(post.groupId || '', updated);
                      updatePostInFeed(updated);
                    }}
                  />
                ))
              ) : (
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center mx-auto">
                    <Utensils size={30} />
                  </div>
                  <h3 className="font-black text-lg text-gray-900 dark:text-white">
                    No Group Posts Yet
                  </h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Join cooking communities in Discover to see all recipes, baking stories, and culinary discussions right here.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectView('DISCOVER')}
                    className="mt-2 px-5 py-2.5 bg-[#e02f21] text-white rounded-xl text-sm font-bold hover:bg-[#c92518] transition cursor-pointer"
                  >
                    Discover Groups
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: Discover Groups (Requirement 4) */}
          {activeView === 'DISCOVER' && (
            <div className="max-w-[1100px] mx-auto space-y-6">
              {/* Header Banner */}
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#e02f21] uppercase tracking-wider">
                    <span>Suggested for you</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Discover Groups
                  </h2>
                  <p className="text-sm text-gray-500 max-w-lg">
                    Find communities sharing your favorite cooking styles, heirloom techniques, and regional food passions.
                  </p>
                </div>

                <Link
                  to="/groups/create"
                  className="px-5 py-2.5 bg-[#e02f21] hover:bg-[#c92518] text-white text-sm font-bold rounded-xl transition shadow-sm flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
                >
                  <Plus size={18} />
                  <span>Create group</span>
                </Link>
              </div>

              {/* Category Pills (Responsive with More dropdown) */}
              <ResponsiveTabs
                items={DISCOVER_CATEGORIES.map((cat) => ({ id: cat, label: cat }))}
                activeId={selectedCategory}
                onSelect={setSelectedCategory}
                breakpoints={{ xs: 2, sm: 3, md: 4, lg: DISCOVER_CATEGORIES.length }}
              />

              {/* Groups Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {!loadingGroups && !filteredGroups.length && <div className="col-span-full rounded-2xl bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-800 p-8 text-center"><h3 className="font-bold">No groups match your search</h3><p className="mt-2 text-sm text-gray-500">Try another topic or explore all cooking communities.</p><button type="button" onClick={() => { setGroupSearch(''); setSelectedCategory('All'); }} className="mt-4 text-sm font-bold text-[#e02f21]">Clear search & filters</button></div>}
                {loadingGroups ? [1, 2, 3].map((index) => <GroupCardSkeleton key={index} />) : filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col hover:shadow-md transition group"
                  >
                    {/* Cover Banner */}
                    <div className="h-32 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden relative">
                      <img
                        src={
                          group.coverImage ||
                          defaultGroupCover
                        }
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-xs text-white text-xs sm:text-sm font-bold flex items-center gap-1.5">
                        {group.privacy === 'PUBLIC' ? <Globe size={14} /> : <Lock size={14} />}
                        <span>{group.privacy === 'PUBLIC' ? 'Public' : 'Private'}</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <Link
                          to={`/group/${group.slug}`}
                          className="font-black text-lg text-gray-900 dark:text-white hover:text-[#e02f21] transition line-clamp-1 block"
                        >
                          {group.name}
                        </Link>
                        <p className="text-sm text-gray-500 font-semibold">
                          {group.membersCount || 120} members • 8 posts a day
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                          {group.description ||
                            'A community for food enthusiasts to share recipes, cooking techniques, and kitchen stories.'}
                        </p>
                      </div>

                      {/* Join / View Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleJoinToggle(group)}
                          className={`w-full py-2.5 rounded-xl text-sm font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            group.isMember
                              ? 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                              : 'bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-[#e02f21]'
                          }`}
                        >
                          <span>
                            {group.isMember
                              ? 'Joined'
                              : group.myMembershipStatus === 'PENDING'
                                ? 'Pending approval'
                                : 'Join group'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: Your Groups */}
          {activeView === 'YOUR_GROUPS' && (
            <div className="max-w-[1100px] mx-auto space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  All Your Groups
                </h2>
                <p className="text-base text-gray-500 mt-1">
                  Groups you manage and communities you have joined.
                </p>
              </div>

              {loadingGroups && allYourGroups.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3].map((i) => (
                    <GroupCompactCardSkeleton key={i} />
                  ))}
                </div>
              ) : allYourGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {allYourGroups.map((group) => {
                    const isManaged = isGroupManaged(group);
                    const roleLabel =
                      group.currentUserRole === 'MODERATOR'
                        ? 'Moderator'
                        : isManaged
                        ? 'Admin'
                        : null;
                    return (
                      <div
                        key={group.id}
                        className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-xs flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={group.avatar || group.coverImage || defaultGroupCover}
                            alt={group.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/group/${group.slug}`}
                              className="font-bold text-base text-gray-900 dark:text-white hover:underline truncate block"
                            >
                              {group.name}
                            </Link>
                            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                              {roleLabel && (
                                <>
                                  <span className="font-bold text-xs px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-[#e02f21]">
                                    {roleLabel}
                                  </span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{group.membersCount || 1} members</span>
                            </p>
                          </div>
                        </div>

                        <Link
                          to={`/group/${group.slug}`}
                          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200 transition shrink-0"
                        >
                          Visit
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-800 space-y-3">
                  <Users size={32} className="mx-auto text-gray-400" />
                  <p className="text-base text-gray-500">You haven't joined any groups yet.</p>
                  <button
                    type="button"
                    onClick={() => handleSelectView('DISCOVER')}
                    className="px-5 py-2.5 bg-[#e02f21] text-white rounded-xl text-sm font-bold hover:bg-[#c92518] transition cursor-pointer"
                  >
                    Discover Groups
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GroupsPage;
