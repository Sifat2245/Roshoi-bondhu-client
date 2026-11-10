import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import SocialHeader from "../../widgets/navbar/SocialHeader";
import PostCard from "../../features/posts/components/PostCard";
import PostDetailsModal from "../../features/posts/components/PostDetailsModal";
import postsApi from "../../features/posts/api/posts.api";
import { useSession } from "../../lib/auth-client";
import { PostSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../context/ToastContext";
import { useSocial } from "../../features/community/model/useSocial";

export default function PostPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const { user } = useSocial();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(true);
  useEffect(() => {
    let active = true;
    setPost(null);
    setError("");
    setOpen(true);
    postsApi
      .getPostById(id, session?.session?.token, user?.id)
      .then((data) => {
        if (active) setPost(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [id, session?.session?.token, user?.id]);
  return (
    <div className="min-h-dvh bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100">
      <SocialHeader />
      <main className="pt-[116px] md:pt-20 px-3 pb-10 max-w-[720px] mx-auto">
        <Link
          to="/"
          className="inline-block mb-4 text-sm font-semibold text-[#e02f21]"
        >
          ← Back to feed
        </Link>
        {error ? (
          <div className="rounded-2xl bg-white dark:bg-[#242526] p-8 text-center">
            <h1 className="font-bold text-lg">This post isn’t available</h1>
            <p className="mt-2 text-sm text-gray-500">
              It may have been removed or shared with a different audience.
            </p>
          </div>
        ) : post ? (
          <>
            <PostCard
              post={post}
              onOpenComments={() => setOpen(true)}
              onOpenShare={async () => {
                try {
                  await postsApi.sharePost(
                    post.id,
                    "",
                    session?.session?.token,
                    user,
                  );
                  notify.success("Post shared to your feed");
                } catch (e: any) {
                  notify.error(e.message || "Could not share this post.");
                }
              }}
              onDeletePost={() => navigate("/")}
              onUpdatePost={setPost}
            />
            <PostDetailsModal
              isOpen={open}
              post={post}
              onClose={() => setOpen(false)}
              onPostUpdated={() =>
                postsApi
                  .getPostById(id, session?.session?.token, user?.id)
                  .then(setPost)
              }
              onRequireAuth={() => navigate("/login")}
            />
          </>
        ) : (
          <PostSkeleton />
        )}
      </main>
    </div>
  );
}
