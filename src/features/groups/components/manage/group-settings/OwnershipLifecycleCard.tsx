import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Crown, PauseCircle, AlertTriangle, X } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import Modal from "../../../../../components/ui/Modal";
import { useToast } from "../../../../../context/ToastContext";
import { useAuth } from "../../../../../context/AuthContext";
import groupsApi from "../../../api/groups.api";

interface OwnershipLifecycleCardProps {
  group: any;
  token?: string | null;
  onUpdated?: () => void;
}

export const OwnershipLifecycleCard: React.FC<OwnershipLifecycleCardProps> = ({
  group,
  token,
  onUpdated,
}) => {
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [confirmTransferModal, setConfirmTransferModal] = useState(false);

  const [confirmPauseModal, setConfirmPauseModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [updatingLifecycle, setUpdatingLifecycle] = useState(false);

  const effectiveOwnerId = group.ownerId || group.createdById;
  const isOwner = Boolean(user?.id && user.id === effectiveOwnerId);
  const isPaused = group.status === "PAUSED";

  const transferCandidates = (group.members || []).filter((m: any) => {
    const uid = m.userId || m.user?.id;
    return uid && uid !== effectiveOwnerId && m.isApproved;
  });

  const selectedCandidate = transferCandidates.find(
    (m: any) => (m.userId || m.user?.id) === transferTargetId
  );

  const handleTransferOwnership = async () => {
    if (!transferTargetId) return;
    setTransferring(true);
    try {
      await groupsApi.transferGroupOwnership(
        group.id,
        transferTargetId,
        token || null
      );
      notify.success("Group ownership transferred.");
      setTransferTargetId("");
      setConfirmTransferModal(false);
      onUpdated?.();
    } catch (err: any) {
      notify.error(err?.message || "Failed to transfer ownership.");
    } finally {
      setTransferring(false);
    }
  };

  const handleLifecycle = async (action: "PAUSE" | "RESUME" | "ARCHIVE") => {
    setUpdatingLifecycle(true);
    try {
      await groupsApi.updateGroupLifecycle(group.id, action, token || null);
      if (action === "PAUSE") {
        notify.info("Group paused. New posts are temporarily frozen.");
        setConfirmPauseModal(false);
        onUpdated?.();
      } else if (action === "RESUME") {
        notify.success("Group resumed and active again.");
        setConfirmPauseModal(false);
        onUpdated?.();
      } else {
        notify.info("Group archived.");
        setConfirmDeleteModal(false);
        navigate("/groups");
      }
    } catch (err: any) {
      notify.error(err?.message || "Failed to update group status.");
    } finally {
      setUpdatingLifecycle(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
        <Crown size={18} className="text-[#e02f21]" />
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">
          Ownership & group status
        </h2>
      </div>

      {/* Transfer Ownership */}
      <div className="space-y-2">
        <label
          htmlFor="transfer-owner-select"
          className="block text-sm font-bold text-gray-900 dark:text-white"
        >
          Transfer group ownership
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Current owner:{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {group.owner?.name || group.createdBy?.name || "Group owner"}
          </span>
          . Only the current owner can transfer ownership to another active
          member.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <select
            id="transfer-owner-select"
            disabled={!isOwner}
            value={transferTargetId}
            onChange={(e) => setTransferTargetId(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 text-sm dark:text-white disabled:opacity-50"
          >
            <option value="">Select a member...</option>
            {transferCandidates.map((m: any) => (
              <option
                key={m.id || m.userId}
                value={m.userId || m.user?.id}
              >
                {m.user?.name || "Member"} ({m.role})
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="secondary"
            disabled={!isOwner || !transferTargetId}
            onClick={() => setConfirmTransferModal(true)}
            className="shrink-0 cursor-pointer"
          >
            Transfer ownership
          </Button>
        </div>
      </div>

      {/* Pause / Resume Group */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <p className="font-bold text-sm text-gray-900 dark:text-white">
            {isPaused ? "Resume group" : "Pause group"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Temporarily freeze new posts while keeping existing recipes
            readable.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          icon={PauseCircle}
          onClick={() => setConfirmPauseModal(true)}
          className="shrink-0 cursor-pointer"
        >
          {isPaused ? "Resume group" : "Pause group"}
        </Button>
      </div>

      {/* Archive / Delete Group */}
      {isOwner && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div>
            <p className="font-bold text-sm text-red-600 dark:text-red-400">
              Archive group
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Only the current group owner can archive this group and close new
              participation.
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            icon={AlertTriangle}
            onClick={() => setConfirmDeleteModal(true)}
            className="shrink-0 cursor-pointer"
          >
            Archive group
          </Button>
        </div>
      )}

      {/* Confirm Transfer Ownership Modal */}
      <Modal
        isOpen={confirmTransferModal}
        onClose={() => setConfirmTransferModal(false)}
        title="Transfer group ownership?"
        maxWidth="max-w-sm"
      >
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            <strong>{selectedCandidate?.user?.name || "This member"}</strong>{" "}
            will become the owner of <strong>{group.name}</strong> and receive
            full Admin control. You will remain an Admin unless you leave or
            are changed by the new owner.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={transferring}
              onClick={() => setConfirmTransferModal(false)}
            >
              Cancel
            </Button>
            <Button
              loading={transferring}
              onClick={handleTransferOwnership}
            >
              Confirm transfer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Pause / Resume Modal */}
      <Modal
        isOpen={confirmPauseModal}
        onClose={() => setConfirmPauseModal(false)}
        title={isPaused ? "Resume this group?" : "Pause this group?"}
        maxWidth="max-w-sm"
      >
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {isPaused
              ? "Members will be able to publish new posts again."
              : "While paused, members can still read existing posts but cannot publish new posts."}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={updatingLifecycle}
              onClick={() => setConfirmPauseModal(false)}
            >
              Cancel
            </Button>
            <Button
              loading={updatingLifecycle}
              onClick={() => handleLifecycle(isPaused ? "RESUME" : "PAUSE")}
            >
              {isPaused ? "Resume" : "Pause group"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Archive Modal */}
      <Modal
        isOpen={confirmDeleteModal}
        onClose={() => setConfirmDeleteModal(false)}
        title="Archive this group?"
        maxWidth="max-w-sm"
      >
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Archiving <strong>{group.name}</strong> removes it from active
            discovery and prevents new posts or membership changes.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={updatingLifecycle}
              onClick={() => setConfirmDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={X}
              loading={updatingLifecycle}
              onClick={() => handleLifecycle("ARCHIVE")}
            >
              Archive group
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OwnershipLifecycleCard;

