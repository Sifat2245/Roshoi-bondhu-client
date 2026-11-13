import React from "react";
import { UserX } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";

interface UnfriendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
  loading?: boolean;
}

export const UnfriendUserModal: React.FC<UnfriendUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName = "this user",
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-md"
      className="p-0 overflow-hidden"
    >
      <div className="p-6 space-y-4">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <UserX size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Unfriend {userName}?
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Are you sure you want to remove <strong className="text-gray-800 dark:text-gray-200">{userName}</strong> as your friend? They will be removed from your friends list and you won't see their friends-only posts.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 font-bold text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
            className="rounded-xl px-5 py-2.5 font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-xs"
          >
            Unfriend
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UnfriendUserModal;
