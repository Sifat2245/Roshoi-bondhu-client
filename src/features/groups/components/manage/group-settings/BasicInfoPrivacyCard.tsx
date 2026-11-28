import React, { useEffect, useState } from "react";
import { Settings, Globe, Lock, Eye, EyeOff } from "lucide-react";
import Button from "../../../../../components/ui/Button";
import { useToast } from "../../../../../context/ToastContext";
import groupsApi from "../../../api/groups.api";

interface BasicInfoPrivacyCardProps {
  group: any;
  token?: string | null;
  onUpdated?: () => void;
}

export const BasicInfoPrivacyCard: React.FC<BasicInfoPrivacyCardProps> = ({
  group,
  token,
  onUpdated,
}) => {
  const { notify } = useToast();
  const [name, setName] = useState(group.name || "");
  const [description, setDescription] = useState(group.description || "");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "PRIVATE">(
    group.privacy === "PRIVATE" ? "PRIVATE" : "PUBLIC"
  );
  const [discoverability, setDiscoverability] = useState<"VISIBLE" | "HIDDEN">(
    group.discoverability === "HIDDEN" ? "HIDDEN" : "VISIBLE"
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(group.name || "");
    setDescription(group.description || "");
    setPrivacy(group.privacy === "PRIVATE" ? "PRIVATE" : "PUBLIC");
    setDiscoverability(
      group.discoverability === "HIDDEN" ? "HIDDEN" : "VISIBLE"
    );
  }, [group.id, group.name, group.description, group.privacy, group.discoverability]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      notify.error("Group name must be at least 2 characters.");
      return;
    }
    setSaving(true);
    try {
      await groupsApi.updateGroupSettings(
        group.id,
        {
          name: name.trim(),
          description: description.trim(),
          privacy,
          discoverability,
        },
        token || null
      );
      notify.success("Group details and privacy updated.");
      onUpdated?.();
    } catch (err: any) {
      notify.error(err?.message || "Failed to update group settings.");
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
        <Settings size={18} className="text-[#e02f21]" />
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">
          Basic information & privacy
        </h2>
      </div>

      <div>
        <label
          htmlFor="manage-group-name"
          className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Group name
        </label>
        <input
          id="manage-group-name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:outline-none focus:border-[#e02f21]"
        />
      </div>

      <div>
        <label
          htmlFor="manage-group-description"
          className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5"
        >
          Description
        </label>
        <textarea
          id="manage-group-description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3.5 py-3 bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-xl text-sm leading-relaxed dark:text-white focus:outline-none focus:border-[#e02f21] resize-y"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#3a3b3c] space-y-2">
          <label
            htmlFor="manage-group-privacy"
            className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"
          >
            {privacy === "PRIVATE" ? (
              <Lock size={15} className="text-[#e02f21]" />
            ) : (
              <Globe size={15} className="text-[#e02f21]" />
            )}
            <span>Privacy</span>
          </label>
          <select
            id="manage-group-privacy"
            value={privacy}
            onChange={(e) =>
              setPrivacy(e.target.value as "PUBLIC" | "PRIVATE")
            }
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 text-sm font-semibold dark:text-white"
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {privacy === "PUBLIC"
              ? "Anyone can see who is in the group and what they post."
              : "Only approved members can see members and posts."}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#3a3b3c] space-y-2">
          <label
            htmlFor="manage-group-discoverability"
            className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"
          >
            {discoverability === "VISIBLE" ? (
              <Eye size={15} className="text-[#e02f21]" />
            ) : (
              <EyeOff size={15} className="text-[#e02f21]" />
            )}
            <span>Hide group</span>
          </label>
          <select
            id="manage-group-discoverability"
            value={discoverability}
            onChange={(e) =>
              setDiscoverability(e.target.value as "VISIBLE" | "HIDDEN")
            }
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 text-sm font-semibold dark:text-white"
          >
            <option value="VISIBLE">Visible in search & discover</option>
            <option value="HIDDEN">Hidden (invite link only)</option>
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {discoverability === "VISIBLE"
              ? "Anyone can find this group."
              : "Only current members can find this group."}
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          loading={saving}
          className="px-6 py-2.5 text-sm font-bold cursor-pointer"
        >
          Save basic info
        </Button>
      </div>
    </form>
  );
};

export default BasicInfoPrivacyCard;

