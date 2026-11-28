import React from "react";
import GroupMembersTab from "../../GroupMembersTab";

interface CommunityRolesPanelProps {
  group: any;
  onMembersChanged?: () => void;
}

export const CommunityRolesPanel: React.FC<CommunityRolesPanelProps> = ({
  group,
  onMembersChanged,
}) => {
  return <GroupMembersTab group={group} onMembersChanged={onMembersChanged} />;
};

export default CommunityRolesPanel;

