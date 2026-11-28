import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import {
  Briefcase,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import { SkeletonLine } from "../../../components/ui/Skeleton";
import { useSession } from "../../../lib/auth-client";
import { useToast } from "../../../context/ToastContext";
import { useUserProfileQuery } from "../hooks/useProfileQueries";
import {
  useRelationshipStatusQuery,
  useInvalidateFriendsQueries,
} from "../../friends/hooks/useFriendsQueries";
import { friendsApi } from "../../friends/api/friends.api";
import { useChatDock } from "../../../context/ChatDockContext";

interface ProfileHoverUser {
  id: string;
  name?: string;
  image?: string | null;
  username?: string | null;
  bio?: string | null;
  city?: string | null;
  work?: string | null;
}

interface ProfileHoverCardProps {
  userId?: string | null;
  initialUser?: ProfileHoverUser | null;
  children: React.ReactNode;
  className?: string;
}

function isDesktopHoverSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.innerWidth >= 1024 &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

function formatMutualSummary(
  count?: number,
  sample?: { id: string; name: string }[]
): React.ReactNode {
  if (!count || count <= 0) return null;
  const names = (sample || []).map((s) => s.name).filter(Boolean);
  if (names.length >= 2) {
    return (
      <>
        {count} mutual friends including{" "}
        <strong className="font-semibold text-gray-900 dark:text-white">
          {names[0]}
        </strong>{" "}
        and{" "}
        <strong className="font-semibold text-gray-900 dark:text-white">
          {names[1]}
        </strong>
      </>
    );
  }
  if (names.length === 1) {
    return (
      <>
        {count} {count === 1 ? "mutual friend" : "mutual friends"}{" "}
        {count === 1 ? "" : "including "}
        <strong className="font-semibold text-gray-900 dark:text-white">
          {names[0]}
        </strong>
      </>
    );
  }
  return `${count} ${count === 1 ? "mutual friend" : "mutual friends"}`;
}

export const ProfileHoverCard: React.FC<ProfileHoverCardProps> = ({
  userId,
  initialUser,
  children,
  className = "inline-block",
}) => {
  const { data: session } = useSession();
  const token = session?.session?.token || null;
  const currentUserId = session?.user?.id;
  const navigate = useNavigate();
  const { notify } = useToast();
  const { startConversation } = useChatDock();
  const { invalidateAllFriendsData } = useInvalidateFriendsQueries();

  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const clearTimers = () => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => () => clearTimers(), []);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cardWidth = 340;
    const cardHeight = 205;
    const gap = 8;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < cardHeight + gap && rect.top > cardHeight + gap;

    const top = openAbove
      ? Math.max(12, rect.top - cardHeight - gap)
      : Math.min(window.innerHeight - cardHeight - 12, rect.bottom + gap);

    const left = Math.max(
      12,
      Math.min(window.innerWidth - cardWidth - 12, rect.left)
    );

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    if (!userId || !isDesktopHoverSupported()) return;
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (isOpen) return;
    openTimerRef.current = window.setTimeout(() => {
      updatePosition();
      setIsOpen(true);
    }, 260);
  };

  const handleMouseLeave = () => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const shouldFetch = isOpen && Boolean(userId);
  const { data: profile, isLoading: loadingProfile } = useUserProfileQuery(
    userId || "",
    token,
    { enabled: shouldFetch }
  );

  const isSelf = Boolean(currentUserId && userId === currentUserId);
  const { data: relationship } = useRelationshipStatusQuery(
    shouldFetch && !isSelf ? userId : null,
    token
  );

  if (!userId) {
    return <>{children}</>;
  }

  const displayName = profile?.name || initialUser?.name || "Home cook";
  const displayImage = profile?.image ?? initialUser?.image ?? null;
  const displayWork = profile?.work || initialUser?.work || null;
  const displayCity = profile?.city || initialUser?.city || null;
  const displayBio = profile?.bio || initialUser?.bio || null;

  const mutualSummary = formatMutualSummary(
    relationship?.mutualCount,
    relationship?.mutualSample
  );

  const handleFriendAction = async () => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }
    if (!userId || actionLoading) return;
    setActionLoading(true);
    try {
      const status = relationship?.status || "NONE";
      if (status === "NONE") {
        await friendsApi.sendFriendRequest(userId, token);
        notify.success(`Friend request sent to ${displayName}`);
      } else if (status === "REQUEST_SENT") {
        await friendsApi.cancelFriendRequest(userId, token);
        notify.info("Friend request cancelled");
      } else if (status === "REQUEST_RECEIVED" && relationship?.requestId) {
        await friendsApi.acceptFriendRequest(relationship.requestId, token);
        notify.success(`You are now friends with ${displayName}`);
      }
      invalidateAllFriendsData(userId);
    } catch (err: any) {
      notify.error(err?.message || "Could not update friend status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = () => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }
    startConversation({
      id: userId,
      name: displayName,
      image: displayImage || undefined,
    });
    setIsOpen(false);
  };

  const relStatus = relationship?.status || "NONE";

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className}
      >
        {children}
      </span>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onMouseEnter={() => {
              if (closeTimerRef.current) {
                window.clearTimeout(closeTimerRef.current);
                closeTimerRef.current = null;
              }
            }}
            onMouseLeave={handleMouseLeave}
            style={{ top: coords.top, left: coords.left }}
            role="dialog"
            aria-label={`Profile preview for ${displayName}`}
            className="hidden lg:block fixed z-[70] w-[340px] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200/90 dark:border-gray-700 p-4 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close profile preview"
              className="absolute top-2.5 right-2.5 p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Avatar + Identity + Info */}
            <div className="flex items-start gap-3.5 pr-5">
              <Link
                to={`/profile/${userId}`}
                onClick={() => setIsOpen(false)}
                className="shrink-0 rounded-full ring-2 ring-gray-100 dark:ring-gray-700 hover:opacity-95 transition"
              >
                <Avatar src={displayImage} alt={displayName} size="xl" />
              </Link>

              <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                <Link
                  to={`/profile/${userId}`}
                  onClick={() => setIsOpen(false)}
                  className="font-extrabold text-base text-gray-900 dark:text-white hover:underline block truncate"
                >
                  {displayName}
                </Link>

                {loadingProfile && !profile ? (
                  <div className="space-y-1.5 pt-1">
                    <SkeletonLine className="h-3 w-4/5" />
                    <SkeletonLine className="h-3 w-3/5" />
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 leading-snug">
                    {!isSelf && mutualSummary && (
                      <div className="flex items-start gap-2">
                        <Users
                          size={14}
                          className="text-gray-400 mt-0.5 shrink-0"
                        />
                        <p>{mutualSummary}</p>
                      </div>
                    )}

                    {displayWork ? (
                      <div className="flex items-start gap-2">
                        <Briefcase
                          size={14}
                          className="text-gray-400 mt-0.5 shrink-0"
                        />
                        <p className="line-clamp-2">{displayWork}</p>
                      </div>
                    ) : displayCity ? (
                      <div className="flex items-start gap-2">
                        <MapPin
                          size={14}
                          className="text-gray-400 mt-0.5 shrink-0"
                        />
                        <p className="truncate">Lives in {displayCity}</p>
                      </div>
                    ) : displayBio ? (
                      <p className="text-gray-500 dark:text-gray-400 line-clamp-2">
                        {displayBio}
                      </p>
                    ) : (
                      profile?.username && (
                        <p className="text-gray-400">@{profile.username}</p>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex items-center gap-2">
              {isSelf ? (
                <Link
                  to={`/profile/${userId}`}
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-sm font-bold text-gray-900 dark:text-white text-center transition"
                >
                  View profile
                </Link>
              ) : (
                <>
                  {relStatus === "FRIENDS" ? (
                    <Link
                      to={`/profile/${userId}`}
                      onClick={() => setIsOpen(false)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-sm font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1.5 transition"
                    >
                      <UserCheck size={15} />
                      <span>Friends</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleFriendAction}
                      className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-sm font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                    >
                      {relStatus === "REQUEST_SENT" ? (
                        <>
                          <Clock size={15} />
                          <span>Requested</span>
                        </>
                      ) : relStatus === "REQUEST_RECEIVED" ? (
                        <>
                          <Check size={15} className="text-emerald-500" />
                          <span>Accept</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={15} />
                          <span>Add friend</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleMessage}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#e02f21] hover:bg-[#c92518] text-white text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <MessageCircle size={15} />
                    <span>Message</span>
                  </button>

                  <Link
                    to={`/profile/${userId}`}
                    onClick={() => setIsOpen(false)}
                    aria-label={`View ${displayName}'s profile`}
                    title="View profile"
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition shrink-0"
                  >
                    <MoreHorizontal size={16} />
                  </Link>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ProfileHoverCard;
