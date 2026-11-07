import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useChatDock } from '../../../context/ChatDockContext';
import {
  Phone,
  Video,
  Minus,
  X,
  ChevronDown,
  Image as ImageIcon,
  Mic,
  Smile,
  Send,
  ThumbsUp,
  Sparkles,
  Gift,
  Edit3,
  Check,
  CheckCheck,
} from 'lucide-react';

const FloatingChatDock: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    activeConversation,
    isMinimized,
    closeChat,
    minimizeChat,
    restoreChat,
    openChat,
    sendMessage,
    conversations,
  } = useChatDock();

  const [inputText, setInputText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If user is on full Messenger page (/messages), suppress the floating dock to avoid duplicate UI
  const isFullMessagesPage = location.pathname.startsWith('/messages');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeConversation && !isMinimized) {
      scrollToBottom();
    }
  }, [activeConversation?.messages, isMinimized]);

  if (isFullMessagesPage) {
    return null;
  }

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, inputText.trim());
    setInputText('');
  };

  const handleSendThumbsUp = () => {
    if (!activeConversation) return;
    sendMessage(activeConversation.id, '👍');
  };

  const handleOpenLatest = () => {
    if (conversations.length > 0) {
      openChat(conversations[0].id);
    }
  };

  // 1. Minimized State: Floating Chat Head + Compose Button (matching Image 2)
  if (isMinimized && activeConversation) {
    return (
      <div className="fixed bottom-5 right-5 sm:right-8 z-50 flex flex-col items-center gap-3 select-none">
        {/* Floating Chat Head */}
        <div className="relative group">
          <button
            type="button"
            onClick={restoreChat}
            className="w-14 h-14 rounded-full shadow-2xl ring-2 ring-white dark:ring-[#242526] overflow-hidden hover:scale-105 active:scale-95 transition cursor-pointer relative bg-white dark:bg-[#242526]"
            title={`Chat with ${activeConversation.name}`}
          >
            <img
              src={activeConversation.avatar}
              alt={activeConversation.name}
              className="w-full h-full object-cover"
            />
            {activeConversation.isOnline && (
              <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#242526]" />
            )}
          </button>

          {/* Close Chat Head Button on hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeChat();
            }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-black cursor-pointer text-xs"
            title="Close chat"
          >
            <X size={12} />
          </button>
        </div>

        {/* Floating Compose Button (matching Image 2) */}
        <button
          type="button"
          onClick={() => navigate('/messages')}
          className="w-12 h-12 bg-white dark:bg-[#242526] rounded-full shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer hover:scale-105 active:scale-95"
          title="New message"
        >
          <Edit3 size={19} />
        </button>
      </div>
    );
  }

  // If no chat is active at all, show the floating compose button at the bottom right (matching Image 2)
  if (!activeConversation) {
    return (
      <div className="fixed bottom-5 right-5 sm:right-8 z-40 select-none">
        <button
          type="button"
          onClick={handleOpenLatest}
          className="w-12 h-12 bg-white dark:bg-[#242526] rounded-full shadow-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer hover:scale-105 active:scale-95"
          title="Open Messenger"
        >
          <Edit3 size={19} />
        </button>
      </div>
    );
  }

  // 2. Expanded Floating Chat Window (matching Image 1)
  return (
    <div className="fixed bottom-0 right-4 sm:right-16 z-50 w-[330px] sm:w-[350px] h-[455px] bg-white dark:bg-[#242526] rounded-t-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 select-none">
      {/* A. Top Header (Avatar, Name with dropdown, Phone, Video, Minimize, Close) */}
      <div className="h-14 px-3.5 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 shadow-2xs relative z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={activeConversation.avatar}
              alt={activeConversation.name}
              className="w-9 h-9 rounded-full object-cover shadow-2xs"
            />
            {activeConversation.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#242526]" />
            )}
          </div>

          <div
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-1.5 py-1 rounded-lg transition min-w-0"
          >
            <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
              {activeConversation.name}
            </span>
            <ChevronDown size={14} className="text-gray-400 shrink-0" />
          </div>
        </div>

        {/* Right Header Action Icons */}
        <div className="flex items-center gap-0.5 text-[#e02f21]">
          <button
            type="button"
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition cursor-pointer"
            title="Start voice call"
          >
            <Phone size={17} />
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition cursor-pointer"
            title="Start video call"
          >
            <Video size={18} />
          </button>
          <button
            type="button"
            onClick={minimizeChat}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            title="Minimize chat"
          >
            <Minus size={18} />
          </button>
          <button
            type="button"
            onClick={closeChat}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            title="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Header Options Dropdown */}
      {showOptions && (
        <div className="absolute top-14 left-4 w-48 bg-white dark:bg-[#242526] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => {
              setShowOptions(false);
              navigate('/messages');
            }}
            className="w-full px-3.5 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            Open in Messenger
          </button>
          <button
            type="button"
            onClick={() => setShowOptions(false)}
            className="w-full px-3.5 py-2 text-left text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            Mute notifications
          </button>
        </div>
      )}

      {/* B. Message Stream (matching Image 1) */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-2.5 bg-white dark:bg-[#18191a]">
        {/* Contact Avatar Header */}
        <div className="py-4 flex flex-col items-center justify-center text-center space-y-1 select-none">
          <img
            src={activeConversation.avatar}
            alt=""
            className="w-14 h-14 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-[#242526]"
          />
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">
            {activeConversation.name}
          </h4>
          <p className="text-[11px] text-gray-400">
            {activeConversation.isOnline ? 'Active now' : activeConversation.lastActive || 'Heshel friend'}
          </p>
        </div>

        {/* Message Bubbles */}
        {activeConversation.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'} space-y-0.5`}
          >
            <div className="flex items-end gap-1.5 max-w-[82%]">
              {!msg.isMine && (
                <img
                  src={activeConversation.avatar}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover shrink-0 mb-0.5"
                />
              )}
              <div
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                  msg.isMine
                    ? 'bg-[#e02f21] text-white rounded-br-sm shadow-2xs'
                    : 'bg-[#f0f2f5] dark:bg-[#3a3b3c] text-gray-900 dark:text-gray-100 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              </div>
            </div>

            {/* Time / Seen status */}
            <div className="flex items-center gap-1 text-[10px] text-gray-400 px-1">
              <span>{msg.timestamp}</span>
              {msg.isMine && (
                msg.status === 'seen' ? (
                  <CheckCheck size={12} className="text-[#e02f21]" />
                ) : (
                  <Check size={12} />
                )
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* C. Bottom Input Toolbar (matching Image 1) */}
      <form
        onSubmit={handleSend}
        className="px-2.5 py-2 bg-white dark:bg-[#242526] border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 shrink-0"
      >
        <button
          type="button"
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer shrink-0"
          title="Send voice clip"
        >
          <Mic size={18} />
        </button>

        <button
          type="button"
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer shrink-0"
          title="Attach photo"
        >
          <ImageIcon size={18} />
        </button>

        <button
          type="button"
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer shrink-0"
          title="Send sticker"
        >
          <Sparkles size={18} />
        </button>

        {/* Text Input ("Aa") */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Aa"
            className="w-full pl-3 pr-8 py-1.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-full text-xs sm:text-sm font-medium text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#e02f21] transition"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
            title="Emoji"
          >
            <Smile size={16} />
          </button>
        </div>

        {/* Thumbs-up OR Send button */}
        {inputText.trim() ? (
          <button
            type="submit"
            className="w-8 h-8 rounded-full bg-[#e02f21] hover:bg-[#c92518] text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
            title="Send"
          >
            <Send size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSendThumbsUp}
            className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#e02f21] flex items-center justify-center transition cursor-pointer shrink-0"
            title="Send thumbs up"
          >
            <ThumbsUp size={18} className="fill-[#e02f21]" />
          </button>
        )}
      </form>
    </div>
  );
};

export default FloatingChatDock;

