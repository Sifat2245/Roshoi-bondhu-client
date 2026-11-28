import { Link } from "react-router";
import { Globe, Lock, Users, Shield } from "lucide-react";
import { postAudience, audienceLabels } from "../model/post-policy";
import Avatar from "../../../components/ui/Avatar";
import ProfileHoverCard from "../../profile/components/ProfileHoverCard";
import defaultGroupCover from "../../../assets/group/group-default.png";

function formatPostTime(dateString?: string | Date): string {
  if (!dateString) return "View post";
  const created = typeof dateString === "string" ? new Date(dateString) : dateString;
  const time = created.getTime();
  if (Number.isNaN(time)) return "View post";

  const diffSec = Math.floor((Date.now() - time) / 1000);
  if (diffSec < 0) return "Few seconds ago";

  if (diffSec < 60) {
    return "Few seconds ago";
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 3) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  }

  const currentYear = new Date().getFullYear();
  if (created.getFullYear() === currentYear) {
    return created.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return created.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function PrivateGroupPostIcon({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="8" cy="8" r="7.2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="6.2" r="1.4" fill="currentColor" />
      <path
        d="M5.4 11.2c0-1.35 1.15-2.3 2.6-2.3s2.6.95 2.6 2.3"
        fill="currentColor"
      />
      <circle cx="4.6" cy="7.1" r="1.05" fill="currentColor" />
      <path
        d="M2.9 11.1c0-.95.72-1.65 1.7-1.65.45 0 .85.14 1.15.38"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="11.4" cy="7.1" r="1.05" fill="currentColor" />
      <path
        d="M13.1 11.1c0-.95-.72-1.65-1.7-1.65-.45 0-.85.14-1.15.38"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PostIdentity({ post }: { post: any }) {
  const group = post.group;
  const author = post.author;
  const date = formatPostTime(post.createdAt);
  const audience = postAudience(post);
  const rawRole =
    group || post.groupId
      ? post.authorGroupRole
      : author?.role;
  const staffRole: "ADMIN" | "MODERATOR" | null =
    rawRole === "ADMIN" || rawRole === "MODERATOR" ? rawRole : null;
  const privacyLabel = group
    ? group.privacy === "PRIVATE"
      ? "Private group post"
      : "Public group post"
    : audienceLabels[audience];
  const PrivacyIcon = group
    ? group.privacy === "PRIVATE"
      ? PrivateGroupPostIcon
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
            <img
              src={group.avatar || group.coverImage || defaultGroupCover}
              alt=""
              className="h-full w-full object-cover"
            />
          </Link>
          <ProfileHoverCard
            userId={author?.id}
            initialUser={author}
            className="absolute -right-1 -bottom-1"
          >
            <Link
              to={`/profile/${author?.id}`}
              aria-label={`View ${author?.name}`}
              className="block rounded-full ring-2 ring-white dark:ring-[#242526]"
            >
              <Avatar src={author?.image} alt={author?.name} size="xs" />
            </Link>
          </ProfileHoverCard>
        </div>
      ) : (
        <ProfileHoverCard userId={author?.id} initialUser={author} className="shrink-0">
          <Link to={`/profile/${author?.id}`} className="block shrink-0">
            <Avatar src={author?.image} alt={author?.name} size="md" />
          </Link>
        </ProfileHoverCard>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {group ? (
            <Link
              to={`/group/${group.slug || group.id}`}
              className="font-bold text-sm sm:text-base leading-snug break-words hover:underline text-gray-900 dark:text-white"
            >
              {group.name}
            </Link>
          ) : (
            <ProfileHoverCard userId={author?.id} initialUser={author}>
              <Link
                to={`/profile/${author?.id}`}
                className="font-bold text-sm sm:text-base leading-snug break-words hover:underline text-gray-900 dark:text-white"
              >
                {author?.name || "Home cook"}
              </Link>
            </ProfileHoverCard>
          )}
          {post.title && !group && (
            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-normal">
              {post.title}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {group && (
            <>
              <ProfileHoverCard userId={author?.id} initialUser={author}>
                <Link
                  to={`/profile/${author?.id}`}
                  className="font-semibold hover:underline break-words"
                >
                  {author?.name || "Home cook"}
                </Link>
              </ProfileHoverCard>
              {!staffRole && <span>·</span>}
            </>
          )}
          {!staffRole && (
            <>
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
            </>
          )}
        </div>
        {staffRole && (
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold leading-tight ${
                staffRole === "ADMIN"
                  ? "bg-red-50 dark:bg-red-950/40 text-[#e02f21]"
                  : "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
              }`}
            >
              <Shield size={11} />
              <span>{staffRole === "ADMIN" ? "Admin" : "Moderator"}</span>
            </span>
            <span>·</span>
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
        )}
      </div>
    </div>
  );
}
