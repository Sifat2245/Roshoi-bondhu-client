import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import { FeedLayout } from '../../app/layouts/FeedLayout';
import CreatePostTrigger from '../../features/posts/components/CreatePostTrigger';
import PostCard from '../../features/posts/components/PostCard';
import CreatePostModal from '../../features/posts/components/CreatePostModal';
import PostDetailsModal from '../../features/posts/components/PostDetailsModal';
import { PostSkeleton } from '../../components/ui/Skeleton';
import postsApi from '../../features/posts/api/posts.api';
import { Utensils, X, RotateCcw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const SocialFeed = () => {
  const { notify } = useToast();
  const { data: session, isPending: authLoading } = useSession();
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
      const data = await postsApi.getPosts(
        {
          type: typeParam,
          filter: filterParam,
          cuisine: activeCuisine,
          tag: activeTag,
          maxTime: activeMaxTime,
          search: searchKeyword,
        },
        session?.session?.token
      );
      setPosts(data);
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

    try {
      await postsApi.sharePost(post.id, '', session?.session?.token);
      notify.success('Post shared to your feed');
      fetchFeed();
    } catch (err) {
      notify.error(err.message || 'Error sharing post');
    }
  };

  const hasAnyFilter = Boolean(activeCuisine || activeTag || activeMaxTime || searchKeyword || typeParam || filterParam);

  if (authLoading) {
    return (
      <FeedLayout>
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </FeedLayout>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <>
      <FeedLayout
        onOpenCreatePost={() => handleOpenCreateModal('CASUAL')}
        activeCuisine={activeCuisine}
        onSelectCuisine={setActiveCuisine}
        activeTag={activeTag}
        onSelectTag={setActiveTag}
        activeMaxTime={activeMaxTime}
        onSelectMaxTime={setActiveMaxTime}
        onResetFilters={handleResetFilters}
      >
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
                  onDeletePost={(deletedId) =>
                    setPosts((prev) => prev.filter((p) => p.id !== deletedId))
                  }
                  onUpdatePost={(updated) =>
                    setPosts((prev) =>
                      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
                    )
                  }
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
      </FeedLayout>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        initialMode={createInitialMode}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={fetchFeed}
      />

      {/* Post Details Modal */}
      {selectedPostForComments && (
        <PostDetailsModal
          isOpen={Boolean(selectedPostForComments)}
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          onPostUpdated={fetchFeed}
          onRequireAuth={requireAuth}
        />
      )}
    </>
  );
};

export default SocialFeed;
