import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { originalPost } from "../../community/model/community-domain";
import PostIdentity from "./PostIdentity";

export default function SharedPostPreview({ post }: { post: any }) {
  const original = originalPost(post.originalPost);
  const id = original?.id || post.originalPostId;
  if (!id || !original)
    return (
      <div className="rounded-xl bg-gray-50 dark:bg-[#18191a] p-4 text-sm text-gray-500 dark:text-gray-400">
        The original post is no longer available.
      </div>
    );
  return (
    <article
      aria-label="Shared original post"
      className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242526]"
    >
      {original?.author && (
        <div className="p-3 sm:p-4">
          <PostIdentity post={original} />
        </div>
      )}
      <Link
        to={`/post/${id}`}
        aria-label={`Open original post${original?.title ? ": " + original.title : ""}`}
        className="block hover:bg-gray-50 dark:hover:bg-[#18191a]/40 transition"
      >
        <div className="px-3 sm:px-4 pb-3 space-y-2">
          {original?.caption && (
            <p className="text-sm leading-relaxed break-words line-clamp-4">
              {original.caption}
            </p>
          )}
          {original?.title && (
            <h3 className="font-bold text-base text-[#e02f21]">
              {original.title}
            </h3>
          )}
          {original?.poll && (
            <p className="font-semibold text-sm">{original.poll.question}</p>
          )}
        </div>
        {original?.image && (
          <img
            src={original.image}
            alt={original.title || "Photo from the original post"}
            className="w-full max-h-80 object-cover"
            loading="lazy"
          />
        )}
        <span className="flex items-center justify-between px-3 sm:px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400">
          View original post
          <ArrowUpRight size={15} />
        </span>
      </Link>
    </article>
  );
}
