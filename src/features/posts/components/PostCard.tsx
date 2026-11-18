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
import { isStepGalleryFullscreen, isShowNutritionOverlay } from "../../../lib/media-preferences";
import SaveRecipeModal from "../../kitchen/components/SaveRecipeModal";
import { useKitchen } from "../../kitchen/model/kitchen-store";
import { useSocial } from "../../community/model/useSocial";
import CommentIcon from "../../../components/ui/icons/CommentIcon";
import ShareIcon from "../../../components/ui/icons/ShareIcon";
import SharePostModal from "./SharePostModal";
import EditPostModal from "./EditPostModal";
import SelectAudienceModal from "./SelectAudienceModal";
import type { PostAudience } from "../model/post-policy";
import {
  Heart,
  ChefHat,
  Clock,
  Users,
  Globe,
  Lock,
  MoreHorizontal,
  Pin,
  Edit3,
  Copy,
  Trash2,
  Check,
  X,
  Plus,
  AlertTriangle,
  Bookmark,
  MessageSquareOff,
  EyeOff,
} from "lucide-react";

interface PostCardProps {
  post: any;
  onOpenComments?: (post: any) => void;
  onOpenShare?: (post: any) => void;
  onRequireAuth?: () => void;
  onDeletePost?: (postId: string) => void;
  onUpdatePost?: (updatedPost: any) => void;
  onHidePost?: (postId: string) => void;
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
  onHidePost,
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
  const [isHidden, setIsHidden] = useState(false);

  // Edit & Audience Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAudienceModalOpen, setIsAudienceModalOpen] = useState(false);
  const [caption, setCaption] = useState(post.caption || "");
  const [title, setTitle] = useState(post.title || "");

  useEffect(() => {
    setCaption(post.caption || "");
    setTitle(post.title || "");
  }, [post.caption, post.title]);

  // Trash / Delete Modal
  const [showTrashConfirm, setShowTrashConfirm] = useState(false);

  // Comments Disabled State
  const [isCommentsDisabled, setIsCommentsDisabled] = useState(
    Boolean(post.isCommentDisabled),
  );

  useEffect(() => {
    setIsCommentsDisabled(Boolean(post.isCommentDisabled));
  }, [post.isCommentDisabled]);

  const handleToggleCommentsDisabled = async () => {
    try {
      setIsMenuOpen(false);
      const res = await postsApi.toggleCommentsDisabled(post.id);
      const nextStatus = res.data?.isCommentDisabled ?? !isCommentsDisabled;
      setIsCommentsDisabled(nextStatus);
      if (onUpdatePost) {
        onUpdatePost({ ...post, isCommentDisabled: nextStatus });
      }
    } catch (err: any) {
      notify.error(err.message || "Failed to change commenting settings");
    }
  };

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
    setIsEditModalOpen(true);
  };

  // Save Edit via EditPostModal (Optimistic update)
  const handleSaveEditModal = async (updates: {
    caption?: string;
    title?: string | null;
    audience?: PostAudience;
    images?: string[];
    image?: string | null;
    ingredients?: string[] | null;
    instructions?: any;
    preparationTime?: number | null;
    servings?: number | null;
    cuisine?: string | null;
    poll?: any;
  }) => {
    const prevPost = { ...post };
    const nextCaption = updates.caption !== undefined ? updates.caption : post.caption;
    const nextTitle = updates.title !== undefined ? (updates.title || null) : post.title;
    const nextAudience = updates.audience !== undefined ? updates.audience : post.audience;
    const nextImages = updates.images !== undefined ? updates.images : post.images;
    const nextImage = updates.image !== undefined ? updates.image : post.image;
    const nextIngredients = updates.ingredients !== undefined ? updates.ingredients : post.ingredients;
    const nextInstructions = updates.instructions !== undefined ? updates.instructions : post.instructions;
    const nextPrepTime = updates.preparationTime !== undefined ? updates.preparationTime : post.preparationTime;
    const nextServings = updates.servings !== undefined ? updates.servings : post.servings;
    const nextCuisine = updates.cuisine !== undefined ? updates.cuisine : post.cuisine;

    let nextPoll = post.poll;
    if (updates.poll && post.poll) {
      nextPoll = {
        ...post.poll,
        question: updates.poll.question || post.poll.question,
        options: updates.poll.options
          ? updates.poll.options.map((text: string, idx: number) => ({
              id: post.poll?.options?.[idx]?.id || `temp-opt-${idx}`,
              text,
              voterIds: post.poll?.options?.[idx]?.voterIds || [],
            }))
          : post.poll.options,
      };
    }

    const updatedPost = {
      ...post,
      caption: nextCaption,
      title: nextTitle,
      audience: nextAudience,
      images: nextImages,
      image: nextImage,
      ingredients: nextIngredients,
      instructions: nextInstructions,
      preparationTime: nextPrepTime,
      servings: nextServings,
      cuisine: nextCuisine,
      poll: nextPoll,
    };

    // 1. Optimistic UI update
    setCaption(nextCaption);
    setTitle(nextTitle || "");
    if (onUpdatePost) {
      onUpdatePost(updatedPost);
    }

    // 2. Persist to API
    try {
      await postsApi.updatePost(
        post.id,
        {
          caption: nextCaption,
          title: nextTitle || undefined,
          audience: nextAudience,
          images: nextImages,
          image: nextImage,
          ingredients: nextIngredients,
          instructions: nextInstructions,
          preparationTime: nextPrepTime,
          servings: nextServings,
          cuisine: nextCuisine,
          poll: updates.poll,
        },
        session?.session?.token,
        user?.id,
      );
    } catch (err: any) {
      // Rollback on failure
      setCaption(prevPost.caption || "");
      setTitle(prevPost.title || "");
      if (onUpdatePost) {
        onUpdatePost(prevPost);
      }
      notify.error(err.message || "Failed to update post");
      throw err;
    }
  };

  // Save Audience via SelectAudienceModal (Optimistic update)
  const handleSaveAudienceModal = async (newAudience: PostAudience) => {
    if (post.audience === newAudience) return;

    const prevAudience = post.audience;
    const updatedPost = {
      ...post,
      audience: newAudience,
    };

    // 1. Optimistic UI update
    if (onUpdatePost) {
      onUpdatePost(updatedPost);
    }

    // 2. Persist to API
    try {
      await postsApi.updatePost(
        post.id,
        { audience: newAudience },
        session?.session?.token,
        user?.id,
      );
    } catch (err: any) {
      // Rollback on failure
      if (onUpdatePost) {
        onUpdatePost({ ...post, audience: prevAudience });
      }
      notify.error(err.message || "Failed to update audience");
    }
  };

  // Move to Trash / Delete (Optimistic update: closes popup & removes post immediately)
  const handleConfirmTrash = async () => {
    // 1. Immediately close confirmation dialog & dropdown
    setShowTrashConfirm(false);
    setIsMenuOpen(false);

    // 2. Immediately remove post from UI
    setIsDeleted(true);
    if (onDeletePost) {
      onDeletePost(post.id);
    }

    // 3. Call API in background
    try {
      await postsApi.deletePost(post.id, session?.session?.token, user?.id);
    } catch (err: any) {
      // Rollback on failure
      setIsDeleted(false);
      notify.error(err.message || "Failed to move post to trash");
    }
  };

  const handleHidePost = async () => {
    setIsMenuOpen(false);
    setIsHidden(true);
    try {
      await postsApi.hidePost(post.id);
      onHidePost?.(post.id);
    } catch (err: any) {
      console.warn("Failed to hide post:", err);
    }
  };

  const handleUndoHidePost = async () => {
    setIsHidden(false);
    try {
      await postsApi.unhidePost(post.id);
    } catch (err: any) {
      console.warn("Failed to unhide post:", err);
    }
  };

  if (isDeleted) {
    return null;
  }

  if (isHidden) {
    return (
      <div className="bg-white dark:bg-[#242526] rounded-none sm:rounded-2xl border-x-0 sm:border-x border-y border-gray-100 dark:border-gray-800 p-4 shadow-none sm:shadow-xs flex items-center justify-between gap-3 text-sm transition-all duration-300">
        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300 min-w-0">
          <EyeOff size={18} className="text-gray-400 shrink-0" />
          <span className="truncate">Post hidden. You’ll see fewer posts like this.</span>
        </div>
        <button
          type="button"
          onClick={handleUndoHidePost}
          className="text-[#e02f21] font-bold hover:underline cursor-pointer text-xs sm:text-sm shrink-0 px-2.5 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
        >
          Undo
        </button>
      </div>
    );
  }

  const isRecipe = post.postType === "RECIPE";
  const isRepost = post.postType === "REPOST";
  const isAuthor = Boolean(user?.id && (user.id === post.author?.id || user.id === post.authorId));

  return (
    <article
      data-post-id={post.id}
      className={`bg-white dark:bg-[#242526] text-gray-900 dark:text-gray-100 rounded-none sm:rounded-2xl shadow-none sm:shadow-xs border-x-0 sm:border-x border-y border-gray-100 dark:border-gray-800 relative transition-shadow ${
        isMenuOpen ? "z-30" : "z-10"
      }`}
    >
      {/* Pinned Badge if pinned */}
      {showPinBadge && isPinned && (
        <div className="bg-red-50/60 dark:bg-red-950/20 px-4 py-1.5 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between rounded-t-none sm:rounded-t-2xl">
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
                        : "Update title, caption, or photos"}
                    </p>
                  </div>
                </button>
              )}

              {/* 2b. Edit Audience (for author, when not in a group) */}
              {isAuthor && !post.groupId && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAudienceModalOpen(true);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3 cursor-pointer"
                >
                  {post.audience === "ONLY_ME" ? (
                    <Lock size={18} className="text-gray-500" />
                  ) : post.audience === "FRIENDS" ? (
                    <Users size={18} className="text-gray-500" />
                  ) : (
                    <Globe size={18} className="text-gray-500" />
                  )}
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      Edit audience
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                      {post.audience === "ONLY_ME"
                        ? "Only you can see this post"
                        : post.audience === "FRIENDS"
                        ? "Your friends on Hesheli"
                        : "Anyone on or off Hesheli"}
                    </p>
                  </div>
                </button>
              )}

              {/* 3. Turn off / Turn on commenting (for author) */}
              {isAuthor && (
                <button
                  type="button"
                  onClick={handleToggleCommentsDisabled}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3 cursor-pointer"
                >
                  <MessageSquareOff size={18} className="text-gray-500" />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      {isCommentsDisabled
                        ? "Turn on commenting"
                        : "Turn off commenting"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                      {isCommentsDisabled
                        ? "Allow people to comment on this post"
                        : "Prevent people from commenting on this post"}
                    </p>
                  </div>
                </button>
              )}

              {/* 4. Copy Link */}
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

              {/* 4b. Hide Post (for non-author posts on feed) */}
              {!isAuthor && (
                <button
                  type="button"
                  onClick={handleHidePost}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3 cursor-pointer"
                >
                  <EyeOff size={18} className="text-gray-500" />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      Hide post
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                      See fewer posts like this
                    </p>
                  </div>
                </button>
              )}

              {/* 5. Move to Trash (Delete) */}
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

      {/* Caption Text */}
      {caption && (
        <div className="px-4 pb-3">
          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
            {caption}
          </p>
        </div>
      )}

      {/* Recipe Header (if RECIPE) */}
      {isRecipe && (
        <div className="mx-4 mb-3.5 p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-black text-base sm:text-lg text-[#e02f21]">
              <button
                type="button"
                className="text-left hover:underline"
                onClick={() =>
                  onOpenComments?.({
                    ...post,
                    isCommentDisabled: isCommentsDisabled,
                  })
                }
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
          <PostPoll
            post={post}
            onRequireAuth={onRequireAuth}
            onUpdatePoll={(updatedPoll) =>
              onUpdatePost?.({ ...post, poll: updatedPoll })
            }
          />
        </div>
      )}
      {isRepost && (
        <div className="mx-4 mb-4">
          <SharedPostPreview post={post} />
        </div>
      )}

      {/* Media Photos (Single or Multi-Image Grid) */}
      {!isRepost && (() => {
        const postImages: string[] =
          Array.isArray(post.images) && post.images.length > 0
            ? post.images
            : post.image
            ? [post.image]
            : [];

        if (postImages.length === 0) return null;

        const handleImageClick = () => {
          if (isStepGalleryFullscreen() && onOpenComments) {
            onOpenComments({
              ...post,
              isCommentDisabled: isCommentsDisabled,
            });
          }
        };

        const showNutrition = isShowNutritionOverlay() && (post.preparationTime || post.servings);

        if (postImages.length === 1) {
          return (
            <div className="relative block w-full overflow-hidden max-h-[560px] bg-black/5 dark:bg-black/20">
              <button
                type="button"
                aria-label={`View ${post.title || "post from " + post.author?.name}`}
                onClick={handleImageClick}
                className="block w-full cursor-pointer overflow-hidden max-h-[560px]"
              >
                <img
                  src={postImages[0]}
                  alt={
                    post.title || "A kitchen moment shared by " + post.author?.name
                  }
                  loading="lazy"
                  className="w-full max-h-[560px] object-cover hover:opacity-95 transition"
                />
              </button>
              {showNutrition && (
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-2 shadow-md pointer-events-none">
                  {post.preparationTime && <span>⏱️ {post.preparationTime}m</span>}
                  {post.servings && <span>🍽️ Serves {post.servings}</span>}
                </div>
              )}
            </div>
          );
        }

        if (postImages.length === 2) {
          return (
            <div className="relative">
              <div
                onClick={handleImageClick}
                className="grid grid-cols-2 gap-1 w-full max-h-[460px] cursor-pointer overflow-hidden bg-black/5 dark:bg-black/20"
              >
                {postImages.map((img, idx) => (
                  <div key={idx} className="h-64 sm:h-80 w-full overflow-hidden">
                    <img
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-[1.02] transition duration-200"
                    />
                  </div>
                ))}
              </div>
              {showNutrition && (
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-2 shadow-md pointer-events-none">
                  {post.preparationTime && <span>⏱️ {post.preparationTime}m</span>}
                  {post.servings && <span>🍽️ Serves {post.servings}</span>}
                </div>
              )}
            </div>
          );
        }

        if (postImages.length === 3) {
          return (
            <div className="relative">
              <div
                onClick={handleImageClick}
                className="grid grid-cols-2 gap-1 w-full max-h-[500px] cursor-pointer overflow-hidden bg-black/5 dark:bg-black/20"
              >
                <div className="row-span-2 h-full min-h-[260px] overflow-hidden">
                  <img
                    src={postImages[0]}
                    alt="Photo 1"
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-[1.02] transition duration-200"
                  />
                </div>
                <div className="h-36 sm:h-48 overflow-hidden">
                  <img
                    src={postImages[1]}
                    alt="Photo 2"
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-[1.02] transition duration-200"
                  />
                </div>
                <div className="h-36 sm:h-48 overflow-hidden">
                  <img
                    src={postImages[2]}
                    alt="Photo 3"
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-[1.02] transition duration-200"
                  />
                </div>
              </div>
              {showNutrition && (
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-2 shadow-md pointer-events-none">
                  {post.preparationTime && <span>⏱️ {post.preparationTime}m</span>}
                  {post.servings && <span>🍽️ Serves {post.servings}</span>}
                </div>
              )}
            </div>
          );
        }

        // 4 or more photos: 2x2 grid with overlay on 4th photo
        const displayed = postImages.slice(0, 4);
        const remainingCount = postImages.length - 4;

        return (
          <div className="relative">
            <div
              onClick={handleImageClick}
              className="grid grid-cols-2 gap-1 w-full cursor-pointer overflow-hidden bg-black/5 dark:bg-black/20"
            >
              {displayed.map((img, idx) => {
                const isLast = idx === 3 && remainingCount > 0;
                return (
                  <div
                    key={idx}
                    className="relative h-40 sm:h-52 w-full overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-[1.02] transition duration-200"
                    />
                    {isLast && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-black">
                        +{remainingCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {showNutrition && (
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-2 shadow-md pointer-events-none">
                {post.preparationTime && <span>⏱️ {post.preparationTime}m</span>}
                {post.servings && <span>🍽️ Serves {post.servings}</span>}
              </div>
            )}
          </div>
        );
      })()}

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
        {post.commentCount > 0 ? (
          <button
            type="button"
            onClick={() =>
              onOpenComments &&
              onOpenComments({
                ...post,
                isCommentDisabled: isCommentsDisabled,
              })
            }
            className="hover:underline cursor-pointer font-medium"
          >
            {post.commentCount} comments
          </button>
        ) : isCommentsDisabled ? (
          <span className="font-medium text-xs text-gray-400">
            Commenting is off
          </span>
        ) : (
          <button
            type="button"
            onClick={() =>
              onOpenComments &&
              onOpenComments({
                ...post,
                isCommentDisabled: isCommentsDisabled,
              })
            }
            className="hover:underline cursor-pointer font-medium"
          >
            0 comments
          </button>
        )}
      </div>

      {/* Facebook Action Row */}
      <div
        className={`px-2 py-1.5 grid ${
          isCommentsDisabled ? "grid-cols-2" : "grid-cols-3"
        } text-sm font-bold text-gray-600 dark:text-gray-300 rounded-b-2xl`}
      >
        <LikeButton liked={hasLiked} onClick={handleLike} />

        {/* Comment Button opens Modal per user requirement (hidden when comments are disabled) */}
        {!isCommentsDisabled && (
          <button
            type="button"
            onClick={() =>
              onOpenComments &&
              onOpenComments({
                ...post,
                isCommentDisabled: isCommentsDisabled,
              })
            }
            className="py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <CommentIcon size={19} />
            <span>Comment</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (!session?.user) {
              onRequireAuth?.();
              return;
            }
            if (onOpenShare) {
              onOpenShare(post);
            } else {
              setIsShareModalOpen(true);
            }
          }}
          disabled={!canSharePost(post)}
          title={
            canSharePost(post)
              ? "Share post"
              : "Sharing is unavailable for this audience"
          }
          className="py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ShareIcon size={19} />
          <span>Share</span>
        </button>
      </div>

      {/* Share Post Modal Popup */}
      <SharePostModal
        post={post}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShared={() => {
          onUpdatePost?.(post);
        }}
      />

      {/* Edit Post Modal */}
      {isEditModalOpen && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={post}
          onSave={handleSaveEditModal}
        />
      )}

      {/* Select Audience Modal */}
      {isAudienceModalOpen && (
        <SelectAudienceModal
          isOpen={isAudienceModalOpen}
          onClose={() => setIsAudienceModalOpen(false)}
          currentAudience={post.audience || "PUBLIC"}
          onSave={handleSaveAudienceModal}
        />
      )}

      {/* Move to Trash Confirmation Dialog */}
      <Modal
        isOpen={showTrashConfirm}
        onClose={() => setShowTrashConfirm(false)}
        title="Move to trash?"
        maxWidth="max-w-sm"
      >
        <div className="p-5 space-y-5">
          <p className="text-sm text-gray-500">
            Items in your trash are permanently deleted after 30 days. You can restore this post anytime from Settings &gt; Trash.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowTrashConfirm(false)}
              className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmTrash}
              className="px-4 py-2.5 rounded-xl bg-[#e02f21] text-white text-sm font-bold cursor-pointer hover:bg-[#c92518] transition"
            >
              Move to trash
            </button>
          </div>
        </div>
      </Modal>
    </article>
  );
};

export default PostCard;
