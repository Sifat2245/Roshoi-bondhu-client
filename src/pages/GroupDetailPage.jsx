import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useSession } from '../lib/auth-client';
import { useLanguage } from '../context/LanguageContext';
import SocialHeader from '../components/common/SocialHeader';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import CreatePostTrigger from '../components/feed/CreatePostTrigger';
import PostCard from '../components/feed/PostCard';
import CreatePostModal from '../components/modals/CreatePostModal';
import PostDetailsModal from '../components/modals/PostDetailsModal';
import {
  Users,
  Lock,
  Globe,
  Eye,
  Shield,
  Check,
  UserPlus,
  Share2,
  MoreHorizontal,
  Settings,
  Search,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GroupDetailPage = () => {
  const { slug } = useParams();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const user = session?.user;

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DISCUSSION'); // 'DISCUSSION', 'ABOUT', 'MEMBERS', 'SETTINGS'

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState('CASUAL');
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  // Group Admin Settings
  const [reqApproval, setReqApproval] = useState(false);
  const [description, setDescription] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const requireAuth = () => {
    navigate('/login');
  };

  // Fetch Group Info & Feed
  const fetchGroupData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/group/${slug}`, {
        credentials: 'include',
        headers: session?.session?.token
          ? { Authorization: `Bearer ${session.session.token}` }
          : {},
      });
      const data = await res.json();
      if (data.data) {
        setGroup(data.data);
        setReqApproval(data.data.requiresPostApproval || false);
        setDescription(data.data.description || '');

        // Fetch Group Feed
        const postsRes = await fetch(`${API_BASE}/api/post?groupId=${data.data.id}`, {
          credentials: 'include',
          headers: session?.session?.token
            ? { Authorization: `Bearer ${session.session.token}` }
            : {},
        });
        const postsJson = await postsRes.json();
        if (postsJson.data) {
          setPosts(postsJson.data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [slug, session]);

  // Join or Request Group Membership
  const handleJoin = async () => {
    if (!user) return requireAuth();
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/group/${group.id}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
        credentials: 'include',
      });
      const data = await res.json();
      Swal.fire({
        icon: 'success',
        title: group.privacy === 'PUBLIC' ? 'Joined!' : 'Requested!',
        text: data.message,
        timer: 1500,
        showConfirmButton: false,
      });
      fetchGroupData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Leave Group
  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await fetch(`${API_BASE}/api/group/${group.id}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
        credentials: 'include',
      });
      Swal.fire({ icon: 'info', title: 'Left Group', timer: 1500, showConfirmButton: false });
      fetchGroupData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Share Group link
  const handleShareGroup = () => {
    navigator.clipboard.writeText(window.location.href);
    Swal.fire({
      icon: 'success',
      title: 'Link Copied!',
      text: 'Group link copied to clipboard.',
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Save Settings (Group Admin)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await fetch(`${API_BASE}/api/group/${group.id}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          description,
          requiresPostApproval: reqApproval,
        }),
      });
      Swal.fire({ icon: 'success', title: 'Settings Saved', timer: 1500, showConfirmButton: false });
      fetchGroupData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading && !group) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] flex items-center justify-center">
        <span className="w-8 h-8 border-3 border-[#e02f21] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-center py-24">
        <h2 className="text-xl font-bold">Group not found</h2>
        <Link to="/groups" className="text-[#e02f21] hover:underline mt-2 inline-block">
          Back to Groups
        </Link>
      </div>
    );
  }

  const isJoined = group.myMembership?.isApproved;
  const isPending = group.myMembership && !group.myMembership.isApproved;
  const isGroupAdmin = group.myMembership?.role === 'ADMIN';
  const isGroupMod = group.myMembership?.role === 'MODERATOR';
  const canModerate = group.canModerate;

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Top Header */}
      <SocialHeader onOpenCreatePost={() => {
        setCreateInitialMode('CASUAL');
        setIsCreateOpen(true);
      }} />

      {/* Main Container with pt-14 for fixed header */}
      <div className="pt-14 w-full">
        {/* Group Banner Container (Facebook Group Layout Matching Image 4) */}
        <div className="w-full bg-white dark:bg-[#242526] shadow-xs border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1200px] mx-auto">
          {/* Cover Photo */}
          <div className="relative h-56 sm:h-80 md:h-96 w-full overflow-hidden sm:rounded-b-2xl bg-gray-200 dark:bg-gray-800">
            <img
              src={
                group.coverImage ||
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400'
              }
              alt={group.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Group Header Info Row */}
          <div className="px-4 sm:px-8 pt-5 pb-3">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  {group.name}
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                  {group.privacy === 'PRIVATE' ? (
                    <span className="flex items-center gap-1 font-semibold">
                      <Lock size={14} /> Private group
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-semibold">
                      <Globe size={14} /> Public group
                    </span>
                  )}
                  <span>•</span>
                  <span>{group.memberCount} members</span>
                </div>

                {/* Overlapping Member Avatars (Matching Image 4) */}
                <div className="flex items-center -space-x-2 overflow-hidden mt-3">
                  {group.members && group.members.length > 0 ? (
                    group.members.slice(0, 8).map((m, idx) => (
                      <div key={idx} className="relative inline-block ring-2 ring-white dark:ring-[#242526] rounded-full">
                        <Avatar src={m.user?.image} alt={m.user?.name} size="sm" />
                      </div>
                    ))
                  ) : (
                    <Avatar src={group.createdBy?.image} alt={group.createdBy?.name} size="sm" />
                  )}
                </div>
              </div>

              {/* Action Buttons (Matching Image 4: + Invite, Share, Joined ▾) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  icon={UserPlus}
                  onClick={handleShareGroup}
                >
                  Invite
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Share2}
                  onClick={handleShareGroup}
                >
                  Share
                </Button>

                {isJoined ? (
                  <div className="dropdown dropdown-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={actionLoading}
                      tabIndex={0}
                    >
                      <span>Joined</span>
                      <ChevronDown size={14} />
                    </Button>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow-xl bg-white dark:bg-[#242526] rounded-2xl w-48 border border-gray-100 dark:border-gray-800 z-30">
                      <li>
                        <button type="button" onClick={handleLeave} className="text-red-500 font-bold text-xs py-2">
                          Leave group
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : isPending ? (
                  <span className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 font-bold text-xs rounded-xl">
                    Requested
                  </span>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    loading={actionLoading}
                    onClick={handleJoin}
                  >
                    Join group
                  </Button>
                )}
              </div>
            </div>

            {/* Sub-Navigation Tabs Line (Matching Image 4: About, Discussion, Members, Settings) */}
            <div className="flex items-center gap-1 sm:gap-2 mt-5 pt-2 border-t border-gray-200 dark:border-gray-800 overflow-x-auto text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400">
              <button
                type="button"
                onClick={() => setActiveTab('DISCUSSION')}
                className={`py-3 px-3 sm:px-4 border-b-3 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'DISCUSSION'
                    ? 'border-[#e02f21] text-[#e02f21]'
                    : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg'
                }`}
              >
                Discussion
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ABOUT')}
                className={`py-3 px-3 sm:px-4 border-b-3 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'ABOUT'
                    ? 'border-[#e02f21] text-[#e02f21]'
                    : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg'
                }`}
              >
                About
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('MEMBERS')}
                className={`py-3 px-3 sm:px-4 border-b-3 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'MEMBERS'
                    ? 'border-[#e02f21] text-[#e02f21]'
                    : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-lg'
                }`}
              >
                Members ({group.memberCount})
              </button>

              {canModerate && (
                <button
                  type="button"
                  onClick={() => setActiveTab('SETTINGS')}
                  className={`py-3 px-3 sm:px-4 border-b-3 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'SETTINGS'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-t-lg'
                  }`}
                >
                  <Settings size={15} />
                  <span>Admin Settings</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area (Matching Image 4 2-Column Discussion) */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-5">
        {activeTab === 'DISCUSSION' && (
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Left Column: Feed (max-w-[640px] flex-1) */}
            <div className="flex-1 max-w-[640px] w-full mx-auto space-y-4">
              {/* Trigger "Write something..." */}
              {isJoined ? (
                <CreatePostTrigger
                  onClick={(mode) => {
                    setCreateInitialMode(mode);
                    setIsCreateOpen(true);
                  }}
                  onRequireAuth={requireAuth}
                />
              ) : (
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 text-center border border-gray-100 dark:border-gray-800 shadow-xs">
                  <p className="text-xs text-gray-500 font-medium">
                    Join <strong>{group.name}</strong> to post recipes and share photos inside this community.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={actionLoading}
                    onClick={handleJoin}
                    className="mt-3"
                  >
                    Join group
                  </Button>
                </div>
              )}

              {/* Group Posts Stream */}
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onOpenComments={(selected) => setSelectedPostForComments(selected)}
                    onOpenShare={handleShareGroup}
                    onRequireAuth={requireAuth}
                  />
                ))
              ) : (
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400">No posts in this group yet. Be the first to post!</p>
                </div>
              )}
            </div>

            {/* Right Column: "About" Card (Matching Image 4 - Sticky on Scroll) */}
            <div className="w-full lg:w-[360px] shrink-0 space-y-4 lg:sticky lg:top-18 self-start">
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-gray-900 dark:text-white">About</h3>

                {/* Privacy Badge */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-gray-500">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                      {group.privacy === 'PRIVATE' ? 'Private' : 'Public'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {group.privacy === 'PRIVATE'
                        ? "Only members can see who's in the group and what they post."
                        : 'Anyone can see who is in the group and what they post.'}
                    </p>
                  </div>
                </div>

                {/* Visibility Badge */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-gray-500">
                    <Eye size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white">Visible</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      Anyone can find this group and preview basic information.
                    </p>
                  </div>
                </div>

                {/* Description */}
                {group.description && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {group.description}
                    </p>
                  </div>
                )}

                {/* Creator info */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <Avatar src={group.createdBy?.image} alt={group.createdBy?.name} size="sm" />
                  <div>
                    <p className="text-xs text-gray-400">Created by</p>
                    <Link
                      to={`/profile/${group.createdBy?.id}`}
                      className="text-xs font-bold text-gray-900 dark:text-white hover:underline"
                    >
                      {group.createdBy?.name}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: About */}
        {activeTab === 'ABOUT' && (
          <div className="max-w-[720px] mx-auto bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">About this group</h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {group.description || 'No detailed description provided.'}
            </p>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2 text-xs text-gray-500">
              <p>• Group created on {new Date(group.createdAt).toLocaleDateString()}</p>
              <p>• {group.memberCount} members currently active</p>
              <p>• Admin post approval: {group.requiresPostApproval ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
        )}

        {/* Tab: Members Directory */}
        {activeTab === 'MEMBERS' && (
          <div className="max-w-[900px] mx-auto bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="text-base font-black text-gray-900 dark:text-white">Group Members</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {group.members?.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl flex items-center gap-3"
                >
                  <Avatar src={m.user?.image} alt={m.user?.name} size="sm" />
                  <div className="truncate">
                    <Link
                      to={`/profile/${m.user?.id}`}
                      className="font-bold text-xs hover:underline truncate block"
                    >
                      {m.user?.name}
                    </Link>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">
                      {m.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Group Admin Settings */}
        {activeTab === 'SETTINGS' && canModerate && (
          <div className="max-w-[640px] mx-auto bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <Settings size={20} className="text-[#e02f21]" />
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Group Configuration
              </h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Group Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-[#f0f2f5] dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Require Admin Approval for Posts
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    When enabled, member posts remain pending until approved by a group admin.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={reqApproval}
                  onChange={(e) => setReqApproval(e.target.checked)}
                  className="toggle toggle-error"
                />
              </div>

              <Button
                type="submit"
                loading={savingSettings}
                variant="primary"
                size="md"
                className="w-full"
              >
                Save Group Settings
              </Button>
            </form>
          </div>
        )}
      </div>
      </div>

      {/* Modal: Create Post in Group */}
      <CreatePostModal
        isOpen={isCreateOpen}
        initialMode={createInitialMode}
        defaultGroupId={group.id}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={fetchGroupData}
      />

      {/* Modal: Post Comments */}
      {selectedPostForComments && (
        <PostDetailsModal
          isOpen={Boolean(selectedPostForComments)}
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          onPostUpdated={fetchGroupData}
          onRequireAuth={requireAuth}
        />
      )}
    </div>
  );
};

export default GroupDetailPage;
