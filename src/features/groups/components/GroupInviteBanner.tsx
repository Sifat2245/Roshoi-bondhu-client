import React, { useState } from "react";
import { Users, Clock, AlertTriangle, Check, X, ShieldCheck } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import Button from "../../../components/ui/Button";
import type {
  GroupInvitePreview,
  GroupPendingInviteSummary,
} from "../types/group.types";

interface GroupInviteBannerProps {
  group: any;
  isMember: boolean;
  invitePreview?: GroupInvitePreview | null;
  loadingPreview?: boolean;
  hasInviteToken?: boolean;
  onAcceptInviteLink?: () => Promise<void>;
  onDismissInviteLink?: () => void;
  onRespondDirectInvite?: (
    invitationId: string,
    action: "ACCEPT" | "DECLINE",
  ) => Promise<void>;
  onCancelPendingRequest?: () => Promise<void>;
}

export const GroupInviteBanner: React.FC<GroupInviteBannerProps> = ({
  group,
  isMember,
  invitePreview,
  loadingPreview = false,
  hasInviteToken = false,
  onAcceptInviteLink,
  onDismissInviteLink,
  onRespondDirectInvite,
  onCancelPendingRequest,
}) => {
  const [busy, setBusy] = useState<string | null>(null);

  const pendingInvite: GroupPendingInviteSummary | null =
    group?.myPendingInvite || null;
  const membershipStatus = group?.myMembershipStatus;

  // 1. User's membership request is already pending admin approval
  if (!isMember && membershipStatus === "PENDING") {
    return (
      <div className="max-w-[1250px] mx-auto px-4 sm:px-8 pt-4">
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-amber-200 dark:border-amber-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </span>
            <div>
              <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                Request pending admin approval
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                A group admin or moderator will review your request to join{" "}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {group.name}
                </span>
                .
              </p>
            </div>
          </div>

          {onCancelPendingRequest && (
            <Button
              size="sm"
              variant="secondary"
              loading={busy === "CANCEL"}
              onClick={async () => {
                setBusy("CANCEL");
                try {
                  await onCancelPendingRequest();
                } finally {
                  setBusy(null);
                }
              }}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 cursor-pointer"
            >
              Cancel request
            </Button>
          )}
        </div>
      </div>
    );
  }

  // 2. Arrived via ?invite=TOKEN link
  if (hasInviteToken && !isMember) {
    if (loadingPreview) {
      return (
        <div className="max-w-[1250px] mx-auto px-4 sm:px-8 pt-4">
          <div className="h-20 bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse" />
        </div>
      );
    }

    if (invitePreview && !invitePreview.valid) {
      return (
        <div className="max-w-[1250px] mx-auto px-4 sm:px-8 pt-4">
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-rose-200 dark:border-rose-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </span>
              <div>
                <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                  Invitation link unavailable
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {invitePreview.reason ||
                    "This invitation link is invalid, expired, or has been revoked."}
                </p>
              </div>
            </div>
            {onDismissInviteLink && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onDismissInviteLink}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 cursor-pointer"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (invitePreview?.valid) {
      const inviterName = invitePreview.inviter?.name || "A group member";
      return (
        <div className="max-w-[1250px] mx-auto px-4 sm:px-8 pt-4">
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-red-200 dark:border-red-900/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {invitePreview.inviter ? (
                <Avatar
                  src={invitePreview.inviter.image}
                  alt={inviterName}
                  size="md"
                />
              ) : (
                <span className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
                  <Users size={20} />
                </span>
              )}
              <div>
                <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                  {inviterName} invited you to join {group.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                  {invitePreview.requiresAdminApproval ? (
                    <>
                      <ShieldCheck size={14} className="text-amber-500 shrink-0" />
                      <span>
                        Admin approval required — accepting submits your join
                        request for review.
                      </span>
                    </>
                  ) : (
                    <span>
                      Accept this invite link to become a member immediately.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {onAcceptInviteLink && (
                <Button
                  size="sm"
                  loading={busy === "LINK_ACCEPT"}
                  onClick={async () => {
                    setBusy("LINK_ACCEPT");
                    try {
                      await onAcceptInviteLink();
                    } finally {
                      setBusy(null);
                    }
                  }}
                  className="bg-[#e02f21] hover:bg-[#c92518] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={15} />
                  <span>
                    {invitePreview.requiresAdminApproval
                      ? "Accept & Request Join"
                      : "Accept Invitation"}
                  </span>
                </Button>
              )}
              {onDismissInviteLink && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={Boolean(busy)}
                  onClick={onDismissInviteLink}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // 3. User has a direct pending invitation on their account
  if (!isMember && pendingInvite) {
    const inviterName = pendingInvite.inviter?.name || "A group member";
    return (
      <div className="max-w-[1250px] mx-auto px-4 sm:px-8 pt-4">
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-red-200 dark:border-red-900/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {pendingInvite.inviter ? (
              <Avatar
                src={pendingInvite.inviter.image}
                alt={inviterName}
                size="md"
              />
            ) : (
              <span className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
                <Users size={20} />
              </span>
            )}
            <div>
              <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                {inviterName} invited you to join {group.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Accept this invitation to participate in discussions and share
                recipes.
              </p>
            </div>
          </div>

          {onRespondDirectInvite && (
            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                size="sm"
                loading={busy === "ACCEPT"}
                disabled={Boolean(busy && busy !== "ACCEPT")}
                onClick={async () => {
                  setBusy("ACCEPT");
                  try {
                    await onRespondDirectInvite(pendingInvite.id, "ACCEPT");
                  } finally {
                    setBusy(null);
                  }
                }}
                className="bg-[#e02f21] hover:bg-[#c92518] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Check size={15} />
                <span>Accept Invite</span>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                loading={busy === "DECLINE"}
                disabled={Boolean(busy && busy !== "DECLINE")}
                onClick={async () => {
                  setBusy("DECLINE");
                  try {
                    await onRespondDirectInvite(pendingInvite.id, "DECLINE");
                  } finally {
                    setBusy(null);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <X size={15} />
                <span>Decline</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default GroupInviteBanner;

