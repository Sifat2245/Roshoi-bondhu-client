import React from "react";
import BasicInfoPrivacyCard from "./BasicInfoPrivacyCard";
import PostApprovalPolicyCard from "./PostApprovalPolicyCard";
import OwnershipLifecycleCard from "./OwnershipLifecycleCard";

interface GroupSettingsPanelProps {
  group: any;
  isAdmin: boolean;
  token?: string | null;
  onUpdated?: () => void;
}

export const GroupSettingsPanel: React.FC<GroupSettingsPanelProps> = ({
  group,
  isAdmin,
  token,
  onUpdated,
}) => {
  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
        Only group admins can edit group settings and ownership.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BasicInfoPrivacyCard
        group={group}
        token={token}
        onUpdated={onUpdated}
      />
      <PostApprovalPolicyCard
        group={group}
        token={token}
        onUpdated={onUpdated}
      />
      <OwnershipLifecycleCard
        group={group}
        token={token}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default GroupSettingsPanel;

