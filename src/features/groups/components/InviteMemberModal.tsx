import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  UserPlus,
  Check,
  Copy,
  Loader2,
  Users,
  Link2,
  RefreshCw,
  Ban,
  ShieldCheck,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import { useSession } from "../../../lib/auth-client";
import { useToast } from "../../../context/ToastContext";
import { searchApi, type UserSearchResult } from "../../search/api/search.api";
import { useFriendsQuery } from "../../friends/hooks/useFriendsQueries";
import groupsApi from "../api/groups.api";
import type { GroupInviteLink } from "../types/group.types";

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
  const [query, setQuery] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const [inviteLink, setInviteLink] = useState<GroupInviteLink | null>(null);
  const [loadingLink, setLoadingLink] = useState(false);
  const [linkBusy, setLinkBusy] = useState<"REGEN" | "REVOKE" | null>(null);

  const { data: friends = [], isLoading: loadingFriends } = useFriendsQuery(
    token,
    "",
    currentUser?.id,
    { enabled: isOpen && Boolean(currentUser?.id) }
  );

  const existingMemberUserIds = new Set(
    (group?.members || []).map((m: any) => m.userId || m.user?.id)
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSearchResults([]);
      setAddedIds(new Set());
      setCopied(false);
      setInviteLink(null);
      return;
    }

    if (group?.id && currentUser?.id) {
      setLoadingLink(true);
      groupsApi
        .getInviteLink(group.id, token)
        .then((link) => setInviteLink(link))
        .catch(() => setInviteLink(null))
        .finally(() => setLoadingLink(false));
    }
  }, [isOpen, group?.id, currentUser?.id, token]);

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
          f.name.toLowerCase().includes(q) ||
          (f.username && f.username.toLowerCase().includes(q))
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
      if (!seen.has(u.id) && u.id !== currentUser?.id) {
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
  }, [friends, query, searchResults, currentUser?.id]);

  const handleInviteMember = async (targetUser: InviteCandidate) => {
    if (!group?.id) return;
    setAddingIds((prev) => new Set(prev).add(targetUser.id));

    try {
      await groupsApi.inviteMember(
        group.id,
        targetUser.id,
        "MEMBER",
        token
      );
      setAddedIds((prev) => new Set(prev).add(targetUser.id));
      notify.success(`Sent group invitation to ${targetUser.name}!`, "Invited", true);
    } catch (err: any) {
      notify.error(err.message || "Failed to send group invitation.");
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUser.id);
        return next;
      });
    }
  };

  const fullInviteUrl = inviteLink?.token
    ? `${window.location.origin}/group/${group?.slug || group?.id}?invite=${inviteLink.token}`
    : `${window.location.origin}/group/${group?.slug || group?.id}`;

  const handleCopyLink = async () => {
    try {
      let urlToCopy = fullInviteUrl;
      if (!inviteLink?.token && group?.id) {
        const created = await groupsApi.getInviteLink(group.id, token);
        if (created?.token) {
          setInviteLink(created);
          urlToCopy = `${window.location.origin}/group/${group?.slug || group?.id}?invite=${created.token}`;
        }
      }
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      notify.success("Invitation link copied to clipboard!", "Copied", true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      notify.error("Could not copy link automatically.");
    }
  };

  const handleRegenerateLink = async () => {
    if (!group?.id) return;
    setLinkBusy("REGEN");
    try {
      const next = await groupsApi.regenerateInviteLink(group.id, token);
      setInviteLink(next);
      notify.success("Generated a fresh invite link!", "Updated", true);
    } catch (err: any) {
      notify.error(err?.message || "Failed to regenerate invite link.");
    } finally {
      setLinkBusy(null);
    }
  };

  const handleRevokeLink = async () => {
    if (!group?.id || !inviteLink?.id) return;
    setLinkBusy("REVOKE");
    try {
      await groupsApi.revokeInviteLink(group.id, inviteLink.id, token);
      setInviteLink(null);
      notify.info("Invite link revoked.");
    } catch (err: any) {
      notify.error(err?.message || "Failed to revoke invite link.");
    } finally {
      setLinkBusy(null);
    }
  };

  const isLoadingList = query.trim()
    ? loadingSearch && displayedUsers.length === 0
    : loadingFriends && friends.length === 0;

  const isAdminApproval = group?.joinMode === "ADMIN_APPROVAL";
  const isViewerStaff = Boolean(
    group?.canModerate ||
      ["ADMIN", "MODERATOR"].includes(group?.currentUserRole || "") ||
      group?.ownerId === currentUser?.id ||
      group?.createdById === currentUser?.id
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite to group"
      maxWidth="max-w-md"
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* Join policy hint */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#3a3b3c] text-xs text-gray-600 dark:text-gray-300">
          <ShieldCheck
            size={16}
            className={`shrink-0 mt-0.5 ${
              isAdminApproval ? "text-amber-500" : "text-emerald-500"
            }`}
          />
          <span>
            {isAdminApproval
              ? isViewerStaff
                ? "Admin approval is enabled, but invites from Admins & Moderators let invitees join directly."
                : "Admin approval is enabled — people you invite will wait for admin approval after accepting."
              : "Direct join is enabled — anyone who accepts your invite or link joins right away."}
          </span>
        </div>

        {/* Invitation Link Card */}
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242526] space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Link2 size={14} className="text-[#e02f21]" />
              Invitation link
            </span>
            {inviteLink && (
              <span className="text-[11px] font-semibold text-gray-400">
                {inviteLink.useCount} {inviteLink.useCount === 1 ? "use" : "uses"}
              </span>
            )}
          </div>

          {loadingLink ? (
            <div className="h-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ) : inviteLink ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullInviteUrl}
                  aria-label="Group invitation link"
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#18191a] border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 font-mono truncate focus:outline-hidden"
                />
                <Button
                  size="xs"
                  onClick={handleCopyLink}
                  className="bg-[#e02f21] hover:bg-[#c92518] text-white font-semibold rounded-lg shrink-0 cursor-pointer"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>

              <div className="flex items-center justify-end gap-3 text-xs">
                <button
                  type="button"
                  disabled={Boolean(linkBusy)}
                  onClick={handleRegenerateLink}
                  className="inline-flex items-center gap-1 font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    size={12}
                    className={linkBusy === "REGEN" ? "animate-spin" : ""}
                  />
                  <span>New link</span>
                </button>
                <button
                  type="button"
                  disabled={Boolean(linkBusy)}
                  onClick={handleRevokeLink}
                  className="inline-flex items-center gap-1 font-semibold text-rose-500 hover:text-rose-600 cursor-pointer disabled:opacity-50"
                >
                  <Ban size={12} />
                  <span>Revoke</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                No active invite link yet.
              </span>
              <Button
                size="xs"
                variant="secondary"
                onClick={handleRegenerateLink}
                disabled={Boolean(linkBusy)}
                className="cursor-pointer"
              >
                <Link2 size={13} />
                <span>Create link</span>
              </Button>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search friends or people to invite..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#3a3b3c] text-sm focus:outline-hidden focus:border-[#e02f21] transition"
          />
        </div>

        {!query.trim() && friends.length > 0 && (
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
            <span>All Friends ({friends.length})</span>
          </div>
        )}

        {/* Results Container */}
        <div className="min-h-[160px] max-h-[260px] overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100 dark:divide-gray-800">
          {isLoadingList ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
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
                      {existingMemberUserIds.has(u.id) ? "Member" : "Invited"}
                    </span>
                  ) : (
                    <Button
                      size="xs"
                      onClick={() => handleInviteMember(u)}
                      disabled={isAdding}
                      className="bg-[#e02f21] hover:bg-[#c92518] text-white font-semibold rounded-lg shadow-xs shrink-0 cursor-pointer"
                    >
                      {isAdding ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <UserPlus size={13} />
                      )}
                      <span>Invite</span>
                    </Button>
                  )}
                </div>
              );
            })
          ) : query.trim() ? (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
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

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
          <Button size="xs" variant="secondary" onClick={onClose} className="px-4 cursor-pointer">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InviteMemberModal;
