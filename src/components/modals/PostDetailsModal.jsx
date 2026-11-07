import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useSession } from '../../lib/auth-client';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Send,
  ChefHat,
  Clock,
  Users,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
          const res = await fetch(`${API_BASE}/api/post/${post.id}`, {
            credentials: 'include',
            headers: session?.session?.token
              ? { Authorization: `Bearer ${session.session.token}` }
              : {},
          });
          const data = await res.json();
          if (data.data?.comments) {
            setComments(data.data.comments);
          }
        } catch (err) {
          console.error(err);
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
      const res = await fetch(`${API_BASE}/api/post/${post.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.data) {
        setHasLiked(data.data.liked);
        setLikeCount(data.data.likeCount);
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
      const res = await fetch(`${API_BASE}/api/post/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({ content: commentInput.trim() }),
      });

      const data = await res.json();
      if (data.data) {
        setComments([...comments, data.data]);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-[620px] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="relative px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 text-center">
          <h3 className="font-bold text-base text-gray-900 dark:text-white">
            {post.author?.name ? `${post.author.name}'s Post` : 'Post Details'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 text-gray-500 dark:text-gray-300 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Post & Comments Area */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Author Header */}
          <div className="flex items-center gap-3">
            <Avatar src={post.author?.image} alt={post.author?.name} size="md" />
            <div>
              <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                {post.author?.name}
              </p>
              <p className="text-[11px] text-gray-400">
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
              {post.caption}
            </p>
          )}

          {/* Recipe Details if RECIPE */}
          {isRecipe && (
            <div className="p-3.5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 space-y-2">
              <h4 className="font-bold text-sm text-[#e02f21]">{post.title}</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {post.cuisine && (
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-200">
                    {post.cuisine}
                  </span>
                )}
                {post.preparationTime && (
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    ⏱ {post.preparationTime} mins
                  </span>
                )}
                {post.servings && (
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    👥 Serves {post.servings}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Photo */}
          {post.image && (
            <div className="rounded-2xl overflow-hidden max-h-[380px] bg-black/5">
              <img src={post.image} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Metrics bar */}
          <div className="flex items-center justify-between text-xs text-gray-400 py-1 border-b border-gray-100 dark:border-gray-800">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white">
                <Heart size={10} fill="white" />
              </span>
              <span>{likeCount}</span>
            </span>
            <span>{comments.length} comments</span>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 text-xs font-bold text-gray-600 dark:text-gray-300 py-1 border-b border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={handleLike}
              className={`py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                hasLiked ? 'text-[#e02f21]' : ''
              }`}
            >
              <Heart size={18} fill={hasLiked ? '#e02f21' : 'none'} />
              <span>Like</span>
            </button>

            <button
              type="button"
              className="py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-[#e02f21]"
            >
              <MessageCircle size={18} />
              <span>Comment</span>
            </button>
          </div>

          {/* Comments List (Gray Bubbles like Image 3) */}
          <div className="space-y-3 pt-2">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Comments</p>

            {loadingComments ? (
              <div className="py-6 text-center text-xs text-gray-400">Loading comments...</div>
            ) : comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <Avatar src={c.user?.image} alt={c.user?.name} size="sm" />
                  <div>
                    {/* Facebook Gray Comment Bubble */}
                    <div className="bg-[#f0f2f5] dark:bg-[#3a3b3c] px-3.5 py-2.5 rounded-2xl rounded-tl-xs max-w-[460px]">
                      <p className="font-bold text-xs text-gray-900 dark:text-white">{c.user?.name}</p>
                      <p className="text-xs text-gray-800 dark:text-gray-200 mt-0.5 leading-relaxed">
                        {c.content}
                      </p>
                    </div>

                    {/* Comment Sub Actions */}
                    <div className="flex items-center gap-3 px-2 pt-1 text-[11px] text-gray-400 font-semibold">
                      <button type="button" className="hover:underline">Like</button>
                      <button type="button" className="hover:underline">Reply</button>
                      <span>
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-xs text-gray-400">No comments yet. Write the first comment!</p>
            )}
          </div>
        </div>

        {/* Sticky Comment Input Bar (Matching Image 3) */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#242526]">
          {user ? (
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <Avatar src={user.image} alt={user.name} size="sm" />
              <div className="relative flex-1">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={`Comment as ${user.name}...`}
                  className="w-full pl-4 pr-12 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-full text-xs font-medium focus:bg-white dark:focus:bg-[#3a3b3c] focus:outline-none dark:text-white border border-transparent focus:border-red-300"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentInput.trim()}
                  className="absolute right-2.5 top-2 p-1 text-[#e02f21] hover:text-black disabled:opacity-30 cursor-pointer"
                >
                  {submittingComment ? (
                    <span className="w-4 h-4 border-2 border-[#e02f21] border-t-transparent rounded-full animate-spin inline-block" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-2 text-xs text-gray-500">
              <Link to="/login" className="font-bold text-[#e02f21] hover:underline">
                Sign In
              </Link>{' '}
              to leave a comment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailsModal;

