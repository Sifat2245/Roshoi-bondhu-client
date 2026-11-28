import React from "react";
import { FileClock } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import type { GroupManageSection } from "../types";

interface PendingPostsPanelProps {
  group: any;
  isAdmin: boolean;
  pendingCount: number;
  onSelectSection: (section: GroupManageSection) => void;
}

export const PendingPostsPanel: React.FC<PendingPostsPanelProps> = ({
  group,
  isAdmin,
  pendingCount,
  onSelectSection,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            Post approval is {group.requiresPostApproval ? "ON" : "OFF"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {pendingCount} posts waiting for review
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="secondary"
            size="xs"
            onClick={() => onSelectSection("SETTINGS")}
            className="cursor-pointer"
          >
            Change approval setting
          </Button>
        )}
      </div>

      <div className="py-12 text-center space-y-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
        <FileClock
          size={34}
          className="mx-auto text-gray-300 dark:text-gray-600"
        />
        <h3 className="font-bold text-base text-gray-900 dark:text-white">
          No pending posts to review
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          When post approval is enabled, posts submitted by regular members
          appear here for approval or rejection before publishing.
        </p>
      </div>
    </div>
  );
};

export default PendingPostsPanel;

