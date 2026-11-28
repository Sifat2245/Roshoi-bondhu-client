import React, { useState } from "react";
import { Check } from "lucide-react";
import Modal from "../../../../../components/ui/Modal";
import Button from "../../../../../components/ui/Button";

interface AddGroupRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, body: string) => void;
}

export const AddGroupRuleModal: React.FC<AddGroupRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSave(title.trim(), body.trim());
    setTitle("");
    setBody("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add group rule" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
            Rule title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. No spam or self-promotion"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#3a3b3c] text-sm dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
            Details
          </label>
          <textarea
            rows={3}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Explain what members should follow..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#3a3b3c] text-sm dark:text-white resize-y"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={Check}>
            Save rule
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGroupRuleModal;

