import { useEffect, useRef, useState } from "react";
import { useSession } from "../../../lib/auth-client";
import { useToast } from "../../../context/ToastContext";
import postsApi from "../api/posts.api";
import { useAuth } from "../../../context/AuthContext";

const EVENT = "heshel:post-reaction";
const reactions = new Map<string, { liked: boolean; count: number }>();
const pendingPosts = new Set<string>();
export function usePostLike(post: any, onRequireAuth?: () => void) {
  const { data: session } = useSession();
  const { user: authUser } = useAuth();
  const user = session?.user || authUser;
  const { notify } = useToast();
  const initial = reactions.get(post?.id) || {
    liked: Boolean(post?.hasLiked),
    count: post?.likeCount || 0,
  };
  const [liked, setLiked] = useState(initial.liked);
  const [count, setCount] = useState(initial.count);
  const previousProps = useRef({
    id: post?.id,
    liked: Boolean(post?.hasLiked),
    count: post?.likeCount || 0,
  });

  useEffect(() => {
    const incoming = {
      id: post?.id,
      liked: Boolean(post?.hasLiked),
      count: post?.likeCount || 0,
    };
    const changed =
      previousProps.current.id === incoming.id &&
      (previousProps.current.liked !== incoming.liked ||
        previousProps.current.count !== incoming.count);
    previousProps.current = incoming;
    const next = changed ? incoming : reactions.get(incoming.id) || incoming;
    reactions.set(incoming.id, next);
    setLiked(next.liked);
    setCount(next.count);
  }, [post?.id, post?.hasLiked, post?.likeCount]);
  useEffect(() => {
    const sync = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail.id === post?.id) {
        setLiked(detail.liked);
        setCount(detail.count);
      }
    };
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [post?.id]);

  const toggle = async () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }
    if (pendingPosts.has(post.id)) return;
    pendingPosts.add(post.id);
    const previous = { liked, count };
    const sync = (nextLiked: boolean, nextCount: number) => {
      reactions.set(post.id, { liked: nextLiked, count: nextCount });
      window.dispatchEvent(
        new CustomEvent(EVENT, {
          detail: { id: post.id, liked: nextLiked, count: nextCount },
        }),
      );
    };
    sync(!liked, Math.max(0, count + (liked ? -1 : 1)));
    try {
      const response = await postsApi.toggleLikePost(
        post.id,
        session?.session?.token,
        user.id,
      );
      if (response?.data) sync(response.data.liked, response.data.likeCount);
    } catch (error: any) {
      sync(previous.liked, previous.count);
      notify.error(
        error.message || "Your reaction could not be saved. Please try again.",
      );
    } finally {
      pendingPosts.delete(post.id);
    }
  };
  return { hasLiked: liked, likeCount: count, handleLike: toggle };
}
