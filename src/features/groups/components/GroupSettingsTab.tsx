import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';
import { groupsApi } from '../api/groups.api';

const GroupSettingsTab = ({ group, token, onGroupUpdated }) => {
  const { notify } = useToast();
  const [description, setDescription] = useState(group.description || '');
  const [requiresPostApproval, setRequiresPostApproval] = useState(
    group.requiresPostApproval || false
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await groupsApi.updateGroupSettings(
        group.id || group.slug,
        {
          description: description.trim(),
          requiresPostApproval,
        },
        token
      );

      notify.success('Group settings updated');
      if (onGroupUpdated) onGroupUpdated();
    } catch (err: any) {
      notify.error(err.message || 'Failed to update group settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
      <h3 className="font-bold text-base text-gray-900 dark:text-white">
        Manage Group Settings
      </h3>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Group Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white focus:outline-none focus:border-[#e02f21] resize-none"
          />
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#3a3b3c]">
          <input
            type="checkbox"
            id="reqAppr"
            checked={requiresPostApproval}
            onChange={(e) => setRequiresPostApproval(e.target.checked)}
            className="w-4 h-4 rounded text-[#e02f21] focus:ring-[#e02f21] accent-[#e02f21]"
          />
          <label htmlFor="reqAppr" className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            Require post approval from admin or moderator before appearing in group feed
          </label>
        </div>

        <Button type="submit" loading={saving} className="px-5 py-2.5 text-xs font-bold">
          Save Settings
        </Button>
      </form>
    </div>
  );
};

export default GroupSettingsTab;

