import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  Info,
  ArrowLeft,
  Image as ImageIcon,
  Smile,
  Send,
  ThumbsUp,
  Check,
  CheckCheck,
} from 'lucide-react';
import { ChatConversation, ChatMessage } from '../model/messenger.types';

interface ChatThreadProps {
  conversation: ChatConversation;
  onBack?: () => void;
  onSendMessage: (conversationId: string, text: string) => void;
}

const ChatThread: React.FC<ChatThreadProps> = ({
  conversation,
  onBack,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(conversation.id, inputText.trim());
    setInputText('');
  };

  const handleSendThumbsUp = () => {
    onSendMessage(conversation.id, '👍');
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#18191a] overflow-hidden">
      {/* 1. Chat Header */}
      <div className="h-16 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-[#242526]/80 backdrop-blur-md z-10 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="md:hidden p-2 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition cursor-pointer shrink-0"
              title="Back to Chats"
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {/* Contact Avatar with Online indicator */}
          <div className="relative shrink-0">
            <img
              src={conversation.avatar}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover shadow-2xs"
            />
            {conversation.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#242526]" />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">
              {conversation.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {conversation.isOnline ? 'Active now' : conversation.lastActive || 'Offline'}
            </p>
          </div>
        </div>

        {/* Right Action Icons: Phone, Video, Info */}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
          <button
            type="button"
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition cursor-pointer text-[#e02f21]"
            title="Start voice call"
          >
            <Phone size={19} />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition cursor-pointer text-[#e02f21]"
            title="Start video call"
          >
            <Video size={20} />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition cursor-pointer text-gray-500 hover:text-gray-900 dark:hover:text-white"
            title="Conversation info"
          >
            <Info size={19} />
          </button>
        </div>
      </div>

      {/* 2. Messages Stream */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-[#f0f2f5]/40 dark:bg-[#18191a]">
        {/* Contact Introduction Header */}
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 select-none">
          <img
            src={conversation.avatar}
            alt={conversation.name}
            className="w-20 h-20 rounded-full object-cover shadow-sm ring-4 ring-white dark:ring-[#242526]"
          />
          <h4 className="font-black text-lg text-gray-900 dark:text-white">
            {conversation.name}
          </h4>
          <p className="text-xs text-gray-500 max-w-xs">
            {conversation.type === 'COMMUNITY'
              ? 'Community Food Circle on Heshel'
              : conversation.type === 'GROUP'
              ? 'Recipe Enthusiasts Group Chat'
              : 'Connected as Foodie Friend on Heshel'}
          </p>
        </div>

        {/* Messages */}
        {conversation.messages.map((msg: ChatMessage) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'} space-y-1`}
          >
            <div className="flex items-end gap-2 max-w-[78%] sm:max-w-[70%]">
              {!msg.isMine && (
                <img
                  src={conversation.avatar}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover shrink-0 mb-1"
                />
              )}
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.isMine
                    ? 'bg-[#e02f21] text-white rounded-br-sm shadow-xs'
                    : 'bg-white dark:bg-[#242526] text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-100 dark:border-gray-800 shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              </div>
            </div>

            {/* Timestamp & Status */}
            <div className="flex items-center gap-1 text-[11px] text-gray-400 px-1">
              <span>{msg.timestamp}</span>
              {msg.isMine && (
                msg.status === 'seen' ? (
                  <CheckCheck size={13} className="text-[#e02f21]" />
                ) : (
                  <Check size={13} />
                )
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Message Input Footer */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 shrink-0"
      >
        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition cursor-pointer shrink-0"
          title="Attach photo or recipe"
        >
          <ImageIcon size={20} />
        </button>

        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition cursor-pointer shrink-0"
          title="Add emoji"
        >
          <Smile size={20} />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-[#3a3b3c] rounded-full text-sm font-medium text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e02f21] transition"
          />
        </div>

        {inputText.trim() ? (
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-[#e02f21] hover:bg-[#c92518] text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
            title="Send message"
          >
            <Send size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSendThumbsUp}
            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#e02f21] flex items-center justify-center transition cursor-pointer shrink-0"
            title="Send thumbs up"
          >
            <ThumbsUp size={20} className="fill-[#e02f21]" />
          </button>
        )}
      </form>
    </div>
  );
};

export default ChatThread;

