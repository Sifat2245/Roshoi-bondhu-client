import { canSharePost } from "../model/post-policy";
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { useSession } from "../../../lib/auth-client";
import Avatar from "../../../components/ui/Avatar";
import Modal from "../../../components/ui/Modal";
import postsApi from "../api/posts.api";
import LikeButton from "./LikeButton";
import { usePostLike } from "../model/usePostLike";
import { useToast } from "../../../context/ToastContext";
import PostIdentity from "./PostIdentity";
import SharedPostPreview from "./SharedPostPreview";
import PostPoll from "../../community/components/PostPoll";
import { useSocial } from "../../community/model/useSocial";
import RecipeExperience from "../../kitchen/components/RecipeExperience";
import CommentIcon from "../../../components/ui/icons/CommentIcon";
import ShareIcon from "../../../components/ui/icons/ShareIcon";
import SharePostModal from "./SharePostModal";
import {
  Heart,
  SendHorizontal,
  Loader2,
  ChefHat,
  Clock,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";

interface PostDetailsModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated?: (data?: any) => void;
  onRequireAuth?: () => void;
}

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 3) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 52) return `${diffWeeks}w`;
  return `${Math.floor(diffDays / 365)}y`;
};

const renderCommentContent = (content: string) => {
  if (!content) return null;
  const match = content.match(/^(@[^\s]+(?:\s+[^\s]+){0,2})\s*(.*)$/s);
  if (match) {
    const [, mention, rest] = match;
    return (
      <span className="leading-relaxed">
        <span className="font-bold text-gray-900 dark:text-white mr-1 hover:underline cursor-pointer">
          {mention}
        </span>
        <span>{rest}</span>
      </span>
    );
  }
  return <span className="leading-relaxed">{content}</span>;
};

const PostDetailsModal: React.FC<PostDetailsModalProps> = ({
  post,
  isOpen,
  onClose,
  onPostUpdated,
  onRequireAuth,
}) => {
  const { data: session } = useSession();
  const { user } = useSocial();
  const { notify } = useToast();
  const commentRef = useRef<HTMLInputElement>(null);

  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Threading and Replies State
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<{
    parentId: string;
    authorName: string;
  } | null>(null);

  // Inline Edit State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Delete Confirmation Popup State
  const [commentToDelete, setCommentToDelete] = useState<{
    id: string;
    parentId?: string;
  } | null>(null);

  const { hasLiked, likeCount, handleLike } = usePostLike(post, onRequireAuth);

  const isCommentsDisabled = Boolean(post?.isCommentDisabled);

  useEffect(() => {
    if (isOpen && post?.id) {
      setComments([]);
      setCommentInput("");
      setReplyingTo(null);
      setEditingCommentId(null);
      setEditingText("");
      setCommentToDelete(null);

      const fetchComments = async () => {
        setLoadingComments(true);
        try {
          const postData = await postsApi.getPostById(
            post.id,
            session?.session?.token,
            user?.id,
          );
          if (postData?.comments) {
            setComments(postData.comments);
          }
        } catch (err) {
          console.error("Failed to load comments:", err);
        } finally {
          setLoadingComments(false);
        }
      };

      fetchComments();
    }
  }, [isOpen, post?.id, session?.session?.token, user?.id]);

  if (!isOpen || !post) return null;

  // Toggle Like on comment / reply (real-time API + optimistic sync)
  const handleToggleLikeComment = async (commentId: string) => {
    if (!user) {
      onRequireAuth?.();
      return;
    }

    // Optimistically update
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const nextHasLiked = !c.hasLiked;
          const currentCount = c.likeCount || 0;
          return {
            ...c,
            hasLiked: nextHasLiked,
            likeCount: nextHasLiked ? currentCount + 1 : Math.max(0, currentCount - 1),
          };
        }
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: c.replies.map((r: any) => {
              if (r.id === commentId) {
                const nextHasLiked = !r.hasLiked;
                const currentCount = r.likeCount || 0;
                return {
                  ...r,
                  hasLiked: nextHasLiked,
                  likeCount: nextHasLiked ? currentCount + 1 : Math.max(0, currentCount - 1),
                };
              }
              return r;
            }),
          };
        }
        return c;
      }),
    );

    try {
      const res = await postsApi.toggleCommentLike(commentId);
      if (res?.data) {
        const { liked, likeCount: serverCount } = res.data;
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return { ...c, hasLiked: liked, likeCount: serverCount };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: c.replies.map((r: any) =>
                  r.id === commentId
                    ? { ...r, hasLiked: liked, likeCount: serverCount }
                    : r,
                ),
              };
            }
            return c;
          }),
        );
      }
    } catch (err: any) {
      console.error("Failed to toggle comment like:", err);
    }
  };

  // Start Reply
  const handleStartReply = (topLevelCommentId: string, authorName: string) => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    setReplyingTo({ parentId: topLevelCommentId, authorName });
    setExpandedReplies((prev) => ({ ...prev, [topLevelCommentId]: true }));
    setCommentInput(`@${authorName} `);
    setTimeout(() => {
      commentRef.current?.focus();
    }, 50);
  };

  // Submit Comment (Optimistic UI: shows comment instantly & clears input field)
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = commentInput.trim();
    if (!content) return;
    if (!user) {
      onRequireAuth?.();
      return;
    }

    const parentId = replyingTo?.parentId || null;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // Immediately clear input and reset reply state so field doesn't freeze or spin
    setCommentInput("");
    setReplyingTo(null);

    // Create optimistic comment
    const optimisticComment = {
      id: tempId,
      postId: post.id,
      userId: user.id,
      parentId,
      content,
      likeCount: 0,
      hasLiked: false,
      isPosting: true,
      createdAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name || "You",
        image: user.image,
      },
      replies: [],
    };

    if (parentId) {
      // Append optimistic reply
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: [...(c.replies || []), optimisticComment],
              }
            : c,
        ),
      );
      setExpandedReplies((prev) => ({ ...prev, [parentId]: true }));
    } else {
      // Append optimistic top-level comment
      setComments((prev) => [...prev, optimisticComment]);
    }

    try {
      const res = await postsApi.addComment(
        post.id,
        content,
        parentId,
        session?.session?.token,
        user,
      );

      if (res?.data) {
        const serverComment = res.data;
        if (parentId) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? {
                    ...c,
                    replies: (c.replies || []).map((r: any) =>
                      r.id === tempId ? { ...serverComment, replies: [] } : r,
                    ),
                  }
                : c,
            ),
          );
        } else {
          setComments((prev) =>
            prev.map((c) =>
              c.id === tempId
                ? { ...serverComment, replies: serverComment.replies || [] }
                : c,
            ),
          );
        }
        if (onPostUpdated) onPostUpdated({ comment: serverComment });
      }
    } catch (err: any) {
      // Revert optimistic comment if server rejects
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: (c.replies || []).filter((r: any) => r.id !== tempId),
                }
              : c,
          ),
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== tempId));
      }
      setCommentInput(content);
      if (parentId) {
        setReplyingTo({ parentId, authorName: user.name || "user" });
      }
      notify.error(
        err.message || "Could not send your comment. Your draft has been restored.",
      );
    }
  };

  // Start Inline Edit
  const handleStartEdit = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingText(currentText);
  };

  // Save Inline Edit (Optimistic update: closes editor & renders new text immediately)
  const handleSaveEdit = async (commentId: string) => {
    const nextText = editingText.trim();
    if (!nextText) return;

    // 1. Immediately exit edit mode & reset input
    setEditingCommentId(null);
    setEditingText("");

    // 2. Backup previous comments in case of error
    const prevComments = [...comments];

    // 3. Immediately update UI state
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            content: nextText,
            updatedAt: new Date().toISOString(),
          };
        }
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: c.replies.map((r: any) =>
              r.id === commentId
                ? {
                    ...r,
                    content: nextText,
                    updatedAt: new Date().toISOString(),
                  }
                : r,
            ),
          };
        }
        return c;
      }),
    );

    // 4. API runs in background
    try {
      const res = await postsApi.updateComment(commentId, nextText);
      const updated = res.data;
      if (updated?.content) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return { ...c, content: updated.content };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: c.replies.map((r: any) =>
                  r.id === commentId ? { ...r, content: updated.content } : r,
                ),
              };
            }
            return c;
          }),
        );
      }
    } catch (err: any) {
      // Rollback on failure
      setComments(prevComments);
      notify.error(err.message || "Failed to update comment");
    }
  };

  // Trigger Delete Confirmation Popup
  const handleRequestDelete = (commentId: string, parentId?: string) => {
    setCommentToDelete({ id: commentId, parentId });
  };

  // Confirm Delete (Optimistic update: closes popup & removes comment immediately)
  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    const toDelete = commentToDelete;

    // 1. Close popup dialog immediately
    setCommentToDelete(null);

    // 2. Backup comments in case of failure
    const prevComments = [...comments];

    // 3. Immediately remove comment or reply from UI state
    if (toDelete.parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === toDelete.parentId
            ? {
                ...c,
                replies: (c.replies || []).filter(
                  (r: any) => r.id !== toDelete.id,
                ),
              }
            : c,
        ),
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== toDelete.id));
    }
    if (onPostUpdated) onPostUpdated();

    // 4. API runs in background
    try {
      await postsApi.deleteComment(toDelete.id);
    } catch (err: any) {
      // Rollback on failure
      setComments(prevComments);
      notify.error(err.message || "Failed to delete comment");
    }
  };

  const isRecipe = post.postType === "RECIPE";
  const totalCommentsCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0,
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post.author?.name ? `${post.author.name}'s post` : "Post details"}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col">
        {/* Post Content */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 space-y-4">
          <PostIdentity post={post} />

          {/* Recipe Title & Badges */}
          {isRecipe && post.title && (
            <div className="space-y-2">
              <h4 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <ChefHat size={22} className="text-[#e02f21]" />
                <span>{post.title}</span>
              </h4>

              <div className="flex items-center gap-2 flex-wrap text-sm sm:text-base">
                {post.preparationTime && (
                  <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:orange-400 font-semibold flex items-center gap-1.5">
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

          {post.postType === "POLL" && (
            <PostPoll post={post} onRequireAuth={onRequireAuth} />
          )}
          {post.postType === "REPOST" && <SharedPostPreview post={post} />}

          {/* Media Images */}
          {(() => {
            const modalImages: string[] =
              Array.isArray(post.images) && post.images.length > 0
                ? post.images
                : post.image
                ? [post.image]
                : [];

            if (modalImages.length === 0) return null;

            if (modalImages.length === 1) {
              return (
                <div className="rounded-xl overflow-hidden bg-black/5 dark:bg-black/20 max-h-96">
                  <img
                    src={modalImages[0]}
                    alt={post.title || "Post image"}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            }

            return (
              <div
                className={`rounded-xl overflow-hidden bg-black/5 dark:bg-black/20 gap-1.5 p-1 ${
                  modalImages.length === 2
                    ? "grid grid-cols-2"
                    : "grid grid-cols-2 sm:grid-cols-3"
                }`}
              >
                {modalImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-lg overflow-hidden bg-black/10"
                  >
                    <img
                      src={img}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition duration-200"
                    />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Engagement Count line */}
          {isRecipe && <RecipeExperience key={post.id} recipe={post} />}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-1">
            <span className="flex items-center gap-1.5 font-semibold">
              <Heart size={15} className="text-rose-500 fill-rose-500" />
              <span>{likeCount}</span>
            </span>
            <span className="font-medium">
              {isCommentsDisabled && totalCommentsCount === 0
                ? "Commenting is off"
                : `${totalCommentsCount} comments`}
            </span>
          </div>

          {/* Action Buttons Row */}
          <div
            className={`grid ${
              isCommentsDisabled ? "grid-cols-2" : "grid-cols-3"
            } gap-1 pt-2 border-t border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-600 dark:text-gray-300`}
          >
            <LikeButton liked={hasLiked} onClick={handleLike} />

            {!isCommentsDisabled && (
              <button
                type="button"
                onClick={() => commentRef.current?.focus()}
                className="py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3a3b3c] flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <CommentIcon size={19} />
                <span>Comment</span>
              </button>
            )}

            <button
              type="button"
              disabled={!canSharePost(post)}
              title={
                canSharePost(post)
                  ? "Share post"
                  : "Sharing is unavailable for this audience"
              }
              onClick={() => setIsShareModalOpen(true)}
              className="py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3a3b3c] flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShareIcon size={19} />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-4 sm:p-5 space-y-4 bg-gray-50/50 dark:bg-[#1e1f20]/50 flex-1">
          <div className="flex items-center justify-between">
            <h5 className="font-black text-sm uppercase tracking-wider text-gray-500">
              Comments ({totalCommentsCount})
            </h5>
            {isCommentsDisabled && (
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-[#2a2b2c] px-2.5 py-1 rounded-full">
                Commenting is off
              </span>
            )}
          </div>

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
            <div className="space-y-4 max-h-80 overflow-y-auto no-scrollbar pr-1">
              {comments.map((comment) => {
                const commentAuthor = comment.user || comment.author;
                const authorName = commentAuthor?.name || "Home cook";
                const authorImage = commentAuthor?.image;
                const authorId = commentAuthor?.id || comment.userId;
                const canEdit = Boolean(user?.id && user.id === authorId && !comment.isPosting);
                const canDelete = Boolean(
                  user?.id &&
                    !comment.isPosting &&
                    (user.id === authorId ||
                      user.id === (post.authorId || post.author?.id) ||
                      ["ADMIN", "MODERATOR"].includes(user?.role)),
                );
                const replies = comment.replies || [];
                const repliesCount = replies.length;
                const isExpanded = Boolean(expandedReplies[comment.id]);
                const commentLikes = comment.likeCount || 0;

                return (
                  <div key={comment.id} className="relative group">
                    {/* Top Level Comment */}
                    <div className="flex gap-2.5 items-start">
                      <Link to={`/profile/${authorId}`} className="shrink-0">
                        <Avatar
                          src={authorImage}
                          alt={authorName}
                          size="sm"
                          className="w-8 h-8 rounded-full"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        {editingCommentId === comment.id ? (
                          <div className="w-full space-y-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full p-2.5 text-xs sm:text-sm bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#e02f21] text-gray-900 dark:text-white resize-none"
                              rows={2}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSaveEdit(comment.id);
                                } else if (e.key === "Escape") {
                                  setEditingCommentId(null);
                                }
                              }}
                            />
                            <div className="flex items-center justify-end gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => setEditingCommentId(null)}
                                className="px-2.5 py-1 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(comment.id)}
                                disabled={!editingText.trim()}
                                className="px-3 py-1 rounded-lg bg-[#e02f21] text-white hover:bg-[#c22417] font-semibold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="bg-gray-100 dark:bg-[#3a3b3c] px-3.5 py-2 rounded-2xl inline-block max-w-[92%] shadow-2xs">
                              <Link
                                to={`/profile/${authorId}`}
                                className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white hover:underline block"
                              >
                                {authorName}
                              </Link>
                              <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 mt-0.5 leading-relaxed break-words">
                                {renderCommentContent(comment.content)}
                              </div>
                            </div>

                            {/* Action Row & Like Count Badge */}
                            {comment.isPosting ? (
                              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-400 font-medium ml-3 mt-0.5 italic">
                                <Loader2 size={11} className="animate-spin text-gray-400" />
                                <span>Posting...</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 text-[11px] sm:text-xs text-gray-500 font-semibold ml-3 mt-0.5">
                                <span>{formatRelativeTime(comment.createdAt)}</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleLikeComment(comment.id)}
                                  className={`hover:underline cursor-pointer transition ${
                                    comment.hasLiked
                                      ? "text-rose-600 dark:text-rose-400 font-bold"
                                      : ""
                                  }`}
                                >
                                  Like
                                </button>
                                {!isCommentsDisabled && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStartReply(comment.id, authorName)
                                    }
                                    className="hover:underline cursor-pointer"
                                  >
                                    Reply
                                  </button>
                                )}
                                {canEdit && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStartEdit(comment.id, comment.content)
                                    }
                                    className="hover:underline cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                  >
                                    Edit
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    type="button"
                                    onClick={() => handleRequestDelete(comment.id)}
                                    className="hover:underline cursor-pointer text-red-500/80 hover:text-red-600"
                                  >
                                    Delete
                                  </button>
                                )}

                                {/* Comment Like Reaction Badge with Count */}
                                {commentLikes > 0 && (
                                  <span className="inline-flex items-center gap-1 bg-white dark:bg-[#242526] px-1.5 py-0.5 rounded-full shadow-2xs border border-gray-100 dark:border-gray-700/60 text-[11px] font-bold text-gray-600 dark:text-gray-300 ml-1">
                                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0">
                                      <Heart size={8} fill="white" className="text-white" />
                                    </span>
                                    <span>{commentLikes}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Replies Collapsed: "View X reply/replies" with Curved Connector Line */}
                    {repliesCount > 0 && !isExpanded && (
                      <div className="flex items-center ml-4 mt-1 pl-2">
                        <div className="w-6 h-4 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 rounded-bl-xl mr-2 -translate-y-2" />
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReplies((prev) => ({
                              ...prev,
                              [comment.id]: true,
                            }))
                          }
                          className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-[#e02f21] dark:hover:text-[#e02f21] hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>
                            View {repliesCount}{" "}
                            {repliesCount === 1 ? "reply" : "replies"}
                          </span>
                        </button>
                      </div>
                    )}

                    {/* Replies Expanded: Vertical Line Tree */}
                    {repliesCount > 0 && isExpanded && (
                      <div className="relative ml-4 pl-6 sm:pl-8 border-l-2 border-gray-200 dark:border-gray-700 space-y-3 mt-2.5">
                        {replies.map((reply: any) => {
                          const replyAuthor = reply.user || reply.author;
                          const replyAuthorName = replyAuthor?.name || "Home cook";
                          const replyAuthorImage = replyAuthor?.image;
                          const replyAuthorId = replyAuthor?.id || reply.userId;
                          const replyCanEdit = Boolean(
                            user?.id && user.id === replyAuthorId && !reply.isPosting,
                          );
                          const replyCanDelete = Boolean(
                            user?.id &&
                              !reply.isPosting &&
                              (user.id === replyAuthorId ||
                                user.id === (post.authorId || post.author?.id) ||
                                ["ADMIN", "MODERATOR"].includes(user?.role)),
                          );
                          const replyLikes = reply.likeCount || 0;

                          return (
                            <div
                              key={reply.id}
                              className="relative flex gap-2.5 items-start"
                            >
                              {/* Curved branch to reply avatar */}
                              <div className="absolute -left-6 sm:-left-8 top-3.5 w-4 sm:w-6 h-3 border-b-2 border-gray-200 dark:border-gray-700" />
                              <Link
                                to={`/profile/${replyAuthorId}`}
                                className="shrink-0"
                              >
                                <Avatar
                                  src={replyAuthorImage}
                                  alt={replyAuthorName}
                                  size="xs"
                                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full"
                                />
                              </Link>
                              <div className="flex-1 min-w-0">
                                {editingCommentId === reply.id ? (
                                  <div className="w-full space-y-2">
                                    <textarea
                                      value={editingText}
                                      onChange={(e) =>
                                        setEditingText(e.target.value)
                                      }
                                      className="w-full p-2 text-xs sm:text-sm bg-white dark:bg-[#242526] border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-[#e02f21] text-gray-900 dark:text-white resize-none"
                                      rows={2}
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          handleSaveEdit(reply.id);
                                        } else if (e.key === "Escape") {
                                          setEditingCommentId(null);
                                        }
                                      }}
                                    />
                                    <div className="flex items-center justify-end gap-2 text-xs">
                                      <button
                                        type="button"
                                        onClick={() => setEditingCommentId(null)}
                                        className="px-2 py-0.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEdit(reply.id)}
                                        disabled={!editingText.trim()}
                                        className="px-3 py-0.5 rounded-lg bg-[#e02f21] text-white hover:bg-[#c22417] font-semibold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="bg-gray-100 dark:bg-[#3a3b3c] px-3 py-1.5 rounded-2xl inline-block max-w-[92%] shadow-2xs">
                                      <Link
                                        to={`/profile/${replyAuthorId}`}
                                        className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white hover:underline block"
                                      >
                                        {replyAuthorName}
                                      </Link>
                                      <div className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 mt-0.5 leading-relaxed break-words">
                                        {renderCommentContent(reply.content)}
                                      </div>
                                    </div>

                                    {reply.isPosting ? (
                                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-400 font-medium ml-3 mt-0.5 italic">
                                        <Loader2 size={11} className="animate-spin text-gray-400" />
                                        <span>Posting...</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-3 text-[11px] sm:text-xs text-gray-500 font-semibold ml-3 mt-0.5">
                                        <span>
                                          {formatRelativeTime(reply.createdAt)}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleToggleLikeComment(reply.id)
                                          }
                                          className={`hover:underline cursor-pointer transition ${
                                            reply.hasLiked
                                              ? "text-rose-600 dark:text-rose-400 font-bold"
                                              : ""
                                          }`}
                                        >
                                          Like
                                        </button>
                                        {!isCommentsDisabled && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleStartReply(
                                                comment.id,
                                                replyAuthorName,
                                              )
                                            }
                                            className="hover:underline cursor-pointer"
                                          >
                                            Reply
                                          </button>
                                        )}
                                        {replyCanEdit && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleStartEdit(
                                                reply.id,
                                                reply.content,
                                              )
                                            }
                                            className="hover:underline cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                          >
                                            Edit
                                          </button>
                                        )}
                                        {replyCanDelete && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRequestDelete(
                                                reply.id,
                                                comment.id,
                                              )
                                            }
                                            className="hover:underline cursor-pointer text-red-500/80 hover:text-red-600"
                                          >
                                            Delete
                                          </button>
                                        )}

                                        {/* Reply Like Reaction Badge with Count */}
                                        {replyLikes > 0 && (
                                          <span className="inline-flex items-center gap-1 bg-white dark:bg-[#242526] px-1.5 py-0.5 rounded-full shadow-2xs border border-gray-100 dark:border-gray-700/60 text-[11px] font-bold text-gray-600 dark:text-gray-300 ml-1">
                                            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0">
                                              <Heart size={8} fill="white" className="text-white" />
                                            </span>
                                            <span>{replyLikes}</span>
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReplies((prev) => ({
                              ...prev,
                              [comment.id]: false,
                            }))
                          }
                          className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:underline cursor-pointer block pt-1"
                        >
                          Hide replies
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-3 text-center">
              No comments yet. Start the conversation!
            </p>
          )}

          {/* Add Comment Input Form / Comments Disabled Message */}
          {isCommentsDisabled ? (
            <div className="p-3.5 rounded-xl bg-gray-100 dark:bg-[#242526] border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
              Commenting has been turned off for this post.
            </div>
          ) : (
            <div>
              {/* Replying banner */}
              {replyingTo && (
                <div className="flex items-center justify-between px-3 py-1.5 mb-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-300">
                  <span>
                    Replying to{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      @{replyingTo.authorName}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setCommentInput("");
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <form
                onSubmit={handleAddComment}
                className="flex items-center gap-3 pt-1"
              >
                <Avatar src={user?.image} alt={user?.name} size="sm" />
                <div className="flex-1 relative flex items-center">
                  <input
                    ref={commentRef}
                    aria-label="Write a comment"
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder={
                      replyingTo
                        ? `Reply to @${replyingTo.authorName}...`
                        : "Write a comment..."
                    }
                    className="w-full pl-4 pr-11 py-2.5 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-full text-sm dark:text-white focus:outline-none focus:border-[#e02f21]"
                  />
                  <button
                    type="submit"
                    disabled={!commentInput.trim()}
                    aria-label="Send comment"
                    className={`absolute right-1.5 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      commentInput.trim()
                        ? "bg-[#e02f21] text-white hover:bg-[#c22417] shadow-xs active:scale-95 opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <SendHorizontal size={15} className="translate-x-0.5" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Delete Comment Popup Modal */}
      <Modal
        isOpen={Boolean(commentToDelete)}
        onClose={() => setCommentToDelete(null)}
        title="Delete comment?"
        maxWidth="max-w-sm"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-[#e02f21] shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                Delete this comment?
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Are you sure you want to delete this comment? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setCommentToDelete(null)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#e02f21] hover:bg-[#c92518] transition cursor-pointer flex items-center gap-1.5"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Share Post Modal Popup */}
      <SharePostModal
        post={post}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShared={() => {
          onPostUpdated?.();
        }}
      />
    </Modal>
  );
};

export default PostDetailsModal;
