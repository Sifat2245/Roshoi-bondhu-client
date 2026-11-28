import React, { useState } from "react";
import { Ban, Search } from "lucide-react";

interface BannedMembersPanelProps {
  groupName: string;
}

export const BannedMembersPanel: React.FC<BannedMembersPanelProps> = ({
  groupName,
}) => {
  const [search, setSearch] = useState("");

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search banned accounts..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#3a3b3c] text-sm focus:outline-none focus:border-[#e02f21]"
        />
      </div>

      <div className="py-12 text-center space-y-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
        <Ban size={34} className="mx-auto text-gray-300 dark:text-gray-600" />
        <h3 className="font-bold text-base text-gray-900 dark:text-white">
          No banned members
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Accounts banned from {groupName} cannot view private content, post,
          or rejoin until a staff member unbans them.
        </p>
      </div>
    </div>
  );
};

export default BannedMembersPanel;

