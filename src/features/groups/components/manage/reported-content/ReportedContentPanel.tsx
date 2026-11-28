import React from "react";
import { Flag } from "lucide-react";

export const ReportedContentPanel: React.FC = () => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
      <div className="py-12 text-center space-y-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
        <Flag size={34} className="mx-auto text-gray-300 dark:text-gray-600" />
        <h3 className="font-bold text-base text-gray-900 dark:text-white">
          No reported content right now
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Posts or comments flagged by group members against your rules will
          appear here so moderators can keep or remove them.
        </p>
      </div>
    </div>
  );
};

export default ReportedContentPanel;

