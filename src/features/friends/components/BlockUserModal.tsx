import React from "react";
import { ShieldAlert } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
  loading?: boolean;
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
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
            <ShieldAlert size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Block {userName}?
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {userName} will no longer be able to:
            </p>
          </div>
        </div>

        {/* Bullet details */}
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3.5 space-y-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>See your posts, recipes, or view your profile</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Send you messages or start conversations</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 font-bold">•</span>
            <span>Find you in search or add you as a friend</span>
          </div>
          <div className="flex items-start gap-2 pt-1 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <span>If you are friends, blocking will also unfriend them.</span>
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
            Block
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BlockUserModal;
