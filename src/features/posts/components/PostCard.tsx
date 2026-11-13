import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { useSession } from "../../../lib/auth-client";
import PostIdentity from "./PostIdentity";
import SharedPostPreview from "./SharedPostPreview";
import PostPoll from "../../community/components/PostPoll";
import Avatar from "../../../components/ui/Avatar";
import postsApi from "../api/posts.api";
import LikeButton from "./LikeButton";
import { usePostLike } from "../model/usePostLike";
import { useToast } from "../../../context/ToastContext";
import Modal from "../../../components/ui/Modal";
import { pinnedIn, canSharePost, type PinContext } from "../model/post-policy";
import SaveRecipeModal from "../../kitchen/components/SaveRecipeModal";
import { useKitchen } from "../../kitchen/model/kitchen-store";
import { useSocial } from "../../community/model/useSocial";
import {
  Heart,
  MessageCircle,
  Share2,
  ChefHat,
  Clock,
  Users,
  Globe,
  MoreHorizontal,
  Pin,
  Edit3,
  Copy,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Bookmark,
} from "lucide-react";

interface PostCardProps {
  post: any;
  onOpenComments?: (post: any) => void;
  onOpenShare?: (post: any) => void;
  onRequireAuth?: () => void;
  onDeletePost?: (postId: string) => void;
  onUpdatePost?: (updatedPost: any) => void;
  pinContext?: PinContext;
  canManageGroupPins?: boolean;
  showPinBadge?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  onOpenShare,
  onRequireAuth,
  onDeletePost,
  onUpdatePost,
  pinContext,
  canManageGroupPins = false,
  showPinBadge = true,
}) => {
  const { data: session } = useSession();
  const { user, state: social, update: updateSocial } = useSocial();
  const { notify } = useToast();
  const { state: kitchen } = useKitchen();
  const [showSave, setShowSave] = useState(false);
  const isRecipeSaved = kitchen.collections.some((collection) =>
    collection.recipeIds.includes(post.id),
  );

  const { hasLiked, likeCount, handleLike } = usePostLike(post, onRequireAuth);

  // Post Actions Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isPinned = pinnedIn(post, social.pins, pinContext);
  const canPin =
    pinContext?.type === "profile"
      ? user?.id === (post.authorId || post.author?.id)
      : Boolean(
          pinContext?.type === "group" &&
          canManageGroupPins &&
          post.groupId === pinContext.groupId,
        );
  const [isDeleted, setIsDeleted] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || "");
  const [title, setTitle] = useState(post.title || "");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Trash / Delete Modal
  const [showTrashConfirm, setShowTrashConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", escape);
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", escape);
    };
  }, [isMenuOpen]);

  const handleTogglePin = () => {
    if (!canPin || !pinContext) return;
    const nextState = !isPinned;
    try {
      updateSocial((state) => {
        const saved = (state.pins[post.id] ||= {});
        if (pinContext.type === "profile") saved.profile = nextState;
        else (saved.groups ||= {})[pinContext.groupId] = nextState;
      });
      setIsMenuOpen(false);
      notify.success(
        nextState
          ? pinContext.type === "group"
            ? "Post pinned in this group's Featured section"
            : "Post pinned to your profile"
          : "Post unpinned",
      );
    } catch {
      notify.error("Could not save this pin on your device. Please try again.");
    }
  };

  // Copy Link
  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl).then(
      () => {
        notify.success(
          post.id.startsWith("local-post-")
            ? "Preview link copied. It works on this device."
            : "Link copied to clipboard",
        );
        setIsMenuOpen(false);
      },
      () => {
        notify.error("Failed to copy link");
        setIsMenuOpen(false);
      },
    );
  };

  // Trigger Edit
  const handleOpenEdit = () => {
    setIsMenuOpen(false);
    setIsEditing(true);
  };

  // Save Edit
  const handleSaveEdit = async () => {
    setIsSavingEdit(true);
    try {
      await postsApi.updatePost(
        post.id,
        {
          caption: caption.trim(),
          title: title.trim(),
        },
        session?.session?.token,
        user?.id,
      );
      if (onUpdatePost) {
        onUpdatePost({ ...post, caption: caption.trim(), title: title.trim() });
      }
      notify.success("Post updated successfully");
      setIsEditing(false);
    } catch (err: any) {
      notify.error(err.message || "Failed to update post");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Move to Trash (Delete)
  const handleConfirmTrash = async () => {
    setIsDeleting(true);
    try {
      await postsApi.deletePost(post.id, session?.session?.token, user?.id);
      setIsDeleted(true);
      setShowTrashConfirm(false);
      setIsMenuOpen(false);
      if (onDeletePost) {
        onDeletePost(post.id);
      }
      notify.success("Post moved to trash");
    } catch (err: any) {
      notify.error(err.message || "Failed to move post to trash");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return null;
  }

  const isRecipe = post.postType === "RECIPE";
  const isRepost = post.postType === "REPOST";
  const isAuthor = user?.id === post.author?.id;

  return (
    <article
      data-post-id={post.id}
      className={`bg-white dark:bg-[#242526] text-gray-900 dark:text-gray-100 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 relative transition-shadow ${
        isMenuOpen ? "z-30" : "z-10"
      }`}
    >
      {/* Pinned Badge if pinned */}
      {showPinBadge && isPinned && (
        <div className="bg-red-50/60 dark:bg-red-950/20 px-4 py-1.5 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#e02f21]">
            <Pin size={13} className="fill-[#e02f21]" />
            <span>
              {pinContext?.type === "group"
                ? "Pinned in this group"
                : "Pinned to profile"}
            </span>
          </div>
          {canPin && (
            <button
              type="button"
              onClick={handleTogglePin}
              className="text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium cursor-pointer"
            >
              Unpin
            </button>
          )}
        </div>
      )}

      {/* Header: Author Info + 3-dots Menu */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between rounded-t-2xl">
        <PostIdentity post={post} />

        {/* 3-Dots Action Menu Container */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            aria-label="Post options"
          >
            <MoreHorizontal size={20} />
          </button>

          {/* Action Menu Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 top-10 w-64 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              {isRecipe && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowSave(true);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                >
                  <Bookmark
                    size={18}
                    className="text-[#e02f21]"
                    fill={isRecipeSaved ? "currentColor" : "none"}
                  />
                  <span>
                    {isRecipeSaved
                      ? "Manage saved recipe"
                      : "Save recipe to a cookbook"}
                  </span>
                </button>
              )}
              {/* Pins belong to the profile or group currently being viewed. */}
              {canPin && (
                <button
                  type="button"
                  onClick={handleTogglePin}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3 cursor-pointer"
                >
                  <Pin
                    size={18}
                    className={isPinned ? "text-[#e02f21]" : "text-gray-500"}
                  />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      {isPinned
                        ? "Unpin post"
                        : pinContext?.type === "group"
                          ? "Pin in group"
                          : "Pin to profile"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                      {isPinned
                        ? "Remove from top"
                        : pinContext?.type === "group"
                          ? "Show in this group’s Featured section"
                          : "Keep at the top of your profile"}
                    </p>
                  </div>
                </button>
              )}

              {/* 2. Edit Post (for author) */}
              {isAuthor && (
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3 cursor-pointer"
                >
                  <Edit3 size={18} className="text-gray-500" />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      {post.postType === "POLL" ? "Edit caption" : "Edit post"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                      {post.postType === "POLL"
                        ? "Update the text above this poll"
                        : "Update title or description"}
                    </p>
                  </div>
                </button>
              )}

              {/* 3. Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3 cursor-pointer"
              >
                <Copy size={18} className="text-gray-500" />
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">
                    Copy link
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    Copy post link to clipboard
                  </p>
                </div>
              </button>

              {/* 4. Move to Trash (Delete) */}
              {isAuthor && (
                <>
                  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowTrashConfirm(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-[#e02f21] hover:bg-red-50 dark:hover:bg-red-950/40 transition flex items-center gap-3 cursor-pointer"
                  >
                    <Trash2 size={18} className="text-[#e02f21]" />
                    <div>
                      <p className="font-bold text-sm text-[#e02f21]">
                        Move to trash
                      </p>
                      <p className="text-xs text-red-500/80 dark:text-red-400 font-normal">
                        Items in trash are removed
                      </p>
                    </div>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inline Post Editor (when Edit is active) */}
      {isEditing ? (
        <div className="p-4 bg-gray-50/70 dark:bg-gray-800/40 border-y border-gray-200 dark:border-gray-800 space-y-3">
          {isRecipe && (
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Recipe Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#18191a] border border-gray-300 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Caption
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#18191a] border border-gray-300 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e02f21] resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSavingEdit}
              onClick={handleSaveEdit}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#e02f21] hover:bg-[#c92518] transition cursor-pointer disabled:opacity-50"
            >
              {isSavingEdit ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      ) : (
        /* Caption Text */
        caption && (
          <div className="px-4 pb-3">
            <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
              {caption}
            </p>
          </div>
        )
      )}

      {/* Recipe Header (if RECIPE) */}
      {isRecipe && (
        <div className="mx-4 mb-3.5 p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-black text-base sm:text-lg text-[#e02f21]">
              <button
                type="button"
                className="text-left hover:underline"
                onClick={() => onOpenComments?.(post)}
              >
                {title || post.title}
              </button>
            </h3>
            <button
              type="button"
              aria-label={isRecipeSaved ? "Manage saved recipe" : "Save recipe"}
              aria-pressed={isRecipeSaved}
              onClick={() => setShowSave(true)}
              className="p-1.5 -mt-1 -mr-1 rounded-lg text-[#e02f21] hover:bg-red-100 dark:hover:bg-red-950/40 shrink-0"
            >
              <Bookmark
                size={19}
                fill={isRecipeSaved ? "currentColor" : "none"}
              />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            {post.cuisine && (
              <span className="px-3 py-1 rounded-lg bg-white dark:bg-gray-800 font-bold text-gray-800 dark:text-gray-200 shadow-xs flex items-center gap-1.5">
                <ChefHat size={14} className="text-[#e02f21]" /> {post.cuisine}
              </span>
            )}
            {post.preparationTime && (
              <span className="px-3 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-xs flex items-center gap-1.5">
                <Clock size={14} /> {post.preparationTime} mins
              </span>
            )}
            {post.servings && (
              <span className="px-3 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-xs flex items-center gap-1.5">
                <Users size={14} /> Serves {post.servings}
              </span>
            )}
          </div>
        </div>
      )}

      {post.postType === "POLL" && (
        <div className="mx-4 mb-4">
          <PostPoll post={post} onRequireAuth={onRequireAuth} />
        </div>
      )}
      {isRepost && (
        <div className="mx-4 mb-4">
          <SharedPostPreview post={post} />
        </div>
      )}

      {/* Media Photo */}
      {post.image && !isRepost && (
        <button
          type="button"
          aria-label={`View ${post.title || "post from " + post.author?.name}`}
          onClick={() => onOpenComments && onOpenComments(post)}
          className="block w-full cursor-pointer overflow-hidden max-h-[560px] bg-black/5 dark:bg-black/20"
        >
          <img
            src={post.image}
            alt={
              post.title || "A kitchen moment shared by " + post.author?.name
            }
            loading="lazy"
            className="w-full max-h-[560px] object-cover hover:opacity-95 transition"
          />
        </button>
      )}

      {showSave && (
        <SaveRecipeModal recipe={post} onClose={() => setShowSave(false)} />
      )}

      {/* Metrics Row */}
      <div className="px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm text-gray-500 border-b border-gray-100 dark:border-gray-800">
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white">
            <Heart size={12} fill="white" />
          </span>
          <span className="font-semibold">{likeCount}</span>
        </span>
        <button
          type="button"
          onClick={() => onOpenComments && onOpenComments(post)}
          className="hover:underline cursor-pointer font-medium"
        >
          {post.commentCount || 0} comments
        </button>
      </div>

      {/* Facebook Action Row */}
      <div className="px-2 py-1.5 grid grid-cols-3 text-sm font-bold text-gray-600 dark:text-gray-300 rounded-b-2xl">
        <LikeButton liked={hasLiked} onClick={handleLike} />

        {/* Comment Button opens Modal per user requirement */}
        <button
          type="button"
          onClick={() => onOpenComments && onOpenComments(post)}
          className="py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
        >
          <MessageCircle size={19} />
          <span>Comment</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenShare && onOpenShare(post)}
          disabled={!canSharePost(post)}
          title={
            canSharePost(post)
              ? "Share post"
              : "Sharing is unavailable for this audience"
          }
          className="py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Share2 size={19} />
          <span>Share</span>
        </button>
      </div>

      {/* Move to Trash Confirmation Dialog */}
      <Modal
        isOpen={showTrashConfirm}
        onClose={() => setShowTrashConfirm(false)}
        title="Delete this post?"
        maxWidth="max-w-sm"
      >
        <div className="p-5 space-y-5">
          <p className="text-sm text-gray-500">
            This removes the post and its conversation. This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowTrashConfirm(false)}
              className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmTrash}
              className="px-4 py-2.5 rounded-xl bg-[#e02f21] text-white text-sm font-bold disabled:opacity-50"
            >
              {isDeleting ? "Deleting…" : "Delete post"}
            </button>
          </div>
        </div>
      </Modal>
    </article>
  );
};

export default PostCard;
