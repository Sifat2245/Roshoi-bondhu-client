import React, { useState } from 'react';
import { Link } from 'react-router';
import { useSession } from '../../../lib/auth-client';
import Avatar from '../../../components/ui/Avatar';
import postsApi from '../api/posts.api';
import {
  Heart,
  MessageCircle,
  Share2,
  ChefHat,
  Clock,
  Users,
  Globe,
} from 'lucide-react';

const PostCard = ({ post, onOpenComments, onOpenShare, onRequireAuth }) => {
  const { data: session } = useSession();
  const user = session?.user;

  const [hasLiked, setHasLiked] = useState(post.hasLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  // Like toggle - instant toggle, NO spinner per user instructions ("not like button")
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

  const isRecipe = post.postType === 'RECIPE';
  const isRepost = post.postType === 'REPOST';

  return (
    <article className="bg-white dark:bg-[#242526] rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header: Author Info */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link to={`/profile/${post.author?.id}`}>
            <Avatar src={post.author?.image} alt={post.author?.name} size="md" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={`/profile/${post.author?.id}`}
                className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white hover:underline"
              >
                {post.author?.name}
              </Link>
              {post.author?.role && post.author.role !== 'USER' && (
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-black bg-red-100 dark:bg-red-950 text-[#e02f21]">
                  {post.author.role}
                </span>
              )}
              {post.group && (
                <span className="text-xs text-gray-400">
                  in{' '}
                  <Link to={`/group/${post.group.slug}`} className="font-bold text-gray-700 dark:text-gray-300 hover:underline">
                    {post.group.name}
                  </Link>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span>
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span>•</span>
              <Globe size={11} />
            </div>
          </div>
        </div>
      </div>

      {/* Caption Text */}
      {post.caption && (
        <div className="px-4 pb-2.5">
          <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
            {post.caption}
          </p>
        </div>
      )}

      {/* Recipe Header (if RECIPE) */}
      {isRecipe && (
        <div className="mx-4 mb-3 p-3.5 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
          <h3 className="font-black text-sm sm:text-base text-[#e02f21] mb-2">{post.title}</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {post.cuisine && (
              <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-gray-800 font-bold text-gray-800 dark:text-gray-200 shadow-xs flex items-center gap-1">
                <ChefHat size={12} className="text-[#e02f21]" /> {post.cuisine}
              </span>
            )}
            {post.preparationTime && (
              <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-xs flex items-center gap-1">
                <Clock size={12} /> {post.preparationTime} mins
              </span>
            )}
            {post.servings && (
              <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-xs flex items-center gap-1">
                <Users size={12} /> Serves {post.servings}
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
            <img src={post.originalPost.image} alt="" className="mt-2 rounded-xl h-44 w-full object-cover" />
          )}
        </div>
      )}

      {/* Media Photo */}
      {post.image && !isRepost && (
        <div
          onClick={() => onOpenComments && onOpenComments(post)}
          className="cursor-pointer max-h-[460px] overflow-hidden bg-black/5"
        >
          <img src={post.image} alt="" className="w-full h-full object-cover hover:opacity-95 transition" />
        </div>
      )}

      {/* Metrics Row */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100 dark:border-gray-800">
        <span className="flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white">
            <Heart size={10} fill="white" />
          </span>
          <span>{likeCount}</span>
        </span>
        <button
          type="button"
          onClick={() => onOpenComments && onOpenComments(post)}
          className="hover:underline"
        >
          {post.commentCount || 0} comments
        </button>
      </div>

      {/* Facebook Action Row */}
      <div className="px-2 py-1 grid grid-cols-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
        <button
          type="button"
          onClick={handleLike}
          className={`py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer ${
            hasLiked ? 'text-[#e02f21]' : ''
          }`}
        >
          <Heart size={18} fill={hasLiked ? '#e02f21' : 'none'} />
          <span>Like</span>
        </button>

        {/* Comment Button opens Modal per user requirement */}
        <button
          type="button"
          onClick={() => onOpenComments && onOpenComments(post)}
          className="py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
        >
          <MessageCircle size={18} />
          <span>Comment</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenShare && onOpenShare(post)}
          className="py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
};

export default PostCard;

