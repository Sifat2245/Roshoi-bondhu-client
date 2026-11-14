import React, { useState } from "react";
import Modal from "../../../components/ui/Modal";
import Avatar from "../../../components/ui/Avatar";
import { useSession } from "../../../lib/auth-client";
import { useSocial } from "../../community/model/useSocial";
import { useToast } from "../../../context/ToastContext";
import postsApi from "../api/posts.api";
import { Post, PostAudience } from "../types/post.types";
import {
  Globe,
  Users,
  Lock,
  ChevronDown,
  Smile,
  Loader2,
  Check,
  ChefHat,
  MessageSquare,
} from "lucide-react";

export interface SharePostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onShared?: () => void;
}

const AUDIENCE_OPTIONS: {
  id: PostAudience;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  {
    id: "PUBLIC",
    label: "Public",
    desc: "Anyone on or off Heshel",
    icon: Globe,
  },
  {
    id: "FRIENDS",
    label: "Friends",
    desc: "Your friends on Heshel",
    icon: Users,
  },
  {
    id: "ONLY_ME",
    label: "Only me",
    desc: "Only visible to you",
    icon: Lock,
  },
];

export const SharePostModal: React.FC<SharePostModalProps> = ({
  post,
  isOpen,
  onClose,
  onShared,
}) => {
  const { data: session } = useSession();
  const { user } = useSocial();
  const { notify } = useToast();

  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<PostAudience>("PUBLIC");
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!post) return null;

  const currentAudience =
    AUDIENCE_OPTIONS.find((opt) => opt.id === audience) || AUDIENCE_OPTIONS[0];
  const AudienceIcon = currentAudience.icon;

  const targetPost = post.originalPost || post;
  const targetAuthor = targetPost.author || {
    name: (targetPost as any).userName || "Heshel Chef",
    image: (targetPost as any).userPhoto || "",
  };

  const handleShare = async () => {
    if (!session?.user && !user) {
      notify.error("Please sign in to share this post.");
      return;
    }

    setIsSharing(true);
    try {
      await postsApi.sharePost(
        post.id,
        caption.trim(),
        audience,
        session?.session?.token,
        user,
      );
      setCaption("");
      onClose();
      onShared?.();
    } catch (err: any) {
      notify.error(err.message || "Failed to share post.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share" maxWidth="max-w-lg">
      <div className="space-y-4 select-none">
        {/* User Profile Header (Meta Style matching Image 2) */}
        <div className="flex items-center gap-3">
          <Avatar
            src={user?.image || session?.user?.image}
            alt={user?.name || session?.user?.name || "User"}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
              {user?.name || session?.user?.name || "Saifuddin Ahmed Sifat"}
            </h4>

            {/* Target & Privacy Pills Row */}
            <div className="flex items-center gap-1.5 mt-1 relative">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 dark:bg-[#343536] text-gray-700 dark:text-gray-200">
                Feed
              </span>

              {/* Privacy Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAudienceOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-[#343536] dark:hover:bg-[#3e4042] text-gray-700 dark:text-gray-200 transition cursor-pointer"
                >
                  <AudienceIcon size={12} />
                  <span>{currentAudience.label}</span>
                  <ChevronDown size={11} className="opacity-70" />
                </button>

                {/* Privacy Selector Popover */}
                {isAudienceOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsAudienceOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-40 p-1 divide-y divide-gray-100 dark:divide-gray-800">
                      <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Who can see this post?
                      </div>
                      <div className="pt-1 space-y-0.5">
                        {AUDIENCE_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          const isSelected = opt.id === audience;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setAudience(opt.id);
                                setIsAudienceOpen(false);
                              }}
                              className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left text-xs transition cursor-pointer ${
                                isSelected
                                  ? "bg-red-50 dark:bg-red-950/40 text-[#e02f21] font-bold"
                                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#343536]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon size={14} className="shrink-0" />
                                <div>
                                  <p className="font-semibold leading-tight">
                                    {opt.label}
                                  </p>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                                    {opt.desc}
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <Check size={14} className="text-[#e02f21] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Caption Textarea (Matching Image 2) */}
        <div className="relative">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Say something about this..."
            rows={3}
            className="w-full p-2 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full transition"
              title="Add emoji"
            >
              <Smile size={19} />
            </button>
          </div>
        </div>

        {/* Embedded Original Post Card Preview */}
        <div className="border border-gray-200 dark:border-gray-700/80 rounded-xl overflow-hidden bg-gray-50/70 dark:bg-[#1f2021]">
          {/* Post Images or Cover */}
          {targetPost.image && (
            <div className="w-full max-h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={targetPost.image}
                alt={targetPost.title || "Post media"}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Post Header & Content */}
          <div className="p-3.5 space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Avatar src={targetAuthor.image} alt={targetAuthor.name} size="xs" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {targetAuthor.name}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  {targetPost.postType === "RECIPE" ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ChefHat size={11} /> Recipe
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500">
                      <MessageSquare size={11} /> Thought
                    </span>
                  )}
                </div>
              </div>
            </div>

            {targetPost.title && (
              <h5 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                {targetPost.title}
              </h5>
            )}

            {(targetPost.caption || targetPost.description) && (
              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                {targetPost.caption || targetPost.description}
              </p>
            )}
          </div>
        </div>

        {/* Primary Action Button (Matching Image 2 "Share now") */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            className="w-full bg-[#e02f21] hover:bg-[#c22417] text-white font-bold text-sm py-2.5 rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSharing ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Sharing...</span>
              </>
            ) : (
              <span>Share now</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SharePostModal;

