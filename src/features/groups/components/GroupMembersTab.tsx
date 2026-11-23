import React, { useState } from "react";
import { Link } from "react-router";
import {
  Shield,
  Search,
  Users,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Crown,
  Loader2,
} from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import groupsApi from "../api/groups.api";
import { useInvalidateGroupQueries } from "../hooks/useGroupQueries";
import InviteMemberModal from "./InviteMemberModal";
import defaultUserAvatar from "../../../assets/user-image.png";

export type GroupMemberAction = "ADMIN" | "MODERATOR" | "MEMBER" | "REMOVE";

const actionLabels: Record<GroupMemberAction, string> = {
  ADMIN: "Make admin",
  MODERATOR: "Make moderator",
  MEMBER: "Make regular member",
  REMOVE: "Remove from group",
};

const actionExplanations: Record<GroupMemberAction, string> = {
  ADMIN:
    "Admins have full control over group settings, member approvals, posts, and roles.",
  MODERATOR:
    "Moderators can review posts, manage discussions, and remove regular members.",
  MEMBER:
    "This person will remain a regular member without management permissions.",
  REMOVE:
    "They will be removed from the group and will need to rejoin to participate.",
};

export default function GroupMembersTab({
  group,
  onMembersChanged,
}: {
  group: any;
  onMembersChanged?: () => void;
}) {
  const { user } = useAuth();
  const { notify } = useToast();
  const {
    updateMemberRoleInGroup,
    removeMemberFromGroup,
    invalidateGroupDetail,
  } = useInvalidateGroupQueries();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ADMINS" | "MODERATORS">("ALL");
  const [selected, setSelected] = useState<any>(null);
  const [action, setAction] = useState<GroupMemberAction | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const creatorId = group.createdById || group.createdBy?.id || group.creatorId;
  const isCreator = Boolean(user?.id && user.id === creatorId);
  const members = group.members || [];

  const myMemberRecord = members.find(
    (m: any) => m.userId === user?.id || m.user?.id === user?.id
  );
  const viewerRole = isCreator
    ? "ADMIN"
    : group.currentUserRole || myMemberRecord?.role || "MEMBER";
  const isAdmin = isCreator || viewerRole === "ADMIN";
  const isModerator = viewerRole === "MODERATOR";
  const isStaff = isAdmin || isModerator;

  const visibleMembers = members.filter((member: any) => {
    const nameMatch = `${member.user?.name || ""} ${member.user?.username || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());

    if (!nameMatch) return false;

    const isMemberCreator = (member.userId || member.user?.id) === creatorId;
    const effectiveRole = isMemberCreator ? "ADMIN" : member.role;

    if (filter === "ADMINS") return effectiveRole === "ADMIN";
    if (filter === "MODERATORS") return effectiveRole === "MODERATOR";
    return true;
  });

  function close() {
    setSelected(null);
    setAction(null);
  }

  // Determine possible actions on a target member
  function getAvailableActions(target: any): GroupMemberAction[] {
    if (!target || !user) return [];
    const targetUserId = target.userId || target.user?.id;
    if (targetUserId === user.id) return []; // Cannot manage own role here
    if (targetUserId === creatorId) return []; // Cannot touch group creator

    const targetRole = target.role || "MEMBER";

    if (isAdmin) {
      const actions: GroupMemberAction[] = [];
      if (targetRole !== "ADMIN") actions.push("ADMIN");
      if (targetRole !== "MODERATOR") actions.push("MODERATOR");
      if (targetRole !== "MEMBER") actions.push("MEMBER");
      actions.push("REMOVE");
      return actions;
    }

    if (isModerator) {
      // Moderators can only remove regular members
      if (targetRole === "MEMBER") {
        return ["REMOVE"];
      }
    }

    return [];
  }

  async function execute() {
    if (!selected || !action || !group?.id) return;
    setLoadingAction(true);

    const targetMemberId = selected.id;
    const targetName = selected.user?.name || "Member";

    try {
      if (action === "REMOVE") {
        await groupsApi.removeMember(group.id, targetMemberId);
        removeMemberFromGroup(group.id, targetMemberId);
        notify.success(`${targetName} removed from group.`);
      } else {
        await groupsApi.updateMemberRole(group.id, targetMemberId, action);
        updateMemberRoleInGroup(group.id, targetMemberId, action);
        notify.success(
          action === "ADMIN"
            ? `${targetName} is now an Admin.`
            : action === "MODERATOR"
              ? `${targetName} is now a Moderator.`
              : `${targetName} is now a regular Member.`
        );
      }

      invalidateGroupDetail(group.slug || group.id);
      close();
      onMembersChanged?.();
    } catch (err: any) {
      notify.error(err.message || "Failed to update member role.");
    } finally {
      setLoadingAction(false);
    }
  }

  const actions = selected ? getAvailableActions(selected) : [];

  return (
    <section className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center gap-3">
        <div>
          <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            Members{" "}
            <span className="text-gray-500 dark:text-gray-400 font-normal text-base">
              ({group.membersCount ?? members.length})
            </span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            People who belong to this foodie community
          </p>
        </div>

        {group.isMember && (
          <Button
            onClick={() => setIsInviteOpen(true)}
            className="bg-[#e02f21] hover:bg-[#c92518] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus size={15} />
            <span>Add member</span>
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
        <input
          type="search"
          aria-label="Search group members"
          placeholder="Find a member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#3a3b3c] text-sm focus:outline-hidden focus:border-[#e02f21] transition"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        {[
          { id: "ALL", label: `All (${members.length})` },
          {
            id: "ADMINS",
            label: `Admins (${
              members.filter(
                (m: any) =>
                  (m.userId || m.user?.id) === creatorId || m.role === "ADMIN"
              ).length
            })`,
          },
          {
            id: "MODERATORS",
            label: `Moderators (${
              members.filter(
                (m: any) =>
                  (m.userId || m.user?.id) !== creatorId &&
                  m.role === "MODERATOR"
              ).length
            })`,
          },
        ].map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              filter === item.id
                ? "bg-red-50 dark:bg-red-950/40 text-[#e02f21] font-bold"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Member List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {visibleMembers.map((member: any) => {
          const memberUserId = member.userId || member.user?.id;
          const isMemberCreator = memberUserId === creatorId;
          const isSelf = memberUserId === user?.id;
          const memberRole = isMemberCreator ? "ADMIN" : member.role || "MEMBER";

          return (
            <div
              key={member.id || memberUserId}
              className="flex items-center justify-between gap-3 py-3"
            >
              <Link
                to={`/profile/${memberUserId}`}
                className="flex items-center gap-3 flex-1 min-w-0 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1.5 transition"
              >
                <Avatar
                  src={member.user?.image || defaultUserAvatar}
                  alt={member.user?.name || "Member"}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
                      {member.user?.name || "Anonymous Chef"}
                    </span>
                    {isSelf && (
                      <span className="text-[11px] font-medium text-gray-400">
                        (you)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isMemberCreator ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-[#e02f21]">
                        <Crown size={12} />
                        Group creator
                      </span>
                    ) : memberRole === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-[#e02f21]">
                        <Shield size={12} />
                        Admin
                      </span>
                    ) : memberRole === "MODERATOR" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                        <Shield size={12} />
                        Moderator
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        @{member.user?.username || "cook"}
                      </span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Options Menu Button */}
              <button
                type="button"
                aria-label={`Member options for ${member.user?.name}`}
                onClick={() => {
                  setSelected(member);
                  setAction(null);
                }}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition shrink-0 cursor-pointer"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          );
        })}
      </div>

      {!visibleMembers.length && (
        <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500 space-y-1">
          <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p>No members match your search.</p>
        </div>
      )}

      {/* Member Action / Confirmation Modal */}
      {selected && (
        <Modal
          isOpen
          onClose={close}
          title={
            action
              ? `${actionLabels[action]}?`
              : selected.user?.name || "Member options"
          }
          maxWidth="max-w-sm"
        >
          <div className="p-4 sm:p-5 space-y-4">
            {action ? (
              <>
                <div className="space-y-2">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {selected.user?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {actionExplanations[action]}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="secondary"
                    disabled={loadingAction}
                    onClick={() => setAction(null)}
                    className="text-xs px-3.5 py-2 cursor-pointer"
                  >
                    Back
                  </Button>
                  <Button
                    disabled={loadingAction}
                    onClick={execute}
                    className={`text-xs px-4 py-2 font-bold cursor-pointer text-white ${
                      action === "REMOVE"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-[#e02f21] hover:bg-[#c92518]"
                    }`}
                  >
                    {loadingAction ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <Link
                  to={`/profile/${selected.userId || selected.user?.id}`}
                  className="block p-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  onClick={close}
                >
                  View profile
                </Link>

                {actions.map((act) => (
                  <button
                    type="button"
                    key={act}
                    onClick={() => setAction(act)}
                    className={`w-full p-3 rounded-xl text-left text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${
                      act === "REMOVE"
                        ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {act === "REMOVE" ? (
                      <UserMinus size={18} />
                    ) : (
                      <Shield size={18} className="text-[#e02f21]" />
                    )}
                    <span>{actionLabels[act]}</span>
                  </button>
                ))}

                {!actions.length && (
                  <p className="p-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {(selected.userId || selected.user?.id) === creatorId
                      ? "The group creator's role and membership are protected."
                      : (selected.userId || selected.user?.id) === user?.id
                        ? "You cannot change your own role here."
                        : "You do not have administrative permissions to change this member's status."}
                  </p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Invite / Add Member Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        group={group}
      />
    </section>
  );
}
