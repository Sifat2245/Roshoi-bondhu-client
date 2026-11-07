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
import { PostSkeleton } from '../../components/ui/Skeleton';
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

  // Active filters from query or local state
  const typeParam = searchParams.get('type') || ''; // 'RECIPE', 'CASUAL'
  const filterParam = searchParams.get('filter') || ''; // 'FOLLOWING'
  const searchKeyword = searchParams.get('search') || '';

  const [activeCuisine, setActiveCuisine] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [activeMaxTime, setActiveMaxTime] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState('CASUAL');
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  const requireAuth = () => {
    navigate('/login');
  };

  // Fetch feed with all filter parameters
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeParam) params.set('type', typeParam);
      if (filterParam) params.set('filter', filterParam);
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
  }, [typeParam, filterParam, activeCuisine, activeTag, activeMaxTime, searchKeyword, session]);

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
    navigate('/');
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

  const hasAnyFilter = Boolean(activeCuisine || activeTag || activeMaxTime || searchKeyword || typeParam || filterParam);

  if (authLoading) {
    return (
      <div className="h-screen flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
        <SocialHeader />
        <div className="flex-1 mt-14 flex justify-between overflow-hidden">
          <aside className="hidden lg:block w-[280px] xl:w-[320px] 2xl:w-[340px] h-full shrink-0 px-2 py-3">
            <LeftSidebar />
          </aside>
          <main className="flex-1 h-full overflow-y-auto px-2 sm:px-6 py-4">
            <div className="max-w-[740px] mx-auto space-y-4">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </div>
          </main>
          <aside className="hidden xl:block w-[280px] 2xl:w-[320px] h-full shrink-0 px-3 py-4">
            <RightSidebar />
          </aside>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      {/* 1. Fixed Topbar with Central Navigation (Home, Recipes, Groups, Thoughts, Following) */}
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
            {/* Create Post Trigger Box */}
            <CreatePostTrigger
              onClick={(mode) => handleOpenCreateModal(mode)}
              onRequireAuth={requireAuth}
            />

            {/* Active Filters Summary Bar */}
            {hasAnyFilter && (
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-100 dark:border-red-900/40">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-gray-600 dark:text-gray-300">Filtering:</span>
                  {typeParam && (
                    <span className="bg-[#e02f21] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      {typeParam === 'RECIPE' ? 'Recipes Only' : 'Foodie Thoughts'}
                      <button type="button" onClick={() => navigate('/')} className="cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {filterParam === 'FOLLOWING' && (
                    <span className="bg-[#e02f21] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      Following Feed
                      <button type="button" onClick={() => navigate('/')} className="cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  )}
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
                      Tag: {activeTag}
                      <button type="button" onClick={() => setActiveTag('')} className="cursor-pointer">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {activeMaxTime && (
                    <span className="bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      Time: ≤{activeMaxTime}m
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
                  className="flex items-center gap-1 text-[11px] font-bold text-[#e02f21] hover:underline cursor-pointer ml-auto"
                >
                  <RotateCcw size={12} />
                  <span>Reset All</span>
                </button>
              </div>
            )}

            {/* Posts Stream / Skeleton Loading */}
            {loading ? (
              <div className="space-y-4">
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenComments={(selected) => setSelectedPostForComments(selected)}
                  onOpenShare={handleSharePost}
                  onRequireAuth={requireAuth}
                />
              ))
            ) : (
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center mx-auto">
                  <Utensils size={32} />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  No Posts or Recipes Found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {hasAnyFilter
                    ? 'Try clearing some of your cuisine or tag filters to see more delicious food posts.'
                    : 'Be the first to share an heirloom recipe or a delicious foodie story!'}
                </p>
                {hasAnyFilter ? (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#e02f21] text-white text-xs font-bold rounded-xl hover:bg-[#c22417] transition"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal('RECIPE')}
                    className="px-4 py-2 bg-[#e02f21] text-white text-xs font-bold rounded-xl hover:bg-[#c22417] transition"
                  >
                    Share First Recipe
                  </button>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar (Cuisines, Cooking Time, Tags Filters) */}
        <aside className="hidden xl:block w-[280px] 2xl:w-[320px] h-full shrink-0 px-3 py-4 overflow-y-auto no-scrollbar border-l border-transparent">
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

      {/* Facebook-style Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        initialMode={createInitialMode}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={fetchFeed}
      />

      {/* Facebook-style Post Details Modal (Comments) */}
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
