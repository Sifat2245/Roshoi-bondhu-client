import React from "react";
import { useSession } from "../../../lib/auth-client";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import Avatar from "../../../components/ui/Avatar";
import { Image as ImageIcon, ChefHat, BarChart3 } from "lucide-react";

const CreatePostTrigger = ({ onClick, onRequireAuth }) => {
  const { data: session } = useSession();
  const { user: authUser } = useAuth();
  const { t } = useLanguage();
  const user = session?.user || authUser;

  const handleClick = (initialMode = "CASUAL") => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (onClick) onClick(initialMode);
  };

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-3.5 sm:p-4 shadow-xs border border-gray-100 dark:border-gray-800">
      {/* Top: Avatar & Rounded Input Button */}
      <div className="flex items-center gap-3">
        <Avatar src={user?.image} alt={user?.name || "Cook"} size="md" />
        <button
          type="button"
          onClick={() => handleClick("CASUAL")}
          className="flex-1 bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200/70 dark:hover:bg-gray-700/70 rounded-full px-4 py-2.5 text-left text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium transition cursor-pointer"
        >
          {user
            ? t("whatsCooking", { name: user.name.split(" ")[0] })
            : "What's on your cooking mind? Log in to post..."}
        </button>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-800 my-2.5"></div>

      {/* Bottom Icons Row */}
      <div className="grid grid-cols-3 text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300">
        <button
          type="button"
          onClick={() => handleClick("CASUAL")}
          className="py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2.5 transition cursor-pointer"
        >
          <ImageIcon size={22} className="text-emerald-500" />
          <span>Photo / Story</span>
        </button>

        <button
          type="button"
          onClick={() => handleClick("RECIPE")}
          className="py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2.5 transition cursor-pointer text-[#e02f21]"
        >
          <ChefHat size={22} />
          <span>Share Recipe</span>
        </button>
        <button
          type="button"
          onClick={() => handleClick("POLL")}
          className="py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2 transition"
        >
          <BarChart3 size={20} className="text-amber-600" />
          <span>Poll</span>
        </button>
      </div>
    </div>
  );
};

export default CreatePostTrigger;
