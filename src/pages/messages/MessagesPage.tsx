import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import ChatEmptyState from '../../features/messenger/components/ChatEmptyState';
import ChatThread from '../../features/messenger/components/ChatThread';
import { ChatCategory, ChatConversation } from '../../features/messenger/model/messenger.types';
import { INITIAL_CONVERSATIONS } from '../../features/messenger/model/messenger.mock';
import { useChatDock } from '../../context/ChatDockContext';
import { useToast } from '../../context/ToastContext';
import {
  MoreHorizontal,
  Edit3,
  Search,
  BellOff,
} from 'lucide-react';

const MessagesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { conversations, markChatRead } = useChatDock();
  const { notify } = useToast();
  const [category, setCategory] = useState<ChatCategory>('ALL');
  const [search, setSearch] = useState('');

  const chatParam = searchParams.get('chat');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chatParam || null);

  useEffect(() => {
    setSelectedChatId(chatParam);
  }, [chatParam]);

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id);
    setSearchParams({ chat: id });
    // Mark as read
    markChatRead(id);
  };


  const selectedConversation = conversations.find((c) => c.id === selectedChatId);

  const filteredConversations = conversations.filter((c) => {
    if (category === 'UNREAD' && c.unreadCount === 0) return false;
    if (category === 'GROUPS' && c.type !== 'GROUP') return false;
    if (category === 'COMMUNITIES' && c.type !== 'COMMUNITY') return false;

    if (search.trim()) {
      return (
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="h-dvh flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      {/* 1. Fixed Topbar */}
      <SocialHeader />

      {/* 2. Main 2-Column Facebook Messenger Container (matching Image 5) */}
      <div className="flex-1 min-h-0 mt-[100px] md:mt-14 flex overflow-hidden">
        {/* LEFT COLUMN: Chats Sidebar */}
        <aside
          className={`w-full md:w-[360px] lg:w-[380px] xl:w-[400px] h-full shrink-0 bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-gray-800 flex-col shadow-xs ${
            selectedChatId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header (Chats + Options + Compose) */}
          <div className="p-4 pb-2 flex items-center justify-between">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Chats
            </h1>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 flex items-center justify-center transition cursor-pointer"
                onClick={() => { conversations.forEach((chat) => markChatRead(chat.id)); notify.success("All conversations marked as read"); }}
                title="Mark all chats as read"
              >
                <MoreHorizontal size={18} />
              </button>
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 flex items-center justify-center transition cursor-pointer"
                onClick={() => { setSelectedChatId(null); setSearchParams({}); document.querySelector<HTMLInputElement>('input[placeholder="Search Messenger"]')?.focus(); }}
                title="New message"
              >
                <Edit3 size={18} />
              </button>
            </div>
          </div>

          {/* Search Messenger Input */}
          <div className="px-4 py-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Messenger"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#3a3b3c] rounded-full text-sm font-medium text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e02f21] transition"
              />
            </div>
          </div>

          {/* Filter Pills (All / Unread / Groups / Communities) */}
          <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'ALL', label: 'All' },
                { id: 'UNREAD', label: 'Unread' },
                { id: 'GROUPS', label: 'Groups' },
                { id: 'COMMUNITIES', label: 'Communities' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  category === tab.id
                    ? 'bg-red-50 text-[#e02f21] dark:bg-red-950/60'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-1 space-y-1">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((chat) => {
                const isSelected = selectedChatId === chat.id;
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-2xl transition cursor-pointer group ${
                      isSelected
                        ? 'bg-red-50/80 dark:bg-red-950/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {/* Avatar + Online Dot */}
                    <div className="relative shrink-0">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-13 h-13 rounded-full object-cover shadow-2xs"
                      />
                      {chat.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#242526]" />
                      )}
                    </div>

                    {/* Chat Text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${
                          chat.unreadCount > 0 ? 'font-black text-gray-900 dark:text-white' : 'font-bold text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {chat.name}
                      </p>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          chat.unreadCount > 0
                            ? 'font-bold text-[#e02f21]'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {chat.lastMessage}
                      </p>
                    </div>

                    {/* Meta Indicators */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      {chat.isMuted && (
                        <BellOff size={15} className="text-gray-400" />
                      )}
                      {chat.unreadCount > 0 && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#e02f21]" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-sm text-gray-400">
                No conversations found
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: Active Thread OR Empty State (matching Image 5) */}
        <main
          className={`flex-1 min-w-0 min-h-0 h-full overflow-hidden ${
            selectedChatId ? 'flex flex-col' : 'hidden md:flex flex-col'
          }`}
        >
          {selectedConversation ? (
            <ChatThread
              conversation={selectedConversation}
              onBack={() => {
                setSelectedChatId(null);
                setSearchParams({});
              }}
            />
          ) : (
            <ChatEmptyState />
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;

