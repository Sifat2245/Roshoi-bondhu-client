import { useSocial } from '../../features/community/model/useSocial';
import { resolveGroup } from '../../features/community/model/community-domain';
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useSession } from '../../lib/auth-client';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import PostCard from '../../features/posts/components/PostCard';
import { PostSkeleton, GroupCardSkeleton } from '../../components/ui/Skeleton';
import groupsApi from '../../features/groups/api/groups.api';
import postsApi from '../../features/posts/api/posts.api';
import { useToast } from '../../context/ToastContext';
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

const MOCK_FALLBACK_GROUPS = [
  {
    id: 'g-grandma',
    name: 'Secret Grandma Recipes (দাদীর গোপন রেসিপি)',
    slug: 'secret-grandma-recipes',
    avatar: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    description: 'Preserving heirloom recipes from Bengali grandmothers across generations.',
    membersCount: 1420,
    privacy: 'PUBLIC',
    isMember: true,
    lastActive: '5 hours ago',
  },
  {
    id: 'g-baking',
    name: 'Baking & Sweet Tooth Club',
    slug: 'baking-sweet-tooth-club',
    avatar: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200',
    coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    description: 'From shondesh to cheesecakes - the ultimate haven for dessert creators.',
    membersCount: 890,
    privacy: 'PUBLIC',
    isMember: true,
    lastActive: '1 day ago',
  },
  {
    id: 'g-curries',
    name: 'Desi Spices & Curries (দেশি মশলা ও তরকারি)',
    slug: 'desi-spices-curries',
    avatar: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200',
    coverImage: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800',
    description: 'Master the art of mustard oil, panch phoron, and robust slow-cooked curries.',
    membersCount: 2310,
    privacy: 'PUBLIC',
    isMember: false,
    lastActive: '18 mins ago',
  },
  {
    id: 'g-biryani',
    name: 'Old Dhaka Biryani & Mughlai Guild',
    slug: 'old-dhaka-biryani-guild',
    avatar: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200',
    coverImage: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800',
    description: 'Kacchi biryani enthusiasts exploring authentic spices and clay pot cooking.',
    membersCount: 3120,
    privacy: 'PUBLIC',
    isMember: false,
    lastActive: '2 days ago',
  },
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

  const [baseGroups, setGroups] = useState<any[]>([]);
  const groups = baseGroups.map((group) => resolveGroup(group, social.members[group.id], user?.id));
  const [groupPosts, setGroupPosts] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch all groups
  const fetchGroups = useCallback(async () => {
    setLoadingGroups(true);
    try {
      const data = await groupsApi.getGroups({}, token);
      if (data && data.length > 0) {
        setGroups(data);
      } else {
        setGroups(MOCK_FALLBACK_GROUPS);
      }
    } catch {
      setGroups(MOCK_FALLBACK_GROUPS);
    } finally {
      setLoadingGroups(false);
    }
  }, [token]);

  // Fetch all group posts (Requirement 3: "in the middle. it will show all the posts of all the groups")
  const fetchGroupPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const data = await postsApi.getPosts({ limit: 50 }, token, user?.id);
      if (data) {
        // Show all posts, giving priority to posts with groups
        const groupTagged = data.filter((p: any) => p.group || p.groupId);
        if (groupTagged.length > 0) {
          setGroupPosts(groupTagged);
        } else {
          // If no posts are tagged with groups yet, show the posts with fallback group tags
          const augmented = data.map((p: any, idx: number) => ({
            ...p,
            group: p.group || MOCK_FALLBACK_GROUPS[idx % MOCK_FALLBACK_GROUPS.length],
          }));
          setGroupPosts(augmented);
        }
      }
    } catch (err) {
      console.error('Failed to load group posts', err);
    } finally {
      setLoadingPosts(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    fetchGroups();
    fetchGroupPosts();
  }, [fetchGroups, fetchGroupPosts]);

  const handleSelectView = (view: GroupView) => {
    setActiveView(view);
    setSearchParams(view === 'FEED' ? {} : { tab: view });
  };

  const handleJoinToggle = async (group: any) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (group.isMember) {
        await groupsApi.leaveGroup(group.slug || group.id, token);
        notify.info(`Left ${group.name}`);
      } else {
        await groupsApi.joinGroup(group.slug || group.id, token);
        notify.success(`Joined ${group.name}!`);
      }

      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? {
                ...g,
                isMember: !g.isMember,
                membersCount: g.isMember ? Math.max(1, g.membersCount - 1) : g.membersCount + 1,
              }
            : g
        )
      );
    } catch (err: any) {
      notify.error(err.message || 'Action failed');
    }
  };

  // Groups managed by the user
  const managedGroups = groups.filter(
    (g) => g.isCreator || g.creatorId === user?.id || g.creator?.id === user?.id
  );
  // Joined groups
  const joinedGroups = groups.filter((g) => g.isMember);
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
              {managedGroups.length > 0 ? (
                <div className="space-y-1">
                  {managedGroups.map((group) => (
                    <Link
                      key={group.id}
                      to={`/group/${group.slug}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <img
                        src={group.avatar || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100'}
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

              {joinedGroups.length > 0 ? (
                <div className="space-y-1">
                  {joinedGroups.map((group) => (
                    <Link
                      key={group.id}
                      to={`/group/${group.slug}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <img
                        src={group.avatar || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=100'}
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
          {/* Mobile Horizontal Navigation Tabs (< lg screens) */}
          <div className="lg:hidden mb-5 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1">
            <button
              type="button"
              onClick={() => handleSelectView('FEED')}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 shrink-0 ${
                activeView === 'FEED'
                  ? 'bg-[#e02f21] text-white shadow-xs'
                  : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              <Rss size={16} />
              <span>Your feed</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectView('DISCOVER')}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 shrink-0 ${
                activeView === 'DISCOVER'
                  ? 'bg-[#e02f21] text-white shadow-xs'
                  : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              <Compass size={16} />
              <span>Discover</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectView('YOUR_GROUPS')}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 shrink-0 ${
                activeView === 'YOUR_GROUPS'
                  ? 'bg-[#e02f21] text-white shadow-xs'
                  : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              <Users size={16} />
              <span>Your groups</span>
            </button>

            <Link
              to="/groups/create"
              className="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap bg-red-50 text-[#e02f21] dark:bg-red-950/60 hover:bg-red-100 transition flex items-center gap-1.5 shrink-0"
            >
              <Plus size={16} />
              <span>Create group</span>
            </Link>
          </div>
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
                    onDeletePost={(deletedId) =>
                      setGroupPosts((prev) => prev.filter((p) => p.id !== deletedId))
                    }
                    onUpdatePost={(updated) =>
                      setGroupPosts((prev) =>
                        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
                      )
                    }
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

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {DISCOVER_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#e02f21] text-white shadow-sm'
                          : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

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
                          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'
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
                          <span>{group.isMember ? 'Joined' : 'Join group'}</span>
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

              {joinedGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {joinedGroups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-xs flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={group.avatar || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100'}
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
                          <p className="text-sm text-gray-500 mt-0.5">
                            {group.membersCount || 100} members
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
                  ))}
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
