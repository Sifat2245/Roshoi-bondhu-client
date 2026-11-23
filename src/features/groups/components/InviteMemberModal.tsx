import React, { useState, useEffect } from "react";
import { Search, UserPlus, Check, Copy, Link as LinkIcon, Loader2, Users } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import { useToast } from "../../../context/ToastContext";
import { searchApi, type UserSearchResult } from "../../search/api/search.api";
import groupsApi from "../api/groups.api";
import { useInvalidateGroupQueries } from "../hooks/useGroupQueries";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  group,
}) => {
  const { notify } = useToast();
  const { addMemberToGroup, invalidateGroupDetail } = useInvalidateGroupQueries();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Existing member IDs
  const existingMemberUserIds = new Set(
    (group?.members || []).map((m: any) => m.userId || m.user?.id)
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setAddedIds(new Set());
      setCopied(false);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.getSearchSuggestions(q);
        setResults(res.users || []);
      } catch (err) {
        console.warn("Failed to search users for invite:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAddMember = async (targetUser: UserSearchResult) => {
    if (!group?.id) return;
    setAddingIds((prev) => new Set(prev).add(targetUser.id));

    try {
      const addedMember = await groupsApi.addMember(group.id, targetUser.id, "MEMBER");
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
            placeholder="Search people by name or username..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#3a3b3c] text-sm focus:outline-hidden focus:border-[#e02f21] transition"
          />
        </div>

        {/* Results Container */}
        <div className="min-h-[180px] max-h-[300px] overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100 dark:divide-gray-800">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
              <Loader2 size={24} className="animate-spin text-[#e02f21]" />
              <span>Searching users...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((u) => {
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
                      onClick={() => handleAddMember(u)}
                      disabled={isAdding}
                      className="bg-[#e02f21] hover:bg-[#c92518] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
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
              <p>Type a friend&apos;s name to search and invite them to this group.</p>
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

          <Button variant="secondary" onClick={onClose} className="text-xs px-4 py-2">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InviteMemberModal;

