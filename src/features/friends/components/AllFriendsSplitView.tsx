import React, { useState, useMemo } from "react";
import { Search, MoreHorizontal, Users, MessageSquare, UserX, ShieldAlert } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import FriendProfilePreview from "./FriendProfilePreview";
import { useChatDock } from "../../../context/ChatDockContext";
import { useToast } from "../../../context/ToastContext";
import { friendsApi } from "../api/friends.api";
import { useInvalidateFriendsQueries } from "../hooks/useFriendsQueries";
import { Friend } from "../types/friends.types";
import BlockUserModal from "./BlockUserModal";
import UnfriendUserModal from "./UnfriendUserModal";

interface AllFriendsSplitViewProps {
  friends?: Friend[];
  token?: string | null;
  loading?: boolean;
  onFriendRemoved?: (friendId: string) => void;
}

const AllFriendsSplitView: React.FC<AllFriendsSplitViewProps> = ({
  friends: initialFriends = [],
  token,
  loading = false,
  onFriendRemoved,
}) => {
  const { startConversation } = useChatDock();
  const { notify } = useToast();
  const { invalidateAllFriendsData } = useInvalidateFriendsQueries();

  const [friendsList, setFriendsList] = useState<Friend[]>(initialFriends);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [blockModalTarget, setBlockModalTarget] = useState<{ id: string; name: string } | null>(null);
  const [unfriendModalTarget, setUnfriendModalTarget] = useState<{ id: string; name: string } | null>(null);
  const [modalActionLoading, setModalActionLoading] = useState(false);

  React.useEffect(() => {
    setFriendsList(initialFriends);
  }, [initialFriends]);

  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return friendsList;
    const q = searchTerm.toLowerCase();
    return friendsList.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.username?.toLowerCase().includes(q) ||
        f.city?.toLowerCase().includes(q)
    );
  }, [friendsList, searchTerm]);

  const currentSelectedFriend = useMemo(() => {
    if (selectedFriendId) {
      return (
        filteredFriends.find((f) => f.id === selectedFriendId) ||
        friendsList.find((f) => f.id === selectedFriendId) ||
        filteredFriends[0] ||
        friendsList[0]
      );
    }
    return filteredFriends[0] || friendsList[0];
  }, [selectedFriendId, filteredFriends, friendsList]);

  const handleConfirmUnfriend = async () => {
    if (!unfriendModalTarget) return;
    setModalActionLoading(true);
    try {
      await friendsApi.unfriend(unfriendModalTarget.id, token);
      setFriendsList((prev) => prev.filter((f) => f.id !== unfriendModalTarget.id));
      invalidateAllFriendsData(unfriendModalTarget.id);
      if (onFriendRemoved) onFriendRemoved(unfriendModalTarget.id);
      notify.success(`Unfriended ${unfriendModalTarget.name}`);
      setUnfriendModalTarget(null);
    } catch (err: any) {
      notify.error(err.message || "Failed to unfriend");
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleConfirmBlock = async () => {
    if (!blockModalTarget) return;
    setModalActionLoading(true);
    try {
      await friendsApi.blockUser(blockModalTarget.id, token);
      setFriendsList((prev) => prev.filter((f) => f.id !== blockModalTarget.id));
      invalidateAllFriendsData(blockModalTarget.id);
      if (onFriendRemoved) onFriendRemoved(blockModalTarget.id);
      notify.info(`Blocked ${blockModalTarget.name}`);
      setBlockModalTarget(null);
    } catch (err: any) {
      notify.error(err.message || "Failed to block user");
    } finally {
      setModalActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col 2xl:flex-row gap-5 items-start">
      {/* 1. Left Column (Searchable Friends List) */}
      <div className="w-full 2xl:w-[350px] shrink-0 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs space-y-3.5">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            All Friends
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {friendsList.length} {friendsList.length === 1 ? "friend" : "friends"}
          </p>
        </div>

        {/* Search Friends Input */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Friends"
            className="w-full pl-9 pr-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs font-medium dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
          />
        </div>

        {/* Friends Vertical List */}
        <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar pt-1">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2.5 rounded-xl animate-pulse"
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map((f) => {
              const isSelected = currentSelectedFriend?.id === f.id;
              const isDropdownOpen = openDropdownId === f.id;

              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFriendId(f.id)}
                  className={`relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? "bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40"
                      : "hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Avatar src={f.image} alt={f.name} size="md" />
                    <div className="truncate">
                      <p
                        className={`font-bold text-xs truncate ${isSelected ? "text-[#e02f21]" : "text-gray-900 dark:text-white"}`}
                      >
                        {f.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {f.mutualFriends !== undefined && f.mutualFriends > 0
                          ? `${f.mutualFriends} mutual friends`
                          : f.city || `@${f.username || "cook"}`}
                      </p>
                    </div>
                  </div>

                  {/* 3-Dots Action Menu (Matching Image 2) */}
                  <div className="relative">
                    <button
                      type="button"
                      aria-label="More options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(isDropdownOpen ? null : f.id);
                      }}
                      className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 transition"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-9 z-30 w-52 bg-white dark:bg-[#242526] rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenDropdownId(null);
                            startConversation({
                              id: f.id,
                              name: f.name,
                              image: f.image,
                            });
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-left transition"
                        >
                          <MessageSquare size={14} className="text-gray-500" />
                          <span>Message {f.name.split(" ")[0]}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUnfriendModalTarget({ id: f.id, name: f.name });
                            setOpenDropdownId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition"
                        >
                          <UserX size={14} />
                          <span>Unfriend {f.name.split(" ")[0]}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setBlockModalTarget({ id: f.id, name: f.name });
                            setOpenDropdownId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left transition"
                        >
                          <ShieldAlert size={14} />
                          <span>Block {f.name.split(" ")[0]}'s profile</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">
              No friends found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {/* 2. Right Column (Full Profile Preview) */}
      <div className="flex-1 min-w-0 w-full">
        {currentSelectedFriend ? (
          <FriendProfilePreview friend={currentSelectedFriend} token={token} />
        ) : (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
            <Users size={36} className="mx-auto text-gray-400 mb-2" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Select a friend to preview
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Click any friend from the list on the left to see their profile.
            </p>
          </div>
        )}
      </div>

      {/* Block Confirmation Modal */}
      <BlockUserModal
        isOpen={Boolean(blockModalTarget)}
        onClose={() => setBlockModalTarget(null)}
        onConfirm={handleConfirmBlock}
        userName={blockModalTarget?.name}
        loading={modalActionLoading}
      />

      {/* Unfriend Confirmation Modal */}
      <UnfriendUserModal
        isOpen={Boolean(unfriendModalTarget)}
        onClose={() => setUnfriendModalTarget(null)}
        onConfirm={handleConfirmUnfriend}
        userName={unfriendModalTarget?.name}
        loading={modalActionLoading}
      />
    </div>
  );
};

export default AllFriendsSplitView;
