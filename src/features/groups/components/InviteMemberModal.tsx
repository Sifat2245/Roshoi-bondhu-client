import React, { useState, useEffect, useMemo } from "react";
import { Search, UserPlus, Check, Copy, Loader2, Users } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import { useSession } from "../../../lib/auth-client";
import { useToast } from "../../../context/ToastContext";
import { searchApi, type UserSearchResult } from "../../search/api/search.api";
import { useFriendsQuery } from "../../friends/hooks/useFriendsQueries";
import groupsApi from "../api/groups.api";
import { useInvalidateGroupQueries } from "../hooks/useGroupQueries";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
}

interface InviteCandidate {
  id: string;
  name: string;
  username?: string | null;
  image?: string | null;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  group,
}) => {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const token = session?.session?.token;

  const { notify } = useToast();
  const { addMemberToGroup, invalidateGroupDetail, invalidateAllGroups } =
    useInvalidateGroupQueries();
  const [query, setQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Load user's full friend list from GraphQL when modal opens
  const { data: friends = [], isLoading: loadingFriends } = useFriendsQuery(
    token,
    undefined,
    currentUser?.id,
    { enabled: isOpen && Boolean(currentUser?.id) }
  );

  // Existing member IDs
  const existingMemberUserIds = new Set(
    (group?.members || []).map((m: any) => m.userId || m.user?.id)
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSearchResults([]);
      setAddedIds(new Set());
      setCopied(false);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setLoadingSearch(false);
      return;
    }

    setLoadingSearch(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.getSearchSuggestions(q);
        setSearchResults(res.users || []);
      } catch (err) {
        console.warn("Failed to search users for invite:", err);
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Show all friends when query is empty; when searching, prioritize matching friends + global people search
  const displayedUsers: InviteCandidate[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return friends.map((f) => ({
        id: f.id,
        name: f.name,
        username: f.username,
        image: f.image,
      }));
    }

    const matchingFriends: InviteCandidate[] = friends
      .filter(
        (f) =>
          (f.name || "").toLowerCase().includes(q) ||
          (f.username || "").toLowerCase().includes(q)
      )
      .map((f) => ({
        id: f.id,
        name: f.name,
        username: f.username,
        image: f.image,
      }));

    const seen = new Set(matchingFriends.map((f) => f.id));
    const merged: InviteCandidate[] = [...matchingFriends];

    for (const u of searchResults) {
      if (!seen.has(u.id)) {
        seen.add(u.id);
        merged.push({
          id: u.id,
          name: u.name,
          username: u.username,
          image: u.image,
        });
      }
    }

    return merged;
  }, [friends, query, searchResults]);

  const handleAddMember = async (targetUser: InviteCandidate) => {
    if (!group?.id) return;
    setAddingIds((prev) => new Set(prev).add(targetUser.id));

    try {
      const addedMember = await groupsApi.addMember(
        group.id,
        targetUser.id,
        "MEMBER",
        token
      );
      setAddedIds((prev) => new Set(prev).add(targetUser.id));
      addMemberToGroup(group.id, addedMember || {
        id: `gm-${Date.now()}`,
        groupId: group.id,
        userId: targetUser.id,
        role: "MEMBER",
        isApproved: true,
        user: {
          id: targetUser.id,
          name: targetUser.name,
          image: targetUser.image,
        },
      });
      invalidateGroupDetail(group.slug || group.id);
      invalidateAllGroups();
      notify.success(`Added ${targetUser.name} to ${group.name}!`);
    } catch (err: any) {
      notify.error(err.message || "Failed to add member to group.");
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUser.id);
        return next;
      });
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      notify.error("Could not copy link automatically.");
    }
  };

  const isLoadingList = query.trim()
    ? loadingSearch && displayedUsers.length === 0
    : loadingFriends && friends.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite to group"
      maxWidth="max-w-md"
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends or people by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#3a3b3c] text-sm focus:outline-hidden focus:border-[#e02f21] transition"
          />
        </div>

        {/* Section Heading */}
        {!query.trim() && friends.length > 0 && (
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>All Friends ({friends.length})</span>
          </div>
        )}

        {/* Results Container */}
        <div className="min-h-[180px] max-h-[300px] overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100 dark:divide-gray-800">
          {isLoadingList ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
              <Loader2 size={24} className="animate-spin text-[#e02f21]" />
              <span>{query.trim() ? "Searching people..." : "Loading friends..."}</span>
            </div>
          ) : displayedUsers.length > 0 ? (
            displayedUsers.map((u) => {
              const isAlreadyMember = existingMemberUserIds.has(u.id) || addedIds.has(u.id);
              const isAdding = addingIds.has(u.id);

              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-3 pt-2.5 pb-2.5 first:pt-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={u.image} alt={u.name} size="md" />
                    <div className="min-w-0 truncate">
                      <p className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
                        {u.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        @{u.username || "cook"}
                      </p>
                    </div>
                  </div>

                  {isAlreadyMember ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
                      <Check size={14} className="text-green-500" />
                      Member
                    </span>
                  ) : (
                    <Button
                      size="xs"
                      onClick={() => handleAddMember(u)}
                      disabled={isAdding}
                      className="bg-[#e02f21] hover:bg-[#c92518] text-white font-semibold rounded-lg shadow-xs shrink-0 cursor-pointer"
                    >
                      {isAdding ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <UserPlus size={13} />
                      )}
                      <span>Add</span>
                    </Button>
                  )}
                </div>
              );
            })
          ) : query.trim() ? (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <Users size={28} className="mx-auto text-gray-300 dark:text-gray-600" />
              <p>No people found matching &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500 space-y-2">
              <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600 opacity-60" />
              <p>No friends found yet. Type a name above to search and invite people.</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#e02f21] dark:hover:text-[#e02f21] transition cursor-pointer"
          >
            {copied ? (
              <Check size={15} className="text-green-500" />
            ) : (
              <Copy size={15} />
            )}
            <span>{copied ? "Link copied!" : "Copy group link"}</span>
          </button>

          <Button size="xs" variant="secondary" onClick={onClose} className="px-4">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InviteMemberModal;

