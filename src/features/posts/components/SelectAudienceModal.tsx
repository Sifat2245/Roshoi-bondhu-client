import React, { useState, useEffect } from "react";
import Modal from "../../../components/ui/Modal";
import { Globe, Users, Lock } from "lucide-react";
import type { PostAudience } from "../model/post-policy";

interface SelectAudienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAudience?: PostAudience;
  onSave: (audience: PostAudience) => void;
}

interface AudienceOption {
  value: PostAudience;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const AUDIENCE_OPTIONS: AudienceOption[] = [
  {
    value: "PUBLIC",
    title: "Public",
    description: "Anyone on or off Hesheli",
    icon: Globe,
  },
  {
    value: "FRIENDS",
    title: "Friends",
    description: "Your friends on Hesheli",
    icon: Users,
  },
  {
    value: "ONLY_ME",
    title: "Only me",
    description: "Only you can see this post",
    icon: Lock,
  },
];

export const SelectAudienceModal: React.FC<SelectAudienceModalProps> = ({
  isOpen,
  onClose,
  currentAudience = "PUBLIC",
  onSave,
}) => {
  const [selected, setSelected] = useState<PostAudience>(currentAudience);

  useEffect(() => {
    if (isOpen) {
      setSelected(currentAudience || "PUBLIC");
    }
  }, [isOpen, currentAudience]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select audience"
      maxWidth="max-w-md"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
            Who can see your post?
          </h4>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Your post may show up in Feed, on your profile, in search results, and in Messenger
          </p>
        </div>

        <div className="space-y-2">
          {AUDIENCE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isChecked = selected === option.value;

            return (
              <label
                key={option.value}
                onClick={() => setSelected(option.value)}
                className={`flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl cursor-pointer transition border select-none ${
                  isChecked
                    ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/60 border-transparent"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition ${
                    isChecked
                      ? "bg-[#e02f21] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <Icon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                    {option.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center justify-center">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      isChecked
                        ? "border-[#e02f21] bg-white dark:bg-[#242526]"
                        : "border-gray-400 dark:border-gray-600 bg-transparent"
                    }`}
                  >
                    {isChecked && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#e02f21]" />
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-[#e02f21] hover:bg-[#c92518] active:scale-98 transition shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SelectAudienceModal;

