import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../context/ToastContext";
import { groupsApi } from "../api/groups.api";

const GroupSettingsTab = ({ group, token, onGroupUpdated }) => {
  const { notify } = useToast();
  const [description, setDescription] = useState(group.description || "");
  const [requiresPostApproval, setRequiresPostApproval] = useState(
    group.requiresPostApproval || false,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await groupsApi.updateGroupSettings(
        group.slug || group.id,
        {
          description: description.trim(),
          requiresPostApproval,
        },
        token,
      );

      notify.success("Group settings updated");
      if (onGroupUpdated) onGroupUpdated();
    } catch (err: any) {
      notify.error(err.message || "Failed to update group settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
        Manage Group Settings
      </h3>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label
            htmlFor="group-description"
            className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
          >
            Group Description
          </label>
          <textarea
            id="group-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-3 bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-xl text-sm sm:text-base leading-relaxed dark:text-white focus:outline-none focus:border-[#e02f21] resize-y"
          />
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-[#3a3b3c]">
          <input
            type="checkbox"
            id="reqAppr"
            checked={requiresPostApproval}
            onChange={(e) => setRequiresPostApproval(e.target.checked)}
            className="w-4 h-4 mt-1 shrink-0 rounded text-[#e02f21] focus:ring-[#e02f21] accent-[#e02f21]"
          />
          <label
            htmlFor="reqAppr"
            className="text-sm leading-relaxed font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Require post approval from admin or moderator before appearing in
            group feed
          </label>
        </div>

        <Button
          type="submit"
          loading={saving}
          className="px-5 py-2.5 text-sm font-bold"
        >
          Save Settings
        </Button>
      </form>
    </div>
  );
};

export default GroupSettingsTab;
