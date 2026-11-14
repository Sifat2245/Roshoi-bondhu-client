import React, { useState, useEffect, useCallback, useRef } from "react";
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
import {
  uniqueRecent,
  type FeedCursor,
} from "../../features/posts/model/post-policy";
import postsApi from "../../features/posts/api/posts.api";
import { Utensils, X, RotateCcw } from "lucide-react";

const SocialFeed = () => {
  const { data: session } = useSession();
  const { user: authUser } = useAuth();
  const activeUser = session?.user || authUser;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const requestId = useRef(0);
  const hasLoaded = useRef(false);
  const [cursor, setCursor] = useState<FeedCursor | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const morePending = useRef(false);
  const retryCursor = useRef<FeedCursor | undefined>(undefined);

  // Active filters from query or local state
  const typeParam = searchParams.get("type") || ""; // 'RECIPE', 'CASUAL'
  const filterParam = searchParams.get("filter") || ""; // 'FOLLOWING'
  const searchKeyword = searchParams.get("search") || "";

  const [activeCuisine, setActiveCuisine] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [activeMaxTime, setActiveMaxTime] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState("CASUAL");
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [sharingPost, setSharingPost] = useState<any>(null);

  const requireAuth = () => {
    navigate("/login");
  };

  // Fetch feed with all filter parameters
  const fetchFeed = useCallback(
    async (next?: FeedCursor) => {
      if (next && morePending.current) return;
      morePending.current = Boolean(next);
      retryCursor.current = next;
      setLoadingMore(Boolean(next));
      const currentRequest = ++requestId.current;
      if (!hasLoaded.current) setLoading(true);
      setFeedError("");
      try {
        const data = await postsApi.getFeedPage(
          {
            type: typeParam,
            filter: filterParam,
            cuisine: activeCuisine,
            tag: activeTag,
            maxTime: activeMaxTime,
            search: searchKeyword,
          },
          null,
          activeUser?.id,
          next,
        );
        if (currentRequest === requestId.current) {
          setPosts((previous) =>
            next ? uniqueRecent([...previous, ...data.posts]) : data.posts,
          );
          setCursor(data.cursor);
        }
      } catch {
        if (currentRequest === requestId.current) {
          setFeedError(
            "Your feed could not be loaded. Please check your connection and try again.",
          );
        }
      } finally {
        if (currentRequest === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
          morePending.current = false;
          hasLoaded.current = true;
        }
      }
    },
    [
      typeParam,
      filterParam,
      activeCuisine,
      activeTag,
      activeMaxTime,
      searchKeyword,
      activeUser?.id,
    ],
  );

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    setLoading(true);
    fetchFeed();
  }, [fetchFeed]);

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
    searchKeyword ||
    typeParam ||
    filterParam,
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
        {/* Create Post Trigger Box */}
        {feedError && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-[#242526] p-4"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {feedError}
            </p>
            <button
              type="button"
              onClick={() => fetchFeed(retryCursor.current)}
              className="mt-3 text-sm font-bold text-[#e02f21]"
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
                Filtering:
              </span>
              {typeParam && (
                <span className="bg-[#e02f21] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  {typeParam === "RECIPE" ? "Recipes Only" : "Foodie Thoughts"}
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {filterParam === "FOLLOWING" && (
                <span className="bg-[#e02f21] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  Following Feed
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
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
        {loading ? (
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
                onDeletePost={(deletedId) =>
                  setPosts((prev) => prev.filter((p) => p.id !== deletedId))
                }
                onUpdatePost={(updated) =>
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === updated.id ? { ...p, ...updated } : p,
                    ),
                  )
                }
              />
              {index === 3 && <FeedPeopleYouMayKnow />}
            </React.Fragment>
          ))
        ) : feedError ? null : (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center mx-auto">
              <Utensils size={32} />
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              No Posts or Recipes Found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {hasAnyFilter
                ? "Try clearing some of your cuisine or tag filters to see more delicious food posts."
                : "Be the first to share an heirloom recipe or a delicious foodie story!"}
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
                onClick={() => handleOpenCreateModal("RECIPE")}
                className="px-4 py-2 bg-[#e02f21] text-white text-xs font-bold rounded-xl hover:bg-[#c22417] transition"
              >
                Share First Recipe
              </button>
            )}
          </div>
        )}
        {!loading && cursor && (
          <button
            type="button"
            onClick={() => fetchFeed(cursor)}
            disabled={loadingMore}
            className="w-full rounded-xl bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] disabled:opacity-60"
          >
            {loadingMore ? "Loading more posts…" : "Load more posts"}
          </button>
        )}
        {!loading && !cursor && posts.length > 0 && (
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
        onPostCreated={fetchFeed}
      />

      {/* Post Details Modal */}
      {selectedPostForComments && (
        <PostDetailsModal
          isOpen={Boolean(selectedPostForComments)}
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          onPostUpdated={(change?: { comment?: any }) => {
            if (!change?.comment) {
              fetchFeed();
              return;
            }
            const postId = selectedPostForComments.id;
            setPosts((previous) =>
              previous.map((post) =>
                post.id === postId
                  ? { ...post, commentCount: (post.commentCount || 0) + 1 }
                  : post,
              ),
            );
          }}
          onRequireAuth={requireAuth}
        />
      )}
      {/* Share Post Modal Popup */}
      <SharePostModal
        post={sharingPost}
        isOpen={Boolean(sharingPost)}
        onClose={() => setSharingPost(null)}
        onShared={fetchFeed}
      />
    </>
  );
};

export default SocialFeed;
