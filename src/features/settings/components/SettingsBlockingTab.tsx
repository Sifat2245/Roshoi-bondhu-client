import React, { useState } from "react";
import { useSession } from "../../../lib/auth-client";
import { useToast } from "../../../context/ToastContext";
import Avatar from "../../../components/ui/Avatar";
import Button from "../../../components/ui/Button";
import {
  useBlockedUsersQuery,
  useInvalidateFriendsQueries,
} from "../../friends/hooks/useFriendsQueries";
import { friendsApi } from "../../friends/api/friends.api";
import { BlockedUser } from "../../friends/types/friends.types";
import {
  ShieldAlert,
  UserX,
  Search,
  UserCheck,
  Loader2,
  Calendar,
  X,
} from "lucide-react";

export const SettingsBlockingTab: React.FC = () => {
  const { data: session } = useSession();
  const token = session?.session?.token;
  const { notify } = useToast();

  const { data: blockedUsers = [], isLoading, error } = useBlockedUsersQuery(token);
  const { invalidateBlockedUsers, invalidateAllFriendsData } =
    useInvalidateFriendsQueries();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserToUnblock, setSelectedUserToUnblock] =
    useState<BlockedUser | null>(null);
  const [isUnblocking, setIsUnblocking] = useState(false);

  const filteredUsers = blockedUsers.filter((user) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      user.name.toLowerCase().includes(q) ||
      (user.username && user.username.toLowerCase().includes(q))
    );
  });

  const handleConfirmUnblock = async () => {
    if (!selectedUserToUnblock) return;
    setIsUnblocking(true);
    try {
      await friendsApi.unblockUser(selectedUserToUnblock.id, token);
      notify.success(`Unblocked ${selectedUserToUnblock.name}`);
      invalidateBlockedUsers();
      invalidateAllFriendsData(selectedUserToUnblock.id);
      setSelectedUserToUnblock(null);
    } catch (err: any) {
      notify.error(err.message || "Failed to unblock user");
    } finally {
      setIsUnblocking(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21]">
            <UserX size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
              Blocking
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Manage people you have blocked across your Heshel account.
            </p>
          </div>
        </div>

        {/* Informational Alert Box */}
        <div className="p-4 bg-gray-50 dark:bg-[#18191a] rounded-xl border border-gray-200/80 dark:border-gray-800 text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex items-start gap-3">
          <ShieldAlert size={18} className="text-[#e02f21] shrink-0 mt-0.5" />
          <p>
            Once you block someone, that person can no longer see things you
            post on your profile, view your recipes, or send you messages or
            friend requests. If you unblock someone, you will need to send a
            friend request if you want to become friends again.
          </p>
        </div>
      </div>

      {/* 2. Blocked People List Section */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span>Blocked Users</span>
            {!isLoading && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold">
                {blockedUsers.length}
              </span>
            )}
          </h3>

          {/* Search within blocked users */}
          {blockedUsers.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blocked users..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#18191a] border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
              />
            </div>
          )}
        </div>

        {/* Content State */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={32} className="animate-spin text-[#e02f21]" />
            <p className="text-xs text-gray-500 font-medium">
              Loading blocked users...
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-center text-sm text-red-600 font-semibold">
            Failed to load blocked users. Please refresh the page.
          </div>
        ) : blockedUsers.length === 0 ? (
          /* Empty State */
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <UserCheck size={28} />
            </div>
            <div>
              <h4 className="font-bold text-base text-gray-900 dark:text-white">
                You haven't blocked anyone
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1 leading-relaxed">
                When you block people, they will appear here. You can unblock
                them at any time to allow them to interact with you again.
              </p>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* No search results */
          <div className="py-8 text-center text-gray-500 text-sm font-medium">
            No blocked users matching "{searchQuery}"
          </div>
        ) : (
          /* List of Blocked Users */
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredUsers.map((user) => {
              const blockedDate = formatDate(user.blockedAt);
              return (
                <div
                  key={user.id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={user.image}
                      alt={user.name}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        {user.username && (
                          <span>@{user.username}</span>
                        )}
                        {blockedDate && (
                          <>
                            {user.username && <span>•</span>}
                            <span className="flex items-center gap-1 text-gray-400">
                              <Calendar size={12} />
                              <span>Blocked {blockedDate}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedUserToUnblock(user)}
                    className="shrink-0 rounded-xl px-4 py-2 font-bold text-xs sm:text-sm shadow-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Unblock
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Unblock Confirmation Modal */}
      {selectedUserToUnblock && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => {
            if (!isUnblocking) setSelectedUserToUnblock(null);
          }}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={selectedUserToUnblock.image}
                  alt={selectedUserToUnblock.name}
                  size="md"
                />
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                    Unblock {selectedUserToUnblock.name}?
                  </h3>
                  {selectedUserToUnblock.username && (
                    <p className="text-xs text-gray-500">
                      @{selectedUserToUnblock.username}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isUnblocking) setSelectedUserToUnblock(null);
                }}
                disabled={isUnblocking}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Description */}
            <div className="p-3.5 bg-gray-50 dark:bg-[#18191a] rounded-xl text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-2 leading-relaxed">
              <p>
                <strong>{selectedUserToUnblock.name}</strong> will be able to see
                your profile, your public posts, and recipes.
              </p>
              <p className="text-gray-500 text-xs">
                Heshel will not automatically add them back as a friend. If you
                want to be friends again, you will need to send a friend request.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="md"
                disabled={isUnblocking}
                onClick={() => setSelectedUserToUnblock(null)}
                className="rounded-xl px-4 py-2 font-bold text-sm cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={isUnblocking}
                loading={isUnblocking}
                onClick={handleConfirmUnblock}
                className="rounded-xl px-5 py-2 font-bold text-sm cursor-pointer shadow-xs"
              >
                Confirm Unblock
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsBlockingTab;

