import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useSession } from '../../../lib/auth-client';
import Avatar from '../../../components/ui/Avatar';
import postsApi from '../api/posts.api';
import { useToast } from '../../../context/ToastContext';
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
} from 'lucide-react';

interface PostCardProps {
  post: any;
  onOpenComments?: (post: any) => void;
  onOpenShare?: (post: any) => void;
  onRequireAuth?: () => void;
  onDeletePost?: (postId: string) => void;
  onUpdatePost?: (updatedPost: any) => void;
  onPinPost?: (postId: string, isPinned: boolean) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onOpenComments,
  onOpenShare,
  onRequireAuth,
  onDeletePost,
  onUpdatePost,
  onPinPost,
}) => {
  const { data: session } = useSession();
  const user = session?.user;
  const { notify } = useToast();

  const [hasLiked, setHasLiked] = useState(post.hasLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  // Post Actions Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(Boolean(post.isPinned));
  const [isDeleted, setIsDeleted] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption || '');
  const [title, setTitle] = useState(post.title || '');
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
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Like toggle - instant toggle, NO spinner per user instructions
  const handleLike = async () => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    const prevLiked = hasLiked;
    const prevCount = likeCount;

    setHasLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await postsApi.toggleLikePost(post.id, session?.session?.token);
      if (res?.data) {
        setHasLiked(res.data.liked);
        setLikeCount(res.data.likeCount);
      }
    } catch {
      setHasLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  // Pin Toggle
  const handleTogglePin = () => {
    const nextState = !isPinned;
    setIsPinned(nextState);
    setIsMenuOpen(false);
    if (onPinPost) {
      onPinPost(post.id, nextState);
    }
    notify.success(nextState ? 'Post pinned to your profile' : 'Post unpinned from your profile');
  };

  // Copy Link
  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl).then(
      () => {
        notify.success('Link copied to clipboard');
        setIsMenuOpen(false);
      },
      () => {
        notify.error('Failed to copy link');
        setIsMenuOpen(false);
      }
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
        session?.session?.token
      );
      post.caption = caption.trim();
      if (title.trim()) post.title = title.trim();
      if (onUpdatePost) {
        onUpdatePost({ ...post, caption: caption.trim(), title: title.trim() });
      }
      notify.success('Post updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      notify.error(err.message || 'Failed to update post');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Move to Trash (Delete)
  const handleConfirmTrash = async () => {
    setIsDeleting(true);
    try {
      await postsApi.deletePost(post.id, session?.session?.token);
      setIsDeleted(true);
      setShowTrashConfirm(false);
      setIsMenuOpen(false);
      if (onDeletePost) {
        onDeletePost(post.id);
      }
      notify.success('Post moved to trash');
    } catch (err: any) {
      notify.error(err.message || 'Failed to move post to trash');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return null;
  }

  const isRecipe = post.postType === 'RECIPE';
  const isRepost = post.postType === 'REPOST';
  const isAuthor = user?.id === post.author?.id || user?.role === 'ADMIN';

  return (
    <article className="bg-white dark:bg-[#242526] rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden relative">
      {/* Pinned Badge if pinned */}
      {isPinned && (
        <div className="bg-red-50/60 dark:bg-red-950/20 px-4 py-1.5 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#e02f21]">
            <Pin size={13} className="fill-[#e02f21]" />
            <span>Pinned post</span>
          </div>
          <button
            type="button"
            onClick={handleTogglePin}
            className="text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium cursor-pointer"
          >
            Unpin
          </button>
        </div>
      )}

      {/* Header: Author Info + 3-dots Menu */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link to={`/profile/${post.author?.id}`}>
            <Avatar src={post.author?.image} alt={post.author?.name} size="md" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/profile/${post.author?.id}`}
                className="font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:underline"
              >
                {post.author?.name}
              </Link>
              {post.author?.role && post.author.role !== 'USER' && (
                <span className="text-[10px] uppercase px-1.5 py-0.2 rounded font-black bg-red-100 dark:bg-red-950 text-[#e02f21]">
                  {post.author.role}
                </span>
              )}
              {post.group && (
                <span className="text-xs sm:text-sm text-gray-500">
                  in{' '}
                  <Link
                    to={`/group/${post.group.slug}`}
                    className="font-bold text-gray-800 dark:text-gray-200 hover:underline"
                  >
                    {post.group.name}
                  </Link>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span>
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span>•</span>
              <Globe size={14} />
            </div>
          </div>
        </div>

        {/* 3-Dots Action Menu Container */}
        <div className="relative" ref={menuRef}>
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
            <div className="absolute right-0 top-10 w-64 bg-white dark:bg-[#242526] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
              {/* 1. Pin / Unpin Post */}
              <button
                type="button"
                onClick={handleTogglePin}
                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3 cursor-pointer"
              >
                <Pin size={18} className={isPinned ? 'text-[#e02f21]' : 'text-gray-500'} />
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{isPinned ? 'Unpin post' : 'Pin post'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    {isPinned ? 'Remove from top' : 'Keep at the top of your profile'}
                  </p>
                </div>
              </button>

              {/* 2. Edit Post (for author/admin) */}
              {isAuthor && (
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-3 cursor-pointer"
                >
                  <Edit3 size={18} className="text-gray-500" />
                  <div>
                    <p className="font-bold text-sm text-gray-900 dark:text-white">Edit post</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">Update title or description</p>
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
                  <p className="font-bold text-sm text-gray-900 dark:text-white">Copy link</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-normal">Copy post link to clipboard</p>
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
                      <p className="font-bold text-sm text-[#e02f21]">Move to trash</p>
                      <p className="text-xs text-red-500/80 dark:text-red-400 font-normal">Items in trash are removed</p>
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
              {isSavingEdit ? 'Saving...' : 'Save changes'}
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
          <h3 className="font-black text-base sm:text-lg text-[#e02f21] mb-2">{title || post.title}</h3>
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

      {/* Repost Embedded Card */}
      {isRepost && post.originalPost && (
        <div className="mx-4 mb-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1.5">
            <Avatar src={post.originalPost.author?.image} alt="" size="xs" />
            <span className="font-bold text-xs text-gray-800 dark:text-gray-200">
              {post.originalPost.author?.name}
            </span>
          </div>
          {post.originalPost.title && (
            <h4 className="font-bold text-xs text-[#e02f21]">{post.originalPost.title}</h4>
          )}
          {post.originalPost.caption && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
              {post.originalPost.caption}
            </p>
          )}
          {post.originalPost.image && (
            <img
              src={post.originalPost.image}
              alt=""
              className="mt-2 rounded-xl h-44 w-full object-cover"
            />
          )}
        </div>
      )}

      {/* Media Photo */}
      {post.image && !isRepost && (
        <div
          onClick={() => onOpenComments && onOpenComments(post)}
          className="cursor-pointer max-h-[460px] overflow-hidden bg-black/5"
        >
          <img
            src={post.image}
            alt=""
            className="w-full h-full object-cover hover:opacity-95 transition"
          />
        </div>
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
      <div className="px-2 py-1.5 grid grid-cols-3 text-sm font-bold text-gray-600 dark:text-gray-300">
        <button
          type="button"
          onClick={handleLike}
          className={`py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer ${
            hasLiked ? 'text-[#e02f21]' : ''
          }`}
        >
          <Heart size={19} fill={hasLiked ? '#e02f21' : 'none'} />
          <span>Like</span>
        </button>

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
          className="py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
        >
          <Share2 size={19} />
          <span>Share</span>
        </button>
      </div>

      {/* Move to Trash Confirmation Dialog */}
      {showTrashConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#242526] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center gap-3.5 text-[#e02f21]">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg text-gray-900 dark:text-white">Move to trash?</h3>
                <p className="text-sm text-gray-500">This post will be deleted from your feed.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Are you sure you want to move this post to trash? You can create a new post or recipe at any time.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTrashConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmTrash}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#e02f21] hover:bg-[#c92518] transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Moving to trash...' : 'Move to trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
