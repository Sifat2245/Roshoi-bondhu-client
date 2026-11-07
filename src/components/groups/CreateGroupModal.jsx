import React, { useState } from 'react';
import { X, Lock, Globe, Upload } from 'lucide-react';
import Button from '../ui/Button';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CreateGroupModal = ({ isOpen, onClose, token, onGroupCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [privacy, setPrivacy] = useState('PUBLIC');
  const [requiresPostApproval, setRequiresPostApproval] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  if (!isOpen) return null;

  const handleUploadCover = async (file) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` },
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (data.data?.url) {
        setCoverImage(data.data.url);
      } else {
        throw new Error(data.message || 'Image upload failed');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          coverImage,
          privacy,
          requiresPostApproval,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create group');

      Swal.fire({
        icon: 'success',
        title: 'Group Created!',
        timer: 1400,
        showConfirmButton: false,
      });

      onGroupCreated();
      onClose();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-[500px] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Modal Header */}
        <div className="relative px-5 py-4 border-b border-gray-100 dark:border-gray-800 text-center">
          <h3 className="font-bold text-base text-gray-900 dark:text-white">Create Group</h3>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 text-gray-500 dark:text-gray-300 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
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
                  privacy === 'PUBLIC'
                    ? 'border-[#e02f21] bg-red-50/50 dark:bg-red-950/20 text-[#e02f21]'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Globe size={16} />
                <div className="text-left">
                  <p className="text-xs font-bold">Public</p>
                  <p className="text-[10px] opacity-75">Anyone can see and join</p>
                </div>
                <input
                  type="radio"
                  name="group-privacy"
                  value="PUBLIC"
                  checked={privacy === 'PUBLIC'}
                  onChange={() => setPrivacy('PUBLIC')}
                  className="hidden"
                />
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                  privacy === 'PRIVATE'
                    ? 'border-[#e02f21] bg-red-50/50 dark:bg-red-950/20 text-[#e02f21]'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
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
                  checked={privacy === 'PRIVATE'}
                  onChange={() => setPrivacy('PRIVATE')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Cover Photo */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Cover Photo
            </label>
            <label className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
              <Upload size={18} className="text-gray-400 mb-1" />
              <span className="text-xs font-semibold text-gray-500">
                {uploadingCover ? 'Uploading...' : coverImage ? 'Change Cover Photo' : 'Upload Cover Photo'}
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
      </div>
    </div>
  );
};

export default CreateGroupModal;

