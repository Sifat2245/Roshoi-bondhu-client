import React from "react";

const ChatEmptyState: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center select-none bg-white dark:bg-[#18191a]">
      {/* Facebook Messenger Empty State Icon (matches Image 5) */}
      <div className="relative mb-6 flex items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-100 via-pink-50 to-blue-100 dark:from-purple-950/30 dark:via-pink-950/20 dark:to-blue-950/30 flex items-center justify-center shadow-inner">
          <svg
            className="w-16 h-16 text-indigo-400 dark:text-indigo-300 drop-shadow-md"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Rounded Speech Bubble */}
            <path
              d="M36 12C21.64 12 10 22.4 10 35.2C10 42.6 13.9 49.1 20 53.3V61L27.4 56.9C30.1 57.7 33 58.2 36 58.2C50.36 58.2 62 47.8 62 35C62 22.4 50.36 12 36 12Z"
              fill="url(#bubbleGrad)"
            />
            {/* Center Pointer Arrow */}
            <path
              d="M31 28L45 35L37.5 38.5L34 46L31 28Z"
              fill="url(#arrowGrad)"
            />
            <defs>
              <linearGradient
                id="bubbleGrad"
                x1="10"
                y1="12"
                x2="62"
                y2="61"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#E0E7FF" />
                <stop offset="0.5" stopColor="#EDE9FE" />
                <stop offset="1" stopColor="#FCE7F3" />
              </linearGradient>
              <linearGradient
                id="arrowGrad"
                x1="31"
                y1="28"
                x2="45"
                y2="46"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#EC4899" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-gray-100 mb-2 tracking-tight">
        No chats selected
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
        Choose from your existing conversations, start a new one, or connect
        with fellow food creators on Heshel.
      </p>
    </div>
  );
};

export default ChatEmptyState;
