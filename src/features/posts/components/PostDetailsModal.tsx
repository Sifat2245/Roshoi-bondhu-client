import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useSession } from '../../../lib/auth-client';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import postsApi from '../api/posts.api';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  ChefHat,
  Clock,
  Users,
} from 'lucide-react';

const PostDetailsModal = ({ post, isOpen, onClose, onPostUpdated, onRequireAuth }) => {
  const { data: session } = useSession();
  const user = session?.user;

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [hasLiked, setHasLiked] = useState(post?.hasLiked || false);
  const [likeCount, setLikeCount] = useState(post?.likeCount || 0);

  useEffect(() => {
    if (isOpen && post?.id) {
      setHasLiked(post.hasLiked || false);
      setLikeCount(post.likeCount || 0);

      // Fetch fresh post details with comments
      const fetchComments = async () => {
        setLoadingComments(true);
        try {
          const postData = await postsApi.getPostById(post.id, session?.session?.token);
          if (postData?.comments) {
            setComments(postData.comments);
          }
        } catch (err) {
          console.error('Failed to load comments:', err);
        } finally {
          setLoadingComments(false);
        }
      };

      fetchComments();
    }
  }, [isOpen, post, session]);

  if (!isOpen || !post) return null;

  // Toggle Like (Instant toggle, no spinner per instructions)
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
      if (onPostUpdated) onPostUpdated();
    } catch {
      setHasLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  // Submit Comment with Spinner
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await postsApi.addComment(post.id, commentInput.trim(), session?.session?.token);
      if (res?.data) {
        setComments((prev) => [...prev, res.data]);
        setCommentInput('');
        if (onPostUpdated) onPostUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const isRecipe = post.postType === 'RECIPE';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post.author?.name ? `${post.author.name}'s post` : 'Post details'}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col">
        {/* Post Content */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 space-y-4">
          {/* Author Header */}
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.author?.id}`}>
              <Avatar src={post.author?.image} alt={post.author?.name} size="md" />
            </Link>
            <div>
              <Link
                to={`/profile/${post.author?.id}`}
                className="font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:underline"
              >
                {post.author?.name}
              </Link>
              <p className="text-xs sm:text-sm text-gray-400">
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Recipe Title & Badges */}
          {isRecipe && post.title && (
            <div className="space-y-2">
              <h4 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <ChefHat size={22} className="text-[#e02f21]" />
                <span>{post.title}</span>
              </h4>

              <div className="flex items-center gap-2 flex-wrap text-sm sm:text-base">
                {post.preparationTime && (
                  <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{post.preparationTime} mins</span>
                  </span>
                )}
                {post.servings && (
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                    <Users size={14} />
                    <span>{post.servings} servings</span>
                  </span>
                )}
                {post.cuisine && (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {post.cuisine}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Caption */}
          {post.caption && (
            <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {post.caption}
            </p>
          )}

          {/* Media Image */}
          {post.image && (
            <div className="rounded-xl overflow-hidden bg-black/5 max-h-96">
              <img src={post.image} alt={post.title || 'Post image'} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Engagement Count line */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-1">
            <span className="flex items-center gap-1.5 font-semibold">
              <Heart size={15} className="text-rose-500 fill-rose-500" />
              <span>{likeCount}</span>
            </span>
            <span className="font-medium">{comments.length} comments</span>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300">
            <button
              type="button"
              onClick={handleLike}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                hasLiked
                  ? 'text-rose-500 font-black'
                  : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
              }`}
            >
              <Heart size={18} fill={hasLiked ? 'currentColor' : 'none'} />
              <span>{hasLiked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              type="button"
              className="py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3a3b3c] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <MessageCircle size={18} />
              <span>Comment</span>
            </button>

            <button
              type="button"
              className="py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3a3b3c] flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-4 sm:p-5 space-y-4 bg-gray-50/50 dark:bg-[#1e1f20]/50 flex-1">
          <h5 className="font-black text-sm uppercase tracking-wider text-gray-500">
            Comments ({comments.length})
          </h5>

          {loadingComments ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-2.5 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3.5 max-h-60 overflow-y-auto no-scrollbar">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 items-start group">
                  <Link to={`/profile/${comment.author?.id}`}>
                    <Avatar src={comment.author?.image} alt={comment.author?.name} size="sm" />
                  </Link>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-[#242526] p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs inline-block max-w-full">
                      <Link
                        to={`/profile/${comment.author?.id}`}
                        className="font-bold text-sm text-gray-900 dark:text-white hover:underline block"
                      >
                        {comment.author?.name}
                      </Link>
                      <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5 leading-relaxed break-words">
                        {comment.content}
                      </p>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400 ml-2 mt-0.5 block">
                      {new Date(comment.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-3 text-center">
              No comments yet. Start the conversation!
            </p>
          )}

          {/* Add Comment Input Form */}
          <form onSubmit={handleAddComment} className="flex items-center gap-3 pt-2">
            <Avatar src={user?.image} alt={user?.name} size="sm" />
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a public comment..."
                className="w-full pl-4 pr-11 py-2.5 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-full text-sm dark:text-white focus:outline-none focus:border-[#e02f21]"
              />
              <Button
                type="submit"
                loading={submittingComment}
                disabled={!commentInput.trim()}
                variant="primary"
                size="sm"
                className="absolute right-1 w-8 h-8 p-0 rounded-full flex items-center justify-center shadow-none cursor-pointer"
              >
                {!submittingComment && <Send size={14} />}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default PostDetailsModal;

