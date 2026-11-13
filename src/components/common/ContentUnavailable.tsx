import React from "react";
import { useNavigate } from "react-router";
import Button from "../ui/Button";

interface ContentUnavailableProps {
  title?: string;
  message?: string;
  onGoBack?: () => void;
}

export const ContentUnavailable: React.FC<ContentUnavailableProps> = ({
  title = "This content isn't available right now",
  message = "When this happens, it's usually because the owner only shared it with a small group of people, changed who can see it or it's been deleted.",
  onGoBack,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#f0f2f5] dark:bg-[#18191a] text-center">
      <div className="max-w-md w-full mx-auto flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Document with Padlock Graphic (matching Facebook's unavailable illustration) */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg
            className="w-24 h-24 text-blue-100 dark:text-blue-950/40 drop-shadow-xs"
            viewBox="0 0 80 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Document sheet */}
            <path
              d="M10 8C10 4.68629 12.6863 2 16 2H54L74 22V88C74 91.3137 71.3137 94 68 94H16C12.6863 94 10 91.3137 10 88V8Z"
              fill="#90cdf4"
              className="fill-blue-300 dark:fill-blue-900/60"
            />
            {/* Folded corner */}
            <path
              d="M54 2V18C54 20.2091 55.7909 22 58 22H74L54 2Z"
              fill="#63b3ed"
              className="fill-blue-400 dark:fill-blue-800"
            />
          </svg>

          {/* Padlock Badge */}
          <div className="absolute -bottom-1 -right-1 w-14 h-16 bg-slate-700 dark:bg-slate-800 rounded-xl shadow-lg border-2 border-white dark:border-[#242526] flex flex-col items-center justify-center pt-2">
            {/* Shackle */}
            <div className="w-6 h-6 border-[3px] border-slate-300 dark:border-slate-400 border-b-0 rounded-t-full -mt-5 mb-1 bg-transparent"></div>
            {/* Keyhole */}
            <div className="w-2 h-2 rounded-full bg-slate-900 dark:bg-black"></div>
            <div className="w-1 h-2 bg-slate-900 dark:bg-black -mt-0.5 rounded-b"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight pt-2">
          {title}
        </h1>

        {/* Message */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm">
          {message}
        </p>

        {/* Action Button: Go to Feed */}
        <div className="pt-2 w-full max-w-xs space-y-3">
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate("/")}
            className="w-full py-2.5 rounded-xl text-sm font-bold shadow-xs active:scale-[0.98]"
          >
            Go to Feed
          </Button>

          <div className="flex flex-col items-center gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => (onGoBack ? onGoBack() : navigate(-1))}
              className="font-bold text-[#e02f21] hover:underline cursor-pointer"
            >
              Go back
            </button>
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:underline cursor-pointer"
            >
              Visit Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentUnavailable;
