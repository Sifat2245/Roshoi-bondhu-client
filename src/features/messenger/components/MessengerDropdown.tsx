import React, { useState } from "react";
import {
  MoreHorizontal,
  Maximize2,
  Edit3,
  Search,
  BellOff,
  Users,
} from "lucide-react";
import { ChatCategory, ChatConversation } from "../model/messenger.types";
import { useChatDock } from "../../../context/ChatDockContext";
import { useToast } from "../../../context/ToastContext";

interface MessengerDropdownProps {
  onClose: () => void;
  onOpenFullChat: (conversationId?: string) => void;
}

const MessengerDropdown: React.FC<MessengerDropdownProps> = ({
  onClose,
  onOpenFullChat,
}) => {
  const { openChat, conversations, markChatRead } = useChatDock();
  const { notify } = useToast();
  const [category, setCategory] = useState<ChatCategory>("ALL");
  const [search, setSearch] = useState("");

  const filteredConversations = conversations.filter((c) => {
    // Category filter
    if (category === "UNREAD" && c.unreadCount === 0) return false;
    if (category === "GROUPS" && c.type !== "GROUP") return false;
    if (category === "COMMUNITIES" && c.type !== "COMMUNITY") return false;

    // Search query
    if (search.trim()) {
      return (
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const handleSelectChat = (id: string) => {
    onClose();
    openChat(id);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="social-popover absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col max-h-[85vh] select-none"
    >
      {/* 1. Top Header (matching Image 4) */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2">
        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          Chats
        </h3>
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <button
            type="button"
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            title="Mark all chats as read"
            onClick={() => {
              conversations.forEach((chat) => markChatRead(chat.id));
              notify.success("All chats marked as read");
            }}
          >
            <MoreHorizontal size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullChat();
            }}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            title="Open in full screen"
          >
            <Maximize2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullChat();
            }}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            title="New message"
          >
            <Edit3 size={17} />
          </button>
        </div>
      </div>

      {/* 2. Search Messenger Bar */}
      <div className="px-1 pb-2">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Messenger"
            className="w-full pl-9 pr-3.5 py-1.5 bg-gray-100 dark:bg-[#3a3b3c] rounded-full text-xs sm:text-sm font-medium text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e02f21] transition"
          />
        </div>
      </div>

      {/* 3. Filter Category Pills: All / Unread / Groups / Communities (matching Image 4) */}
      <div className="flex items-center gap-1.5 px-1 pb-2 overflow-x-auto no-scrollbar">
        {(
          [
            { id: "ALL", label: "All" },
            { id: "UNREAD", label: "Unread" },
            { id: "GROUPS", label: "Groups" },
            { id: "COMMUNITIES", label: "Communities" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              category === tab.id
                ? "bg-red-50 text-[#e02f21] dark:bg-red-950/60"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Conversations List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-0.5 max-h-[340px]">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer group"
            >
              {/* Avatar + Online Dot */}
              <div className="relative shrink-0">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full object-cover shadow-2xs"
                />
                {chat.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#242526]" />
                )}
              </div>

              {/* Chat Name & Snippet */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {chat.name}
                </p>
                <p
                  className={`text-xs truncate ${chat.unreadCount > 0 ? "font-bold text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {chat.lastMessage}
                </p>
              </div>

              {/* Status Indicator: Unread Dot / Muted Bell */}
              <div className="shrink-0 flex items-center gap-1.5">
                {chat.isMuted && (
                  <BellOff size={14} className="text-gray-400" />
                )}
                {chat.unreadCount > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e02f21]" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-xs text-gray-400">
            No chats found
          </div>
        )}
      </div>

      {/* 5. Bottom Link: "See all in Messenger" (matching Image 4) */}
      <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800 text-center">
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenFullChat();
          }}
          className="w-full py-1 text-center text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
        >
          See all in Messenger
        </button>
      </div>
    </div>
  );
};

export default MessengerDropdown;
