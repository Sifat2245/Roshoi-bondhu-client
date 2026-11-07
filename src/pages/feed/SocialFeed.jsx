import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import { useLanguage } from '../../context/LanguageContext';
import SocialHeader from '../../components/common/SocialHeader';
import LeftSidebar from '../../components/LeftSidebar';
import RightSidebar from '../../components/RightSidebar';
import CreatePostTrigger from '../../components/feed/CreatePostTrigger';
import PostCard from '../../components/feed/PostCard';
import CreatePostModal from '../../components/modals/CreatePostModal';
import PostDetailsModal from '../../components/modals/PostDetailsModal';
import { Sparkles, Utensils, MessageSquare, Heart, RefreshCw, X, RotateCcw } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SocialFeed = () => {
  const { data: session, isPending: authLoading } = useSession();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Protect feed: without login, the feed will not be accessible
  useEffect(() => {
    if (!authLoading && !session?.user) {
      navigate('/login', { replace: true });
    }
  }, [session, authLoading, navigate]);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'RECIPE', 'CASUAL', 'FOLLOWING'
  const [activeCuisine, setActiveCuisine] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [activeMaxTime, setActiveMaxTime] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState('CASUAL');
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  const searchKeyword = searchParams.get('search') || '';

  const requireAuth = () => {
    navigate('/login');
  };

  // Fetch feed with all filter parameters
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'RECIPE') params.set('type', 'RECIPE');
      if (activeTab === 'CASUAL') params.set('type', 'CASUAL');
      if (activeTab === 'FOLLOWING') params.set('filter', 'FOLLOWING');
      if (activeCuisine) params.set('cuisine', activeCuisine);
      if (activeTag) params.set('tag', activeTag);
      if (activeMaxTime) params.set('maxTime', activeMaxTime);
      if (searchKeyword) params.set('search', searchKeyword);

      const res = await fetch(`${API_BASE}/api/post?${params.toString()}`, {
        credentials: 'include',
        headers: session?.session?.token
          ? { Authorization: `Bearer ${session.session.token}` }
          : {},
      });

      const json = await res.json();
      if (json.data) {
        setPosts(json.data);
      }
    } catch (err) {
      console.error('Failed to load feed', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, activeCuisine, activeTag, activeMaxTime, searchKeyword, session]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const clearSearch = () => {
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setActiveCuisine('');
    setActiveTag('');
    setActiveMaxTime('');
    clearSearch();
  };

  const handleOpenCreateModal = (mode = 'CASUAL') => {
    if (!session?.user) {
      requireAuth();
      return;
    }
    setCreateInitialMode(mode);
    setIsCreateOpen(true);
  };

  const handleSharePost = async (post) => {
    if (!session?.user) {
      requireAuth();
      return;
    }

    const { value: caption } = await Swal.fire({
      title: 'Share this post',
      input: 'textarea',
      inputLabel: 'Add a comment to your shared post',
      inputPlaceholder: 'Check out this recipe...',
      showCancelButton: true,
      confirmButtonText: 'Share Now',
      confirmButtonColor: '#e02f21',
    });

    if (caption !== undefined) {
      try {
        const res = await fetch(`${API_BASE}/api/post/${post.id}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.session?.token || ''}`,
          },
          credentials: 'include',
          body: JSON.stringify({ caption: caption || '' }),
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Shared!',
            text: 'Post has been shared to your profile.',
            timer: 1500,
            showConfirmButton: false,
          });
          fetchFeed();
        } else {
          throw new Error(data.message || 'Failed to share post');
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.message });
      }
    }
  };

  const hasAnyFilter = Boolean(activeCuisine || activeTag || activeMaxTime || searchKeyword);

  if (authLoading) {
    return (
      <div className="h-screen bg-[#f0f2f5] dark:bg-[#18191a] flex items-center justify-center">
        <span className="w-10 h-10 border-3 border-[#e02f21] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      {/* 1. Fixed Topbar (Does NOT scroll) */}
      <SocialHeader onOpenCreatePost={() => handleOpenCreateModal('CASUAL')} />

      {/* 2. Main 3-Column Container (Fixed Viewport, Only Center Feed Scrolls) */}
      <div className="flex-1 mt-14 flex justify-between overflow-hidden">
        {/* Left Sidebar (Fixed column, Does NOT scroll with feed) */}
        <aside className="hidden lg:block w-[280px] xl:w-[320px] 2xl:w-[340px] h-full shrink-0 px-2 py-3 overflow-y-auto no-scrollbar border-r border-transparent">
          <LeftSidebar />
        </aside>

        {/* Center Feed Column (ONLY this scrolls! Increased feed size: max-w-[740px]) */}
        <main className="flex-1 h-full overflow-y-auto px-2 sm:px-6 py-4">
          <div className="max-w-[740px] mx-auto space-y-4 pb-12">
            {/* Create Post Card Trigger */}
            <CreatePostTrigger
              onClick={(mode) => handleOpenCreateModal(mode)}
              onRequireAuth={requireAuth}
            />

            {/* Facebook-style Feed Filter Pills */}
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-2 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('ALL')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'ALL'
                      ? 'bg-[#e02f21] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <Sparkles size={14} />
                  <span>{t('allPosts')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('RECIPE')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'RECIPE'
                      ? 'bg-[#e02f21] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <Utensils size={14} />
                  <span>{t('recipesOnly')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('CASUAL')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'CASUAL'
                      ? 'bg-[#e02f21] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <MessageSquare size={14} />
                  <span>{t('casualOnly')}</span>
                </button>

                {session?.user && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('FOLLOWING')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'FOLLOWING'
                        ? 'bg-[#e02f21] text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                  >
                    <Heart size={14} />
                    <span>{t('followingOnly')}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={fetchFeed}
                title="Refresh feed"
                className="p-1.5 rounded-full text-gray-400 hover:text-[#e02f21] hover:bg-gray-100 dark:hover:bg-gray-800 transition mr-1 cursor-pointer"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Active Filters Bar */}
            {hasAnyFilter && (
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-100 dark:border-red-900/40">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-gray-600 dark:text-gray-300">Filtering by:</span>
                  {activeCuisine && (
                    <span className="bg-[#e02f21] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      Cuisine: {activeCuisine}
                      <button type="button" onClick={() => setActiveCuisine('')} className="cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {activeTag && (
                    <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      Tag: #{activeTag}
                      <button type="button" onClick={() => setActiveTag('')} className="cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {activeMaxTime && (
                    <span className="bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      ≤ {activeMaxTime} mins
                      <button type="button" onClick={() => setActiveMaxTime('')} className="cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {searchKeyword && (
                    <span className="bg-gray-800 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      "{searchKeyword}"
                      <button type="button" onClick={clearSearch} className="cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#e02f21] hover:underline cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Clear all</span>
                </button>
              </div>
            )}

            {/* Posts Stream */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onOpenComments={(selected) => setSelectedPostForComments(selected)}
                    onOpenShare={(selected) => handleSharePost(selected)}
                    onRequireAuth={requireAuth}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center mx-auto">
                  <Utensils size={32} />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  No recipes or posts found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try clearing your active filters or be the first to share a recipe with the Hesheli community!
                </p>
                {hasAnyFilter && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#e02f21] text-white text-xs font-bold rounded-xl hover:bg-[#c22417] transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar (Fixed column, Does NOT scroll with feed - Tags, Cuisines, Filters) */}
        <aside className="hidden lg:block w-[280px] xl:w-[320px] 2xl:w-[340px] h-full shrink-0 px-3 py-3 overflow-y-auto no-scrollbar border-l border-transparent">
          <RightSidebar
            activeCuisine={activeCuisine}
            onSelectCuisine={setActiveCuisine}
            activeTag={activeTag}
            onSelectTag={setActiveTag}
            activeMaxTime={activeMaxTime}
            onSelectMaxTime={setActiveMaxTime}
            onResetFilters={handleResetFilters}
          />
        </aside>
      </div>

      {/* Modal: Create Post (Facebook style per Image 2) */}
      <CreatePostModal
        isOpen={isCreateOpen}
        initialMode={createInitialMode}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={fetchFeed}
      />

      {/* Modal: Post Comments / Details (Facebook style per Image 3) */}
      {selectedPostForComments && (
        <PostDetailsModal
          isOpen={Boolean(selectedPostForComments)}
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          onPostUpdated={fetchFeed}
          onRequireAuth={requireAuth}
        />
      )}
    </div>
  );
};

export default SocialFeed;
