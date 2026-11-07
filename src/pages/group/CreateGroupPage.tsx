import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import { useToast } from '../../context/ToastContext';
import groupsApi from '../../features/groups/api/groups.api';
import Avatar from '../../components/ui/Avatar';
import {
  X,
  Globe,
  Lock,
  ChevronDown,
  Monitor,
  Smartphone,
  Plus,
  Users,
  Image as ImageIcon,
  Smile,
  Tag,
  Video,
} from 'lucide-react';

const SUGGESTED_FRIENDS = [
  'Umama Nammi',
  'Sadia Farheen',
  'Maksuda Sultana',
  'Tanvir Hasan',
  'Mohsin Islam',
  'Md Rezaul Korim',
];

const CreateGroupPage: React.FC = () => {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { notify } = useToast();
  const currentUser = session?.user;

  // Form states
  const [groupName, setGroupName] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [description, setDescription] = useState('');
  const [invitedFriends, setInvitedFriends] = useState<string[]>([]);
  const [friendInput, setFriendInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview Mode: 'DESKTOP' | 'MOBILE'
  const [previewMode, setPreviewMode] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');

  const handleAddFriend = (name: string) => {
    if (!invitedFriends.includes(name)) {
      setInvitedFriends([...invitedFriends, name]);
    }
  };

  const handleRemoveFriend = (name: string) => {
    setInvitedFriends(invitedFriends.filter((f) => f !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      notify.error('Please enter a group name');
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await groupsApi.createGroup(
        {
          name: groupName.trim(),
          description: description.trim() || `Welcome to ${groupName.trim()}! A community for passionate cooks and food lovers on Heshel.`,
          privacy,
        },
        session?.session?.token
      );

      notify.success('Group created successfully!');
      const slug = res?.data?.slug || groupName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      navigate(`/group/${slug}`);
    } catch (err: any) {
      notify.error(err.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      {/* LEFT COLUMN: Sidebar Form (Matching Image 3) */}
      <aside className="w-full md:w-[380px] lg:w-[420px] shrink-0 bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-gray-800 flex flex-col h-full shadow-lg z-20">
        {/* Top Header Row with Close & Heshel Logo */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/groups')}
              title="Close and return to groups"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-200 transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-[#e02f21] flex items-center justify-center text-white font-black text-xl shadow-xs">
                হ
              </span>
              <span className="font-black text-xl text-[#e02f21] tracking-tight">Heshel</span>
            </Link>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Breadcrumb & Title */}
          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold mb-1.5">
              <Link to="/groups" className="hover:underline">Groups</Link>
              <span>›</span>
              <span className="text-gray-700 dark:text-gray-300">Create group</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Create group
            </h1>
          </div>

          {/* User Profile Row (Admin) */}
          <div className="flex items-center gap-3.5">
            <Avatar src={currentUser?.image} alt={currentUser?.name} size="md" />
            <div>
              <p className="font-bold text-base text-gray-900 dark:text-white leading-snug">
                {currentUser?.name || 'Chef Sifat'}
              </p>
              <p className="text-sm text-gray-500 font-medium">Admin</p>
            </div>
          </div>

          {/* Field 1: Group Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
              Group name
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Secret Grandma Recipes, Bengali Sweet Tooth"
              className="w-full px-4 py-3.5 bg-white dark:bg-[#18191a] border border-gray-300 dark:border-gray-700 rounded-xl text-sm sm:text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e02f21] transition"
            />
          </div>

          {/* Field 2: Privacy Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
              Choose privacy
            </label>
            <div className="relative">
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value as 'PUBLIC' | 'PRIVATE')}
                className="w-full appearance-none px-4 py-3.5 bg-white dark:bg-[#18191a] border border-gray-300 dark:border-gray-700 rounded-xl text-sm sm:text-base font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e02f21] pr-10 cursor-pointer transition"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
              <ChevronDown
                size={20}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 pt-1 leading-normal">
              {privacy === 'PUBLIC'
                ? 'Anyone can see who is in the group and what they post.'
                : 'Only members can see who is in the group and what they post.'}
            </p>
          </div>

          {/* Field 3: Invite Friends */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-800 dark:text-gray-200">
              Invite friends (optional)
            </label>
            <input
              type="text"
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
              placeholder="Type a friend's name to invite..."
              className="w-full px-4 py-3.5 bg-white dark:bg-[#18191a] border border-gray-300 dark:border-gray-700 rounded-xl text-sm sm:text-base text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e02f21] transition"
            />

            {/* Selected Friend Chips */}
            {invitedFriends.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {invitedFriends.map((friend) => (
                  <span
                    key={friend}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-[#e02f21] text-sm font-bold rounded-lg"
                  >
                    <span>{friend}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(friend)}
                      className="hover:text-red-800 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Friends */}
            <div className="pt-2">
              <p className="text-xs sm:text-sm text-gray-400 font-semibold mb-2">Suggested:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_FRIENDS.filter((f) => !invitedFriends.includes(f)).map((friend) => (
                  <button
                    key={friend}
                    type="button"
                    onClick={() => handleAddFriend(friend)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>{friend}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Fixed Bottom Action Button */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#242526]">
          <button
            type="button"
            disabled={!groupName.trim() || isSubmitting}
            onClick={handleSubmit}
            className="w-full py-4 bg-[#e02f21] hover:bg-[#c92518] text-white font-black text-base rounded-xl transition cursor-pointer disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            {isSubmitting ? 'Creating group...' : 'Create'}
          </button>
        </div>
      </aside>

      {/* RIGHT COLUMN: Interactive Live Preview (Matching Image 3) */}
      <main className="flex-1 bg-[#f0f2f5] dark:bg-[#18191a] h-full overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
        {/* Device Switcher Header */}
        <div className="w-full max-w-[940px] flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            {previewMode === 'DESKTOP' ? 'Desktop Preview' : 'Mobile Preview'}
          </p>
          <div className="flex items-center gap-1 bg-white dark:bg-[#242526] p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xs">
            <button
              type="button"
              onClick={() => setPreviewMode('DESKTOP')}
              title="Desktop preview"
              className={`p-2 rounded-lg transition cursor-pointer ${
                previewMode === 'DESKTOP'
                  ? 'bg-red-50 dark:bg-red-950/40 text-[#e02f21]'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              <Monitor size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('MOBILE')}
              title="Mobile preview"
              className={`p-2 rounded-lg transition cursor-pointer ${
                previewMode === 'MOBILE'
                  ? 'bg-red-50 dark:bg-red-950/40 text-[#e02f21]'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              <Smartphone size={18} />
            </button>
          </div>
        </div>

        {/* Live Mock Frame */}
        <div
          className={`w-full transition-all duration-300 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden ${
            previewMode === 'DESKTOP'
              ? 'max-w-[940px]'
              : 'max-w-[420px] ring-8 ring-gray-900/10 dark:ring-white/10 my-4'
          }`}
        >
          {/* Cover Art Banner (Matching illustration style in Image 3) */}
          <div className="relative h-56 sm:h-72 w-full bg-gradient-to-tr from-gray-100 via-red-50 to-orange-50 dark:from-gray-800 dark:via-gray-900 dark:to-black overflow-hidden flex items-center justify-center">
            {/* Illustrated Community Graphics */}
            <div className="absolute inset-0 opacity-80 flex items-center justify-center">
              <svg
                viewBox="0 0 800 400"
                className="w-full h-full object-cover"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="200" cy="200" r="160" fill="#e02f21" fillOpacity="0.08" />
                <circle cx="600" cy="180" r="140" fill="#e02f21" fillOpacity="0.06" />
                <path
                  d="M100 350C250 280 350 320 500 290C650 260 750 350 800 360V400H100V350Z"
                  fill="#e02f21"
                  fillOpacity="0.12"
                />
              </svg>
            </div>

            <div className="relative z-10 text-center px-4 space-y-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/90 dark:bg-[#242526]/90 shadow-md backdrop-blur-xs flex items-center justify-center mx-auto text-[#e02f21]">
                <Users size={36} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">
                Group cover preview
              </p>
            </div>
          </div>

          {/* Group Header Info */}
          <div className="p-5 sm:p-7 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight break-words">
              {groupName.trim() || 'Group name'}
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-semibold mt-1">
              <span className="flex items-center gap-1">
                {privacy === 'PUBLIC' ? <Globe size={14} /> : <Lock size={14} />}
                <span>{privacy === 'PUBLIC' ? 'Public group' : 'Private group'}</span>
              </span>
              <span>•</span>
              <span>1 member</span>
            </div>
          </div>

          {/* Mock Navigation Tabs */}
          <div className="px-5 sm:px-7 border-b border-gray-100 dark:border-gray-800 flex items-center gap-6 text-sm font-bold text-gray-500 overflow-x-auto no-scrollbar">
            <span className="py-3.5 border-b-3 border-[#e02f21] text-[#e02f21]">About</span>
            <span className="py-3.5">Posts</span>
            <span className="py-3.5">Members</span>
            <span className="py-3.5">Events</span>
          </div>

          {/* Mock Content Columns */}
          <div className="p-5 sm:p-7 bg-[#f0f2f5]/40 dark:bg-[#18191a]/40 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left 2 Cols: Mock Post Trigger */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar src={currentUser?.image} alt="" size="sm" />
                  <div className="flex-1 bg-gray-100 dark:bg-[#3a3b3c] text-gray-400 rounded-full px-4 py-2 text-xs font-medium cursor-not-allowed">
                    What's on your mind?
                  </div>
                </div>
                <div className="flex items-center justify-around pt-2 border-t border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1.5 opacity-60">
                    <Video size={16} className="text-red-500" /> Live video
                  </span>
                  <span className="flex items-center gap-1.5 opacity-60">
                    <ImageIcon size={16} className="text-green-500" /> Photo/video
                  </span>
                  <span className="flex items-center gap-1.5 opacity-60">
                    <Smile size={16} className="text-amber-500" /> Feeling/activity
                  </span>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Mock About Box */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">About</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {privacy === 'PUBLIC'
                    ? 'Anyone can see who is in the group and what they post.'
                    : 'Only members can see who is in the group and what they post.'}
                </p>
                <div className="pt-2 text-xs font-semibold text-gray-600 dark:text-gray-300 space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe size={15} />
                    <span>Public</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={15} />
                    <span>General group</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateGroupPage;

