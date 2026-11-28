import React, { useState } from "react";
import { UserPlus, Search } from "lucide-react";

interface MemberRequestsPanelProps {
  group: any;
  pendingCount: number;
}

export const MemberRequestsPanel: React.FC<MemberRequestsPanelProps> = ({
  group,
  pendingCount,
}) => {
  const [search, setSearch] = useState("");
  const privacy = group.privacy === "PRIVATE" ? "PRIVATE" : "PUBLIC";

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member requests by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#3a3b3c] text-sm focus:outline-none focus:border-[#e02f21]"
          />
        </div>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">
          {pendingCount} pending
        </span>
      </div>

      <div className="py-12 text-center space-y-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
        <UserPlus
          size={34}
          className="mx-auto text-gray-300 dark:text-gray-600"
        />
        <h3 className="font-bold text-base text-gray-900 dark:text-white">
          No pending member requests
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {privacy === "PRIVATE"
            ? "When someone asks to join this private group, you'll be able to approve or decline them here."
            : "This group is currently Public, so people can join directly without approval."}
        </p>
      </div>
    </div>
  );
};

export default MemberRequestsPanel;

