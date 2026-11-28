import React from "react";
import ManageShell from "./ManageShell";
import GroupManageOverview from "./overview/GroupManageOverview";
import MemberRequestsPanel from "./member-requests/MemberRequestsPanel";
import PendingPostsPanel from "./pending-posts/PendingPostsPanel";
import ReportedContentPanel from "./reported-content/ReportedContentPanel";
import BannedMembersPanel from "./banned-members/BannedMembersPanel";
import GroupRulesPanel from "./group-rules/GroupRulesPanel";
import CommunityRolesPanel from "./community-roles/CommunityRolesPanel";
import GroupSettingsPanel from "./group-settings/GroupSettingsPanel";
import type { GroupManageCounts, GroupManageSection } from "./types";

interface GroupManageViewProps {
  group: any;
  section: Exclude<GroupManageSection, "HOME" | "MOBILE_HUB">;
  isAdmin: boolean;
  token?: string | null;
  counts: GroupManageCounts;
  onSelectSection: (section: GroupManageSection) => void;
  onBackMobileHub: () => void;
  onBackHome: () => void;
  onGroupUpdated?: () => void;
}

const SECTION_META: Record<
  Exclude<GroupManageSection, "HOME" | "MOBILE_HUB">,
  { title: string; subtitle: string }
> = {
  OVERVIEW: {
    title: "Overview",
    subtitle: "Summary of queues, group status, and quick moderation tools.",
  },
  MEMBER_REQUESTS: {
    title: "Member requests",
    subtitle: "Review people waiting to join this group.",
  },
  PENDING_POSTS: {
    title: "Pending posts",
    subtitle: "Approve or decline posts before they appear in the group feed.",
  },
  REPORTED_CONTENT: {
    title: "Member-reported content",
    subtitle: "Review posts, comments, or members flagged by the community.",
  },
  BANNED_MEMBERS: {
    title: "Banned members",
    subtitle: "Manage users restricted from viewing or participating in this group.",
  },
  GROUP_RULES: {
    title: "Group rules",
    subtitle: "Set clear guidelines for recipe sharing and community discussions.",
  },
  COMMUNITY_ROLES: {
    title: "Community roles",
    subtitle: "Manage admins, moderators, and members in this group.",
  },
  SETTINGS: {
    title: "Group settings",
    subtitle: "Configure privacy, discoverability, approvals, and ownership.",
  },
};

export const GroupManageView: React.FC<GroupManageViewProps> = ({
  group,
  section,
  isAdmin,
  token,
  counts,
  onSelectSection,
  onBackMobileHub,
  onBackHome,
  onGroupUpdated,
}) => {
  const meta = SECTION_META[section];

  return (
    <ManageShell
      groupName={group.name}
      title={meta.title}
      subtitle={meta.subtitle}
      onBackMobileHub={onBackMobileHub}
      onBackHome={onBackHome}
    >
      {section === "OVERVIEW" && (
        <GroupManageOverview
          group={group}
          isAdmin={isAdmin}
          counts={counts}
          onSelectSection={onSelectSection}
        />
      )}
      {section === "MEMBER_REQUESTS" && (
        <MemberRequestsPanel
          group={group}
          pendingCount={counts.memberRequests}
        />
      )}
      {section === "PENDING_POSTS" && (
        <PendingPostsPanel
          group={group}
          isAdmin={isAdmin}
          pendingCount={counts.pendingPosts}
          onSelectSection={onSelectSection}
        />
      )}
      {section === "REPORTED_CONTENT" && <ReportedContentPanel />}
      {section === "BANNED_MEMBERS" && (
        <BannedMembersPanel groupName={group.name} />
      )}
      {section === "GROUP_RULES" && (
        <GroupRulesPanel group={group} isAdmin={isAdmin} />
      )}
      {section === "COMMUNITY_ROLES" && (
        <CommunityRolesPanel group={group} onMembersChanged={onGroupUpdated} />
      )}
      {section === "SETTINGS" && (
        <GroupSettingsPanel
          group={group}
          isAdmin={isAdmin}
          token={token}
          onUpdated={onGroupUpdated}
        />
      )}
    </ManageShell>
  );
};

export default GroupManageView;

