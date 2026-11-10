import { useState } from "react";
import { Link } from "react-router";
import {
  Shield,
  Search,
  Users,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Ban,
  MessageCircle,
} from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../context/ToastContext";
import { useSocial } from "../../community/model/useSocial";
import {
  applyMemberAction,
  memberActions,
  type MemberAction,
} from "../../community/model/community-domain";

const labels: Record<MemberAction, string> = {
  ADMIN: "Make admin",
  MODERATOR: "Make moderator",
  MEMBER: "Make regular member",
  REMOVE: "Remove from group",
  BAN: "Ban from group",
  UNBAN: "Remove ban",
};
const explanations: Record<MemberAction, string> = {
  ADMIN: "Admins can manage members, settings, and community activities.",
  MODERATOR:
    "Moderators can manage community activities and remove regular members.",
  MEMBER:
    "This person will keep their membership without management permissions.",
  REMOVE:
    "They can join again later. Their existing posts will remain in the group.",
  BAN: "They will be removed from the group and cannot rejoin until the ban is lifted.",
  UNBAN:
    "They can join the group again. Removing a ban does not automatically restore membership.",
};

export default function GroupMembersTab({
  group,
  onMembersChanged,
}: {
  group: any;
  onMembersChanged?: () => void;
}) {
  const { update, user } = useSocial();
  const { notify } = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);
  const [action, setAction] = useState<MemberAction | null>(null);
  const members = group.members || [];
  const viewerRole =
    user?.id === group.creatorId
      ? "ADMIN"
      : members.find((m) => m.userId === user?.id)?.role;
  const staff = group.isMember && ["ADMIN", "MODERATOR"].includes(viewerRole);
  const visible = (
    filter === "BANNED" ? group.bannedMembers || [] : members
  ).filter(
    (member) =>
      `${member.user?.name || ""} ${member.user?.username || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter !== "STAFF" || ["ADMIN", "MODERATOR"].includes(member.role)),
  );
  function close() {
    setSelected(null);
    setAction(null);
  }
  function execute() {
    try {
      update((s) => {
        s.members[group.id] = applyMemberAction(
          group,
          user.id,
          selected.userId,
          action,
          s.members[group.id],
        );
      });
      notify.success(
        action === "REMOVE"
          ? "Member removed"
          : action === "BAN"
            ? "Member banned"
            : action === "UNBAN"
              ? "Ban removed"
              : "Member role updated",
      );
      close();
      onMembersChanged?.();
    } catch (e: any) {
      notify.error(e.message);
    }
  }
  const actions = selected
    ? memberActions(group, user?.id, selected.userId, filter === "BANNED")
    : [];
  return (
    <section className="kitchen-panel p-4 sm:p-6 space-y-4">
      <div className="flex justify-between items-center gap-3">
        <h2 className="font-bold text-lg">
          Members{" "}
          <span className="text-gray-500 dark:text-gray-400 font-normal">
            ({group.membersCount ?? members.length})
          </span>
        </h2>
        <Users size={21} className="text-gray-400" />
      </div>
      <label className="relative block">
        <Search size={17} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="search"
          aria-label="Search group members"
          placeholder="Find a member"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="kitchen-input w-full pl-10! bg-gray-100! dark:bg-[#3a3b3c]!"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {[
          { id: "ALL", label: "All members" },
          { id: "STAFF", label: "Admins & moderators" },
          ...(staff
            ? [
                {
                  id: "BANNED",
                  label: `Banned (${group.bannedMembers?.length || 0})`,
                },
              ]
            : []),
        ].map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === item.id ? "bg-red-50 dark:bg-red-950/40 text-[#e02f21]" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {visible.map((member) => (
          <div
            key={member.id || member.userId}
            className="flex items-center gap-2 py-3"
          >
            <Link
              to={`/profile/${member.userId}`}
              className="flex items-center gap-3 flex-1 min-w-0 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Avatar src={member.user?.image} alt={member.user?.name} />
              <span className="min-w-0">
                <span className="block font-semibold text-sm truncate">
                  {member.user?.name}
                  {member.userId === user?.id ? " (you)" : ""}
                </span>
                <span className="block text-sm text-gray-500 dark:text-gray-400 truncate">
                  @{member.user?.username || "home_cook"}
                </span>
                {member.userId === group.creatorId ? (
                  <span className="text-xs font-semibold text-[#e02f21]">
                    Group creator
                  </span>
                ) : (
                  ["ADMIN", "MODERATOR"].includes(member.role) && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#e02f21]">
                      <Shield size={11} />
                      {member.role === "ADMIN" ? "Admin" : "Moderator"}
                    </span>
                  )
                )}
              </span>
            </Link>
            <button
              type="button"
              aria-label={`Member options for ${member.user?.name}`}
              onClick={() => {
                setSelected(member);
                setAction(null);
              }}
              className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        ))}
      </div>
      {!visible.length && (
        <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {filter === "BANNED"
            ? "No banned members match this search."
            : "No members match your search."}
        </p>
      )}
      {selected && (
        <Modal
          isOpen
          onClose={close}
          title={
            action
              ? labels[action] + "?"
              : selected.user?.name || "Member options"
          }
          maxWidth="max-w-sm"
        >
          <div className="p-5 space-y-4">
            {action ? (
              <>
                <p className="font-semibold text-sm">{selected.user?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {explanations[action]}
                </p>
                <p className="text-xs text-gray-400">
                  This preview is saved on this device.
                </p>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="secondary" onClick={() => setAction(null)}>
                    Back
                  </Button>
                  <Button
                    variant={
                      ["REMOVE", "BAN"].includes(action) ? "danger" : "primary"
                    }
                    onClick={execute}
                  >
                    Confirm
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to={`/profile/${selected.userId}`}
                  className="block p-3 rounded-xl text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  View profile
                </Link>
                {actions.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setAction(item)}
                    className={`w-full p-3 rounded-xl text-left text-sm font-semibold flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 ${["REMOVE", "BAN"].includes(item) ? "text-red-600" : ""}`}
                  >
                    {item === "BAN" ? (
                      <Ban size={18} />
                    ) : item === "REMOVE" ? (
                      <UserMinus size={18} />
                    ) : (
                      <Shield size={18} />
                    )}
                    {labels[item]}
                  </button>
                ))}
                {!actions.length && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {selected.userId === group.creatorId
                      ? "The group creator’s role and membership are protected."
                      : selected.userId === user?.id
                        ? "Use the Joined button in the group header if you want to leave."
                        : "Group management actions are available to authorized admins and moderators."}
                  </p>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}
