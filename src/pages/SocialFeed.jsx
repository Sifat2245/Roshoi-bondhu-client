import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useSession } from '../lib/auth-client';
import { useLanguage } from '../context/LanguageContext';
import SocialHeader from '../components/common/SocialHeader';
import LeftSidebar from '../components/LeftSidebar';
import CreatePostTrigger from '../components/feed/CreatePostTrigger';
import PostCard from '../components/feed/PostCard';
import CreatePostModal from '../components/modals/CreatePostModal';
import PostDetailsModal from '../components/modals/PostDetailsModal';
import { Sparkles, Utensils, MessageSquare, Heart, RefreshCw, X } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SocialFeed = () => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'RECIPE', 'CASUAL', 'FOLLOWING'
  const [activeCuisine, setActiveCuisine] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState('CASUAL');
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  const searchKeyword = searchParams.get('search') || '';

  const requireAuth = () => {
    navigate('/login');
  };

  // Fetch feed
  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'RECIPE') params.set('type', 'RECIPE');
      if (activeTab === 'CASUAL') params.set('type', 'CASUAL');
      if (activeTab === 'FOLLOWING') params.set('filter', 'FOLLOWING');
      if (activeCuisine) params.set('cuisine', activeCuisine);
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
  }, [activeTab, activeCuisine, searchKeyword, session]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const clearSearch = () => {
    searchParams.delete('search');
    setSearchParams(searchParams);
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

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Fixed Full-width Facebook Header */}
      <SocialHeader onOpenCreatePost={() => handleOpenCreateModal('CASUAL')} />

      {/* Main Full-Width Body with pt-14 for fixed header */}
      <div className="pt-14 w-full">
        <div className="flex justify-center min-h-[calc(100vh-3.5rem)]">
          {/* Left Fixed Sidebar (Desktop only - Stays sticky when scrolling) */}
          <aside className="hidden lg:block fixed top-14 left-0 bottom-0 w-[280px] xl:w-[320px] px-2 py-3 overflow-y-auto no-scrollbar z-30">
            <LeftSidebar />
          </aside>

          {/* Center Feed Column (Centered in the viewport, max-w-[620px]) */}
          <main className="w-full max-w-[620px] px-2 sm:px-4 py-4 space-y-4">
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
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'ALL'
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
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'RECIPE'
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
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'CASUAL'
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
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      activeTab === 'FOLLOWING'
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

            {/* Active Search / Cuisine Filter Badge */}
            {(activeCuisine || searchKeyword) && (
              <div className="flex items-center gap-2 flex-wrap text-xs bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-100 dark:border-red-900">
                <span className="font-semibold text-gray-600 dark:text-gray-300">Filtering:</span>
                {activeCuisine && (
                  <span className="bg-[#e02f21] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    Cuisine: {activeCuisine}
                    <button type="button" onClick={() => setActiveCuisine('')} className="cursor-pointer">
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
                    <div className="h-60 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
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
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-800 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center mx-auto">
                  <Utensils size={32} />
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  No recipes or posts found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Be the first to share a delicious cooking recipe or foodie update with the Hesheli community!
                </p>
              </div>
            )}
          </main>

          {/* Right Spacer (Desktop only) - Kept empty per user request */}
          <div className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 pointer-events-none" aria-hidden="true" />
        </div>
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
