import React, { useState, useRef } from "react";
import { Link } from "react-router";
import { Users, UserPlus, X, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { useSession } from "../../../lib/auth-client";
import { friendsApi } from "../api/friends.api";
import {
  useFriendSuggestionsQuery,
  useInvalidateFriendsQueries,
} from "../hooks/useFriendsQueries";
import { useToast } from "../../../context/ToastContext";
import defaultAvatar from "../../../assets/user-image.png";

export const FeedPeopleYouMayKnow: React.FC = () => {
  const { data: session } = useSession();
  const token = session?.session?.token;
  const { notify } = useToast();

  const { data: suggestionsData, isLoading: loading } = useFriendSuggestionsQuery(token, 15);
  const { invalidateSuggestions } = useInvalidateFriendsQueries();

  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const suggestions = suggestionsData || [];

  const handleAddFriend = async (personId: string, name: string) => {
    setPendingIds((prev) => new Set(prev).add(personId));
    try {
      await friendsApi.sendFriendRequest(personId, token);
      setSentRequests((prev) => new Set(prev).add(personId));
      invalidateSuggestions();
      notify.success(`Friend request sent to ${name}`);
    } catch (err: any) {
      notify.error(err.message || "Failed to send request");
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(personId);
        return next;
      });
    }
  };

  const handleDismiss = (personId: string) => {
    setDismissedIds((prev) => new Set(prev).add(personId));
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const amount = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const visibleSuggestions = suggestions.filter((s) => !dismissedIds.has(s.id));

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3 shadow-xs">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-44 animate-pulse"></div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[180px] shrink-0 h-[240px] bg-gray-100 dark:bg-gray-800/60 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (visibleSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 p-3.5 sm:p-4 space-y-3 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
              People you may know
            </h2>
            <p className="text-[11px] text-gray-500">
              Suggestions based on mutual foodie friends and location
            </p>
          </div>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
      >
        {visibleSuggestions.map((person) => {
          const isRequested = sentRequests.has(person.id);

          return (
            <div
              key={person.id}
              className="w-[175px] sm:w-[195px] shrink-0 bg-gray-50 dark:bg-[#1f2021] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col justify-between transition hover:shadow-xs group"
            >
              {/* Photo with Dismiss '✕' button */}
              <div className="relative aspect-square w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <Link to={`/profile/${person.id}`} className="block w-full h-full">
                  <img
                    src={person.image || defaultAvatar}
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </Link>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={() => handleDismiss(person.id)}
                  title="Remove suggestion"
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <Link
                    to={`/profile/${person.id}`}
                    className="font-bold text-sm text-gray-900 dark:text-white hover:underline truncate block"
                  >
                    {person.name}
                  </Link>

                  {/* Mutual friends or location */}
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate flex items-center gap-1">
                    {person.mutualFriends !== undefined && person.mutualFriends > 0 ? (
                      <>
                        <Users size={12} className="text-gray-400 shrink-0" />
                        <span className="truncate">
                          {person.mutualFriends} mutual{" "}
                          {person.mutualFriends === 1 ? "friend" : "friends"}
                        </span>
                      </>
                    ) : (
                      <span className="truncate">{person.city || "Food lover"}</span>
                    )}
                  </div>
                </div>

                {/* Add Friend Button with Spinner */}
                {(() => {
                  const isPending = pendingIds.has(person.id);
                  return (
                    <button
                      type="button"
                      disabled={isRequested || isPending}
                      onClick={() => handleAddFriend(person.id, person.name)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98] ${
                        isRequested
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default"
                          : isPending
                            ? "bg-red-400 text-white cursor-wait opacity-85"
                            : "bg-[#e02f21] hover:bg-[#c92518] text-white shadow-xs"
                      }`}
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={14} className="animate-spin flex-shrink-0" />
                          <span>Sending...</span>
                        </>
                      ) : isRequested ? (
                        <>
                          <Check size={14} />
                          <span>Requested</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} />
                          <span>Add friend</span>
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom See All Link */}
      <div className="pt-1 text-center border-t border-gray-100 dark:border-gray-800">
        <Link
          to="/friends?tab=suggestions"
          className="inline-flex items-center justify-center text-xs font-bold text-[#e02f21] hover:underline py-1"
        >
          See all suggestions
        </Link>
      </div>
    </div>
  );
};

export default FeedPeopleYouMayKnow;

