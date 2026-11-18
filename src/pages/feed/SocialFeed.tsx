import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useSession } from "../../lib/auth-client";
import { useAuth } from "../../context/AuthContext";
import { FeedLayout } from "../../app/layouts/FeedLayout";
import CreatePostTrigger from "../../features/posts/components/CreatePostTrigger";
import PostCard from "../../features/posts/components/PostCard";
import CreatePostModal from "../../features/posts/components/CreatePostModal";
import PostDetailsModal from "../../features/posts/components/PostDetailsModal";
import SharePostModal from "../../features/posts/components/SharePostModal";
import FeedPeopleYouMayKnow from "../../features/friends/components/FeedPeopleYouMayKnow";
import UploadProgressFeedCard from "../../features/posts/components/UploadProgressFeedCard";
import { PostSkeleton } from "../../components/ui/Skeleton";
import { uniquePreservingOrder } from "../../features/posts/model/post-policy";
import {
  useFeedInfiniteQuery,
  useInvalidateFeedQueries,
} from "../../features/posts/hooks/useFeedQueries";
import { Utensils, X, RotateCcw } from "lucide-react";

const SocialFeed = () => {
  const { data: session } = useSession();
  const { user: authUser } = useAuth();
  const activeUser = session?.user || authUser;
  const token = session?.session?.token;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active filters from query or local state
  const typeParam = searchParams.get("type") || ""; // 'RECIPE', 'CASUAL'
  const filterParam = searchParams.get("filter") || ""; // 'FOLLOWING'
  const searchKeyword = searchParams.get("search") || "";

  const [activeCuisine, setActiveCuisine] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [activeMaxTime, setActiveMaxTime] = useState("");

  // TanStack Query Infinite Query with 10 minutes cache
  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isFeedLoading,
    isError: isFeedError,
    refetch: refetchFeed,
  } = useFeedInfiniteQuery({
    type: typeParam,
    filter: filterParam,
    cuisine: activeCuisine,
    tag: activeTag,
    maxTime: activeMaxTime,
    search: searchKeyword,
    actorId: activeUser?.id,
    token,
  });

  const {
    invalidateFeed,
    updatePostInFeed,
    deletePostFromFeed,
  } = useInvalidateFeedQueries();

  // Flatten posts across pages
  const posts = useMemo(() => {
    if (!feedData?.pages) return [];
    const all = feedData.pages.flatMap((page) => page.posts || []);
    return uniquePreservingOrder(all);
  }, [feedData]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState("CASUAL");
  const [selectedPostForComments, setSelectedPostForComments] = useState<any>(null);
  const [sharingPost, setSharingPost] = useState<any>(null);

  const requireAuth = () => {
    navigate("/login");
  };

  const clearSearch = () => {
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setActiveCuisine("");
    setActiveTag("");
    setActiveMaxTime("");
    clearSearch();
    navigate("/");
  };

  const handleOpenCreateModal = (mode = "CASUAL") => {
    if (!activeUser) {
      requireAuth();
      return;
    }
    setCreateInitialMode(mode);
    setIsCreateOpen(true);
  };

  const handleSharePost = (post: any) => {
    if (!activeUser) {
      requireAuth();
      return;
    }
    setSharingPost(post);
  };

  const hasAnyFilter = Boolean(
    activeCuisine ||
    activeTag ||
    activeMaxTime ||
    searchKeyword,
  );

  if (!activeUser) {
    return null;
  }

  return (
    <>
      <FeedLayout
        onOpenCreatePost={() => handleOpenCreateModal("CASUAL")}
        activeCuisine={activeCuisine}
        onSelectCuisine={setActiveCuisine}
        activeTag={activeTag}
        onSelectTag={setActiveTag}
        activeMaxTime={activeMaxTime}
        onSelectMaxTime={setActiveMaxTime}
        onResetFilters={handleResetFilters}
      >
        {/* Feed Error Alert */}
        {isFeedError && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-[#242526] p-4"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your feed could not be loaded. Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => refetchFeed()}
              className="mt-3 text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}
        <CreatePostTrigger
          onClick={(mode) => handleOpenCreateModal(mode)}
          onRequireAuth={requireAuth}
        />
        <UploadProgressFeedCard />

        {/* Active Filters Summary Bar */}
        {hasAnyFilter && (
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-100 dark:border-red-900/40">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-gray-600 dark:text-gray-300">
                Filters:
              </span>
              {activeCuisine && (
                <span className="bg-[#e02f21] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  Cuisine: {activeCuisine}
                  <button
                    type="button"
                    onClick={() => setActiveCuisine("")}
                    className="cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeTag && (
                <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  Tag: {activeTag}
                  <button
                    type="button"
                    onClick={() => setActiveTag("")}
                    className="cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeMaxTime && (
                <span className="bg-amber-600 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  Time: ≤{activeMaxTime}m
                  <button
                    type="button"
                    onClick={() => setActiveMaxTime("")}
                    className="cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {searchKeyword && (
                <span className="bg-gray-800 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  "{searchKeyword}"
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="cursor-pointer"
                  >
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
        {isFeedLoading ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length > 0 ? (
          posts.map((post, index) => (
            <React.Fragment key={post.id}>
              <PostCard
                post={post}
                onOpenComments={(selected) =>
                  setSelectedPostForComments(selected)
                }
                onOpenShare={handleSharePost}
                onRequireAuth={requireAuth}
                onDeletePost={(deletedId) => deletePostFromFeed(deletedId)}
                onUpdatePost={(updated) => updatePostInFeed(updated)}
              />
              {index === 3 && <FeedPeopleYouMayKnow />}
            </React.Fragment>
          ))
        ) : isFeedError ? null : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 sm:p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center mx-auto">
                <Utensils size={32} />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                {hasAnyFilter ? "No Posts Match Your Filters" : "Welcome to Your Heshel Feed"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                {hasAnyFilter
                  ? "Try clearing some of your cuisine or tag filters to see more delicious food posts."
                  : "Discover heirloom recipes, culinary tips, and food updates from friends and passionate cooks. Share your first recipe or add friends to see more!"}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                {hasAnyFilter ? (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-[#e02f21] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#c22417] transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenCreateModal("RECIPE")}
                    className="px-4 py-2 bg-[#e02f21] text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-[#c22417] transition cursor-pointer"
                  >
                    Share First Recipe
                  </button>
                )}
              </div>
            </div>

            {/* Embedded People You May Know for new or caught-up users */}
            <FeedPeopleYouMayKnow />
          </div>
        )}
        {!isFeedLoading && hasNextPage && (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full rounded-xl bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] disabled:opacity-60 cursor-pointer"
          >
            {isFetchingNextPage ? "Loading more posts…" : "Load more posts"}
          </button>
        )}
        {!isFeedLoading && !hasNextPage && posts.length > 0 && (
          <p
            role="status"
            className="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            You’re all caught up. Check back for more from your food community.
          </p>
        )}
      </FeedLayout>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        initialMode={createInitialMode}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={() => invalidateFeed()}
      />

      {/* Post Details Modal */}
      {selectedPostForComments && (
        <PostDetailsModal
          isOpen={Boolean(selectedPostForComments)}
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          onPostUpdated={(change?: { comment?: any }) => {
            if (!change?.comment) {
              invalidateFeed();
              return;
            }
            const postId = selectedPostForComments.id;
            updatePostInFeed({
              id: postId,
              commentCount: (selectedPostForComments.commentCount || 0) + 1,
            });
          }}
          onRequireAuth={requireAuth}
        />
      )}
      {/* Share Post Modal Popup */}
      <SharePostModal
        post={sharingPost}
        isOpen={Boolean(sharingPost)}
        onClose={() => setSharingPost(null)}
        onShared={() => invalidateFeed()}
      />
    </>
  );
};

export default SocialFeed;
