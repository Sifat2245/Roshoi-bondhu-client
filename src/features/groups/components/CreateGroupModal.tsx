import React, { useState } from "react";
import { Lock, Globe, Upload } from "lucide-react";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import groupsApi from "../api/groups.api";
import postsApi from "../../posts/api/posts.api";
import { useToast } from "../../../context/ToastContext";

const CreateGroupModal = ({ isOpen, onClose, token, onGroupCreated }) => {
  const { notify } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [privacy, setPrivacy] = useState("PUBLIC");
  const [requiresPostApproval, setRequiresPostApproval] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  if (!isOpen) return null;

  const handleUploadCover = async (file) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const data = await postsApi.uploadImage(file, token);
      if (data.data?.url) {
        setCoverImage(data.data.url);
      } else {
        throw new Error(data.message || "Image upload failed");
      }
    } catch (err) {
      notify.error(err.message, "Upload Failed");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await groupsApi.createGroup(
        {
          name: name.trim(),
          description: description.trim(),
          coverImage,
          privacy,
          requiresPostApproval,
        },
        token,
      );

      notify.success(`Group "${name}" has been created!`, "Group Created");
      if (onGroupCreated) onGroupCreated();
      onClose();
    } catch (err) {
      notify.error(err.message, "Creation Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Group"
      maxWidth="max-w-[500px]"
    >
      <form onSubmit={handleCreate} className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Group Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dhaka Street Food Lovers"
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white focus:outline-none focus:border-[#e02f21]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this foodie community about?"
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white focus:outline-none focus:border-[#e02f21] resize-none"
          />
        </div>

        {/* Privacy Select */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
            Choose Privacy
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <label
              className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                privacy === "PUBLIC"
                  ? "border-[#e02f21] bg-red-50/50 dark:bg-red-950/20 text-[#e02f21]"
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <Globe size={16} />
              <div className="text-left">
                <p className="text-xs font-bold">Public</p>
                <p className="text-[10px] opacity-75">
                  Anyone can see and join
                </p>
              </div>
              <input
                type="radio"
                name="group-privacy"
                value="PUBLIC"
                checked={privacy === "PUBLIC"}
                onChange={() => setPrivacy("PUBLIC")}
                className="hidden"
              />
            </label>

            <label
              className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                privacy === "PRIVATE"
                  ? "border-[#e02f21] bg-red-50/50 dark:bg-red-950/20 text-[#e02f21]"
                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <Lock size={16} />
              <div className="text-left">
                <p className="text-xs font-bold">Private</p>
                <p className="text-[10px] opacity-75">Only members see posts</p>
              </div>
              <input
                type="radio"
                name="group-privacy"
                value="PRIVATE"
                checked={privacy === "PRIVATE"}
                onChange={() => setPrivacy("PRIVATE")}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Post approval toggle */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#3a3b3c]">
          <input
            type="checkbox"
            id="create-req-appr"
            checked={requiresPostApproval}
            onChange={(e) => setRequiresPostApproval(e.target.checked)}
            className="w-4 h-4 rounded text-[#e02f21] accent-[#e02f21]"
          />
          <label
            htmlFor="create-req-appr"
            className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Require post approval from admin/moderator
          </label>
        </div>

        {/* Cover Photo */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Cover Photo
          </label>
          <label className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
            <Upload size={18} className="text-gray-400 mb-1" />
            <span className="text-xs font-semibold text-gray-500">
              {uploadingCover
                ? "Uploading..."
                : coverImage
                  ? "Change Cover Photo"
                  : "Upload Cover Photo"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUploadCover(e.target.files?.[0])}
            />
          </label>
        </div>

        <Button
          type="submit"
          loading={submitting || uploadingCover}
          disabled={!name.trim()}
          className="w-full py-2.5 text-xs font-bold"
        >
          Create Group
        </Button>
      </form>
    </Modal>
  );
};

export default CreateGroupModal;
