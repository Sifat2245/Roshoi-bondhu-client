import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { UserPlus, Search, Check, X, Loader2, Mail, Trash2 } from "lucide-react";
import Avatar from "../../../../../components/ui/Avatar";
import { useToast } from "../../../../../context/ToastContext";
import groupsApi from "../../../api/groups.api";
import type {
  GroupJoinRequest,
  GroupPendingInvitation,
} from "../../../types/group.types";

interface MemberRequestsPanelProps {
  group: any;
  pendingCount: number;
  token?: string | null;
  onUpdated?: () => void;
}

export const MemberRequestsPanel: React.FC<MemberRequestsPanelProps> = ({
  group,
  pendingCount,
  token,
  onUpdated,
}) => {
  const { notify } = useToast();
  const [subTab, setSubTab] = useState<"REQUESTS" | "INVITATIONS">("REQUESTS");
  const [search, setSearch] = useState("");

  const [requests, setRequests] = useState<GroupJoinRequest[]>([]);
  const [invitations, setInvitations] = useState<GroupPendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!group?.id) return;
    setLoading(true);
    try {
      const [reqs, invs] = await Promise.all([
        groupsApi.getJoinRequests(group.id, token || null),
        groupsApi.getPendingInvitations(group.id, token || null),
      ]);
      setRequests(reqs || []);
      setInvitations(invs || []);
    } catch (err: any) {
      notify.error(err?.message || "Failed to load member requests.");
    } finally {
      setLoading(false);
    }
  }, [group?.id, token, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRequestAction = async (
    memberId: string,
    action: "APPROVE" | "REJECT",
  ) => {
    setBusyId(memberId);
    try {
      await groupsApi.handleJoinRequest(group.id, memberId, action, token || null);
      setRequests((prev) => prev.filter((r) => r.id !== memberId));
      if (action === "APPROVE") {
        notify.success("Member request approved!", "Approved", true);
      } else {
        notify.info("Member request declined");
      }
      onUpdated?.();
    } catch (err: any) {
      notify.error(err?.message || "Could not process request.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCancelInvite = async (invitationId: string) => {
    setBusyId(invitationId);
    try {
      await groupsApi.cancelInvitation(group.id, invitationId, token || null);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId));
      notify.info("Invitation cancelled");
    } catch (err: any) {
      notify.error(err?.message || "Could not cancel invitation.");
    } finally {
      setBusyId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const filteredRequests = useMemo(() => {
    if (!q) return requests;
    return requests.filter((r) =>
      r.user?.name?.toLowerCase().includes(q)
    );
  }, [requests, q]);

  const filteredInvitations = useMemo(() => {
    if (!q) return invitations;
    return invitations.filter(
      (inv) =>
        inv.invitee?.name?.toLowerCase().includes(q) ||
        inv.inviter?.name?.toLowerCase().includes(q)
    );
  }, [invitations, q]);

  const joinMode = group?.joinMode === "ADMIN_APPROVAL" ? "ADMIN_APPROVAL" : "DIRECT";

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
        <button
          type="button"
          onClick={() => setSubTab("REQUESTS")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
            subTab === "REQUESTS"
              ? "bg-red-50 text-[#e02f21] dark:bg-red-950/50"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <span>Join requests</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700">
            {loading ? pendingCount : requests.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("INVITATIONS")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
            subTab === "INVITATIONS"
              ? "bg-red-50 text-[#e02f21] dark:bg-red-950/50"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <span>Sent invitations</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700">
            {invitations.length}
          </span>
        </button>
      </div>

      {/* Search bar */}
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
            placeholder={
              subTab === "REQUESTS"
                ? "Search member requests by name..."
                : "Search pending invitations by name..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#3a3b3c] text-sm focus:outline-none focus:border-[#e02f21]"
          />
        </div>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">
          {subTab === "REQUESTS"
            ? `${filteredRequests.length} waiting`
            : `${filteredInvitations.length} invited`}
        </span>
      </div>

      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
          <Loader2 size={24} className="animate-spin text-[#e02f21]" />
          <span>Loading queue...</span>
        </div>
      ) : subTab === "REQUESTS" ? (
        filteredRequests.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Link to={`/profile/${req.userId}`} className="shrink-0">
                    <Avatar
                      src={req.user?.image}
                      alt={req.user?.name || "Member"}
                      size="md"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/profile/${req.userId}`}
                      className="font-bold text-sm text-gray-900 dark:text-white hover:underline block truncate"
                    >
                      {req.user?.name || "Unknown user"}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {req.user?.bio ||
                        `Requested ${new Date(req.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={busyId === req.id}
                    onClick={() => handleRequestAction(req.id, "APPROVE")}
                    className="px-3.5 py-2 rounded-xl bg-[#e02f21] hover:bg-[#c92518] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                  >
                    {busyId === req.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    disabled={busyId === req.id}
                    onClick={() => handleRequestAction(req.id, "REJECT")}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60"
                  >
                    <X size={14} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            <UserPlus
              size={34}
              className="mx-auto text-gray-300 dark:text-gray-600"
            />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              No pending member requests
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {joinMode === "ADMIN_APPROVAL"
                ? "When someone requests to join or accepts a regular member's invite, you can approve or decline them here."
                : "This group is set to Direct Join, so people join immediately without waiting for approval."}
            </p>
          </div>
        )
      ) : filteredInvitations.length > 0 ? (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {filteredInvitations.map((inv) => (
            <div
              key={inv.id}
              className="py-3.5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Link to={`/profile/${inv.inviteeId}`} className="shrink-0">
                  <Avatar
                    src={inv.invitee?.image}
                    alt={inv.invitee?.name || "Invited user"}
                    size="md"
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    to={`/profile/${inv.inviteeId}`}
                    className="font-bold text-sm text-gray-900 dark:text-white hover:underline block truncate"
                  >
                    {inv.invitee?.name || "Unknown user"}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Invited by {inv.inviter?.name || "member"} •{" "}
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={busyId === inv.id}
                onClick={() => handleCancelInvite(inv.id)}
                className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-[#3a3b3c] dark:hover:bg-rose-950/40 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-60 shrink-0"
              >
                {busyId === inv.id ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
                <span>Revoke</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center space-y-2 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
          <Mail
            size={34}
            className="mx-auto text-gray-300 dark:text-gray-600"
          />
          <h3 className="font-bold text-base text-gray-900 dark:text-white">
            No pending invitations
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Direct invitations sent to friends or users that are still awaiting
            their response appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default MemberRequestsPanel;
