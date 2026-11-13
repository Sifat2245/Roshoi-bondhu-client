import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useSession } from "../../lib/auth-client";
import { FriendsLayout } from "../../app/layouts/FriendsLayout";
import FriendsSidebar from "../../features/friends/components/FriendsSidebar";
import FriendRequestsView from "../../features/friends/components/FriendRequestsView";
import FriendSuggestionsView from "../../features/friends/components/FriendSuggestionsView";
import AllFriendsSplitView from "../../features/friends/components/AllFriendsSplitView";
import { useToast } from "../../context/ToastContext";
import { friendsApi } from "../../features/friends/api/friends.api";
import {
  useFriendsQuery,
  useFriendRequestsQuery,
  useFriendSuggestionsQuery,
  useInvalidateFriendsQueries,
} from "../../features/friends/hooks/useFriendsQueries";

const FriendsPage: React.FC = () => {
  const { data: session } = useSession();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("tab") || "home";
  const [activeSection, setActiveSection] = useState(tabParam);
  const token = session?.session?.token;

  // TanStack Query caching for friends, requests, and suggestions (5-10 min freshness)
  const { data: cachedFriends = [], isLoading: isFriendsLoading } = useFriendsQuery(token);
  const { data: cachedRequests = [], isLoading: isRequestsLoading } = useFriendRequestsQuery(token);
  const { data: cachedSuggestions = [], isLoading: isSuggestionsLoading } = useFriendSuggestionsQuery(token, 30);
  const { invalidateAllFriendsData, invalidateRequests, invalidateSuggestions } = useInvalidateFriendsQueries();

  const [removedSuggestionIds, setRemovedSuggestionIds] = useState<Set<string>>(new Set());
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<"confirm" | "delete" | null>(null);

  const friends = cachedFriends;
  const requests = cachedRequests;
  const suggestions = cachedSuggestions.filter((s) => !removedSuggestionIds.has(s.id));
  const loading = (isFriendsLoading || isRequestsLoading || isSuggestionsLoading) && (!cachedFriends.length && !cachedRequests.length && !cachedSuggestions.length);

  const mobileNavTabs = [
    { id: "home", label: "Home", badge: 0 },
    { id: "requests", label: "Friend requests", badge: requests.length },
    { id: "suggestions", label: "Suggestions", badge: 0 },
    { id: "all", label: "All friends", badge: 0 },
  ];

  useEffect(() => {
    setActiveSection(tabParam);
  }, [tabParam]);

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setSearchParams({ tab: sectionId });
  };

  const handleConfirmRequest = async (requestId: string) => {
    setProcessingRequestId(requestId);
    setProcessingAction("confirm");
    try {
      await friendsApi.acceptFriendRequest(requestId, token);
      notify.success("Friend request confirmed");
      invalidateAllFriendsData();
    } catch (err: any) {
      notify.error(err.message || "Failed to accept request");
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    setProcessingRequestId(requestId);
    setProcessingAction("delete");
    try {
      await friendsApi.declineFriendRequest(requestId, token);
      notify.info("Friend request removed");
      invalidateRequests();
    } catch (err: any) {
      notify.error(err.message || "Failed to remove request");
    } finally {
      setProcessingRequestId(null);
      setProcessingAction(null);
    }
  };

  const handleAddFriend = async (userId: string) => {
    setAddingIds((prev) => new Set(prev).add(userId));
    try {
      await friendsApi.sendFriendRequest(userId, token);
      setRemovedSuggestionIds((prev) => new Set(prev).add(userId));
      notify.success("Friend request sent");
      invalidateSuggestions();
    } catch (err: any) {
      notify.error(err.message || "Error sending request");
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleRemoveSuggestion = (userId: string) => {
    setRemovedSuggestionIds((prev) => new Set(prev).add(userId));
  };

  return (
    <FriendsLayout
      sidebar={
        <FriendsSidebar
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          requestCount={requests.length}
        />
      }
    >
      <div className="max-w-[1280px] mx-auto pb-12">
        {/* Mobile Horizontal Navigation Tabs (< lg screens) */}
        <div className="lg:hidden mb-5 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1">
          {mobileNavTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "all") navigate("/friends/list");
                else handleSelectSection(item.id);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeSection === item.id
                  ? "bg-[#e02f21] text-white shadow-xs"
                  : "bg-white dark:bg-[#242526] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800"
              }`}
            >
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${
                    activeSection === item.id
                      ? "bg-white text-[#e02f21]"
                      : "bg-[#e02f21] text-white"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeSection === "home" && (
          <div className="space-y-8">
            {/* 1. Friend Requests Section (top) */}
            {requests.length > 0 ? (
              <FriendRequestsView
                requests={requests}
                onConfirm={handleConfirmRequest}
                onDelete={handleDeleteRequest}
                onSeeAll={() => handleSelectSection("requests")}
                loading={loading}
                processingId={processingRequestId}
                processingAction={processingAction}
              />
            ) : null}

            {requests.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800"></div>
            )}

            {/* 2. People You May Know Section (bottom) */}
            <FriendSuggestionsView
              suggestions={suggestions}
              onAddFriend={handleAddFriend}
              onRemoveSuggestion={handleRemoveSuggestion}
              loading={loading}
              addingIds={addingIds}
            />
          </div>
        )}

        {activeSection === "requests" && (
          <FriendRequestsView
            requests={requests}
            onConfirm={handleConfirmRequest}
            onDelete={handleDeleteRequest}
            loading={loading}
            processingId={processingRequestId}
            processingAction={processingAction}
          />
        )}

        {activeSection === "suggestions" && (
          <FriendSuggestionsView
            suggestions={suggestions}
            onAddFriend={handleAddFriend}
            onRemoveSuggestion={handleRemoveSuggestion}
            loading={loading}
            addingIds={addingIds}
          />
        )}

        {activeSection === "all" && (
          <AllFriendsSplitView
            friends={friends}
            token={token}
            loading={loading}
          />
        )}
      </div>
    </FriendsLayout>
  );
};

export default FriendsPage;
