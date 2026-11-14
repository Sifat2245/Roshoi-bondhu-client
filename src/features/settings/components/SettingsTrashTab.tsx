import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from '../../../lib/auth-client';
import { useToast } from '../../../context/ToastContext';
import postsApi from '../../posts/api/posts.api';
import { Post } from '../../posts/types/post.types';
import Modal from '../../../components/ui/Modal';
import {
  Trash2,
  RotateCcw,
  Clock,
  Utensils,
  MessageSquare,
  Repeat,
  AlertTriangle,
  Loader2,
  Calendar,
} from 'lucide-react';

export const SettingsTrashTab: React.FC = () => {
  const { data: session } = useSession();
  const token = session?.session?.token;
  const { notify } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [postToDeletePermanently, setPostToDeletePermanently] = useState<Post | null>(null);
  const [isDeletingPermanently, setIsDeletingPermanently] = useState(false);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [isEmptying, setIsEmptying] = useState(false);

  const fetchTrash = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await postsApi.getTrash(token);
      setPosts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trashed posts');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  // Restore post back to active feed
  const handleRestore = async (post: Post) => {
    setRestoringId(post.id);
    try {
      await postsApi.restorePost(post.id, token);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } catch (err: any) {
      notify.error(err.message || 'Failed to restore post');
    } finally {
      setRestoringId(null);
    }
  };

  // Permanently delete a single post
  const handleConfirmPermanentDelete = async () => {
    if (!postToDeletePermanently) return;
    setIsDeletingPermanently(true);
    try {
      await postsApi.permanentDeletePost(postToDeletePermanently.id, token);
      setPosts((prev) => prev.filter((p) => p.id !== postToDeletePermanently.id));
      setPostToDeletePermanently(null);
    } catch (err: any) {
      notify.error(err.message || 'Failed to delete post permanently');
    } finally {
      setIsDeletingPermanently(false);
    }
  };

  // Empty all items from trash
  const handleConfirmEmptyTrash = async () => {
    setIsEmptying(true);
    try {
      await postsApi.emptyTrash(token);
      setPosts([]);
      setShowEmptyConfirm(false);
    } catch (err: any) {
      notify.error(err.message || 'Failed to empty trash');
    } finally {
      setIsEmptying(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21]">
              <Trash2 size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">
                Trash
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Manage posts and recipes you have moved to trash.
              </p>
            </div>
          </div>

          {posts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowEmptyConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer self-start sm:self-auto"
            >
              <Trash2 size={14} />
              <span>Empty Trash</span>
            </button>
          )}
        </div>

        {/* 30-Day Auto Delete Notice Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
          <Clock size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5 leading-relaxed">
            <span className="font-bold">30-day automatic deletion policy: </span>
            <span>
              Items in your trash are only visible to you. If you don&apos;t do anything, posts will be automatically and permanently removed 30 days after being moved to trash.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Loading State */}
      {isLoading && (
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 size={32} className="animate-spin text-[#e02f21]" />
          <p className="text-xs font-semibold text-gray-500">Loading trash items…</p>
        </div>
      )}

      {/* 3. Error State */}
      {!isLoading && error && (
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-xs text-center space-y-3">
          <AlertTriangle size={32} className="mx-auto text-amber-500" />
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{error}</p>
          <button
            type="button"
            onClick={fetchTrash}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 4. Empty State */}
      {!isLoading && !error && posts.length === 0 && (
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 border border-gray-100 dark:border-gray-800 shadow-xs text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-[#2b2c2d] flex items-center justify-center mx-auto text-gray-400">
            <Trash2 size={26} />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Trash is empty
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            When you delete recipes or posts from your feed, they&apos;ll be kept here for 30 days before being permanently removed.
          </p>
        </div>
      )}

      {/* 5. Trashed Items List */}
      {!isLoading && !error && posts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {posts.length} {posts.length === 1 ? 'item' : 'items'} in trash
            </p>
          </div>

          <div className="space-y-3">
            {posts.map((post) => {
              const isRecipe = post.postType === 'RECIPE';
              const isRepost = post.postType === 'REPOST';
              const imageSrc =
                post.image ||
                (post.images && post.images.length > 0 ? post.images[0] : null);
              const daysLeft =
                typeof post.daysRemaining === 'number'
                  ? post.daysRemaining
                  : 30;
              const isUrgent = daysLeft <= 5;
              const isCurrentlyRestoring = restoringId === post.id;

              return (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-gray-200 dark:hover:border-gray-700 w-full overflow-hidden"
                >
                  {/* Left: Thumbnail & Post Details */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 w-full flex-1 overflow-hidden">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={post.title || post.caption || 'Trashed post'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">
                          {isRecipe ? (
                            <Utensils size={22} />
                          ) : isRepost ? (
                            <Repeat size={22} />
                          ) : (
                            <MessageSquare size={22} />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Type badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isRecipe
                              ? 'bg-red-50 text-[#e02f21] dark:bg-red-950/40 dark:text-red-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {isRecipe ? (
                            <>
                              <Utensils size={10} />
                              <span>Recipe</span>
                            </>
                          ) : isRepost ? (
                            <>
                              <Repeat size={10} />
                              <span>Repost</span>
                            </>
                          ) : (
                            <>
                              <MessageSquare size={10} />
                              <span>Post</span>
                            </>
                          )}
                        </span>

                        {/* Days left pill */}
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            isUrgent
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800'
                              : 'bg-gray-100 text-gray-600 dark:bg-[#2b2c2d] dark:text-gray-400'
                          }`}
                        >
                          <Clock size={11} />
                          <span>{daysLeft} days left</span>
                        </span>
                      </div>

                      {/* Title or content */}
                      <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 break-words">
                        {post.title || post.caption || post.content || 'Untitled post'}
                      </p>

                      {/* Trashed date */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 min-w-0">
                        <Calendar size={12} className="shrink-0" />
                        <span className="truncate">
                          Moved to trash on {formatDate(post.deletedAt || post.updatedAt || post.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800 shrink-0">
                    <button
                      type="button"
                      disabled={isCurrentlyRestoring}
                      onClick={() => handleRestore(post)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-[#2b2c2d] hover:bg-gray-200 dark:hover:bg-[#343638] text-gray-800 dark:text-gray-200 transition cursor-pointer disabled:opacity-50"
                    >
                      {isCurrentlyRestoring ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <RotateCcw size={13} />
                      )}
                      <span>Restore</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPostToDeletePermanently(post)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                    >
                      <Trash2 size={13} className="shrink-0" />
                      <span>Delete permanently</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Post Permanently */}
      <Modal
        isOpen={Boolean(postToDeletePermanently)}
        onClose={() => setPostToDeletePermanently(null)}
        title="Delete post permanently?"
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                This action cannot be undone
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                &ldquo;{postToDeletePermanently?.title || postToDeletePermanently?.caption || 'This post'}&rdquo; will be permanently deleted from the database. You will not be able to restore it.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isDeletingPermanently}
              onClick={() => setPostToDeletePermanently(null)}
              className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeletingPermanently}
              onClick={handleConfirmPermanentDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e02f21] hover:bg-[#c22417] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isDeletingPermanently ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Deleting…</span>
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  <span>Delete permanently</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal: Empty All Trash */}
      <Modal
        isOpen={showEmptyConfirm}
        onClose={() => setShowEmptyConfirm(false)}
        title="Empty all items in trash?"
        maxWidth="max-w-md"
      >
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
              <Trash2 size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Permanently delete all {posts.length} {posts.length === 1 ? 'item' : 'items'}?
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                All posts and recipes currently in your trash will be removed forever. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isEmptying}
              onClick={() => setShowEmptyConfirm(false)}
              className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isEmptying}
              onClick={handleConfirmEmptyTrash}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e02f21] hover:bg-[#c22417] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isEmptying ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Emptying…</span>
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  <span>Empty trash</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsTrashTab;

