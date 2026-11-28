import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import { useToast } from "../../../../../context/ToastContext";
import groupsApi from "../../../api/groups.api";

interface PostApprovalPolicyCardProps {
  group: any;
  token?: string | null;
  onUpdated?: () => void;
}

export const PostApprovalPolicyCard: React.FC<PostApprovalPolicyCardProps> = ({
  group,
  token,
  onUpdated,
}) => {
  const { notify } = useToast();
  const [joinMode, setJoinMode] = useState<"DIRECT" | "ADMIN_APPROVAL">(
    group.joinMode === "ADMIN_APPROVAL" ? "ADMIN_APPROVAL" : "DIRECT"
  );
  const [requiresPostApproval, setRequiresPostApproval] = useState(
    Boolean(group.requiresPostApproval)
  );
  const [challengeCreatorPolicy, setChallengeCreatorPolicy] = useState<
    "STAFF" | "MEMBERS"
  >(group.challengeCreatorPolicy === "MEMBERS" ? "MEMBERS" : "STAFF");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setJoinMode(group.joinMode === "ADMIN_APPROVAL" ? "ADMIN_APPROVAL" : "DIRECT");
    setRequiresPostApproval(Boolean(group.requiresPostApproval));
    setChallengeCreatorPolicy(
      group.challengeCreatorPolicy === "MEMBERS" ? "MEMBERS" : "STAFF"
    );
  }, [group.id, group.joinMode, group.requiresPostApproval, group.challengeCreatorPolicy]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await groupsApi.updateGroupSettings(
        group.id,
        {
          joinMode,
          requiresPostApproval,
          challengeCreatorPolicy,
        },
        token || null
      );
      notify.success("Membership and posting policies updated.", "Saved", true);
      onUpdated?.();
    } catch (err: any) {
      notify.error(err?.message || "Failed to update policies.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="bg-white dark:bg-[#242526] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5"
    >
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
        <ShieldCheck size={18} className="text-[#e02f21]" />
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">
          Membership & posting policies
        </h2>
      </div>

      <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#3a3b3c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            How people join this group
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {joinMode === "ADMIN_APPROVAL"
              ? "Join requests and regular member invites need admin/moderator approval. Staff invites join directly."
              : "Anyone can join directly or via an invitation link without approval."}
          </p>
        </div>
        <select
          aria-label="Member join mode"
          value={joinMode}
          onChange={(e) =>
            setJoinMode(e.target.value as "DIRECT" | "ADMIN_APPROVAL")
          }
          className="px-3 py-2 rounded-lg bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 text-sm font-semibold dark:text-white shrink-0"
        >
          <option value="DIRECT">Direct join (instant)</option>
          <option value="ADMIN_APPROVAL">Admin approval required</option>
        </select>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-[#3a3b3c]">
        <input
          type="checkbox"
          id="manage-req-appr"
          checked={requiresPostApproval}
          onChange={(e) => setRequiresPostApproval(e.target.checked)}
          className="w-4 h-4 mt-1 shrink-0 rounded text-[#e02f21] focus:ring-[#e02f21] accent-[#e02f21]"
        />
        <label
          htmlFor="manage-req-appr"
          className="text-sm leading-relaxed font-medium text-gray-700 dark:text-gray-200 cursor-pointer"
        >
          <span className="font-bold block">Require post approval</span>
          Admins and moderators must approve member posts before they appear in
          the group feed.
        </label>
      </div>

      <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#3a3b3c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            Who can create community challenges
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Control whether only staff or all members can launch cooking
            challenges.
          </p>
        </div>
        <select
          aria-label="Challenge creator policy"
          value={challengeCreatorPolicy}
          onChange={(e) =>
            setChallengeCreatorPolicy(e.target.value as "STAFF" | "MEMBERS")
          }
          className="px-3 py-2 rounded-lg bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 text-sm font-semibold dark:text-white shrink-0"
        >
          <option value="STAFF">Admins & moderators only</option>
          <option value="MEMBERS">Any approved member</option>
        </select>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          loading={saving}
          className="px-6 py-2.5 text-sm font-bold cursor-pointer"
        >
          Save policies
        </Button>
      </div>
    </form>
  );
};

export default PostApprovalPolicyCard;
