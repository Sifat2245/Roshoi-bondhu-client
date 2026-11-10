import { Link } from "react-router";
import { Globe, Lock, Users } from "lucide-react";
import { postAudience, audienceLabels } from "../model/post-policy";
import Avatar from "../../../components/ui/Avatar";

export default function PostIdentity({ post }: { post: any }) {
  const group = post.group;
  const author = post.author;
  const created = new Date(post.createdAt);
  const date = Number.isNaN(created.getTime())
    ? "View post"
    : created.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const audience = postAudience(post);
  const privacyLabel = group
    ? group.privacy === "PRIVATE"
      ? "Private group post"
      : "Public group post"
    : audienceLabels[audience];
  const PrivacyIcon = group
    ? group.privacy === "PRIVATE"
      ? Lock
      : Globe
    : audience === "ONLY_ME"
      ? Lock
      : audience === "FRIENDS"
        ? Users
        : Globe;
  return (
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {group ? (
        <div className="relative h-11 w-11 shrink-0">
          <Link
            to={`/group/${group.slug || group.id}`}
            aria-label={`Open ${group.name}`}
            className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 text-gray-500"
          >
            {group.coverImage || group.avatar ? (
              <img
                src={group.avatar || group.coverImage}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Users size={23} />
            )}
          </Link>
          <Link
            to={`/profile/${author?.id}`}
            aria-label={`View ${author?.name}`}
            className="absolute -right-1 -bottom-1 rounded-full ring-2 ring-white dark:ring-[#242526]"
          >
            <Avatar src={author?.image} alt={author?.name} size="xs" />
          </Link>
        </div>
      ) : (
        <Link to={`/profile/${author?.id}`} className="shrink-0">
          <Avatar src={author?.image} alt={author?.name} size="md" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <Link
          to={
            group
              ? `/group/${group.slug || group.id}`
              : `/profile/${author?.id}`
          }
          className="block font-bold text-sm sm:text-base leading-snug break-words hover:underline"
        >
          {group?.name || author?.name || "Home cook"}
        </Link>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {group && (
            <>
              <Link
                to={`/profile/${author?.id}`}
                className="font-semibold hover:underline break-words"
              >
                {author?.name || "Home cook"}
              </Link>
              <span>·</span>
            </>
          )}
          <Link
            to={`/post/${post.id}`}
            className="hover:underline"
            aria-label="Open post"
          >
            {date}
          </Link>
          <span>·</span>
          <span
            title={privacyLabel}
            aria-label={privacyLabel}
            className="inline-flex items-center gap-1"
          >
            <PrivacyIcon size={12} />
            {!group && audience !== "PUBLIC" && (
              <span>{audienceLabels[audience]}</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
