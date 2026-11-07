import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSession } from '../lib/auth-client';
import { useLanguage } from '../context/LanguageContext';
import SocialHeader from '../components/common/SocialHeader';
import LeftSidebar from '../components/LeftSidebar';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import {
  Users,
  Plus,
  Lock,
  Globe,
  Check,
  Shield,
  Search,
  Upload,
  X,
  Sparkles,
} from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GroupsPage = () => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const user = session?.user;

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'MY'
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create Group Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [privacy, setPrivacy] = useState('PUBLIC');
  const [requiresPostApproval, setRequiresPostApproval] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const requireAuth = () => {
    navigate('/login');
  };

  // Fetch groups
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'MY') params.set('myGroups', 'true');
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`${API_BASE}/api/group?${params.toString()}`, {
        credentials: 'include',
        headers: session?.session?.token
          ? { Authorization: `Bearer ${session.session.token}` }
          : {},
      });

      const json = await res.json();
      if (json.data) {
        setGroups(json.data);
      }
    } catch (err) {
      console.error('Failed to load groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [activeTab, session]);

  // Handle Join / Leave
  const handleJoin = async (group) => {
    if (!user) return requireAuth();

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
      fetchGroups();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  // Upload Cover Image to Cloudinary
  const handleCoverUpload = async (file) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (data.data?.url) {
        setCoverImage(data.data.url);
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message });
    } finally {
      setUploadingCover(false);
    }
  };

  // Create Group Submit
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!user) return requireAuth();

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          description,
          coverImage,
          privacy,
          requiresPostApproval,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create group');

      Swal.fire({
        icon: 'success',
        title: 'Group Created!',
        text: `${name} is ready.`,
        timer: 1500,
        showConfirmButton: false,
      });

      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
      setCoverImage('');
      fetchGroups();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      <SocialHeader />

      <div className="pt-14 w-full">
        <div className="flex justify-center">
          {/* Left Fixed Sidebar (Sticky on scroll) */}
          <aside className="hidden lg:block fixed top-14 left-0 bottom-0 w-[280px] xl:w-[320px] px-2 py-3 overflow-y-auto no-scrollbar z-30">
            <LeftSidebar />
          </aside>

          {/* Main Groups Area */}
          <main className="w-full lg:pl-[280px] xl:pl-[320px] max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Header Banner */}
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="text-[#e02f21]" />
                  <span>{t('groups')}</span>
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Connect with local cooks, join secret family recipe clubs, and exchange culinary tips.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => (user ? setIsCreateModalOpen(true) : requireAuth())}
              >
                {t('createGroup')}
              </Button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-3 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('ALL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'ALL'
                      ? 'bg-[#e02f21] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {t('discoverGroups')}
                </button>

                {user && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('MY')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === 'MY'
                        ? 'bg-[#e02f21] text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t('myGroups')}
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchGroups()}
                  placeholder="Search recipe groups..."
                  className="pl-9 pr-4 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs font-medium focus:bg-white dark:focus:bg-[#3a3b3c] focus:outline-none dark:text-white border border-transparent focus:border-red-300 w-full sm:w-64"
                />
              </div>
            </div>

            {/* Groups Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-[#242526] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse h-48"
                  />
                ))}
              </div>
            ) : groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((g) => {
                  const isJoined = g.myMembership?.isApproved;
                  const isPending = g.myMembership && !g.myMembership.isApproved;

                  return (
                    <div
                      key={g.id}
                      className="bg-white dark:bg-[#242526] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                    >
                      {/* Cover Photo */}
                      <div className="relative h-28 bg-gray-200 dark:bg-gray-800">
                        <img
                          src={
                            g.coverImage ||
                            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500'
                          }
                          alt={g.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 right-2.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                          {g.privacy === 'PRIVATE' ? (
                            <>
                              <Lock size={11} /> {t('privateGroup')}
                            </>
                          ) : (
                            <>
                              <Globe size={11} /> {t('publicGroup')}
                            </>
                          )}
                        </span>
                      </div>

                      {/* Info & Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <Link
                            to={`/group/${g.slug}`}
                            className="font-black text-sm text-gray-900 dark:text-white hover:text-[#e02f21] line-clamp-1"
                          >
                            {g.name}
                          </Link>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {g.memberCount || 1} {t('members')} • Created by {g.createdBy?.name}
                          </p>
                          {g.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                              {g.description}
                            </p>
                          )}
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                          <Link
                            to={`/group/${g.slug}`}
                            className="text-xs font-bold text-[#e02f21] hover:underline"
                          >
                            View Group
                          </Link>

                          {isJoined ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl flex items-center gap-1">
                              <Check size={14} /> {t('joined')}
                            </span>
                          ) : isPending ? (
                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl">
                              {t('requested')}
                            </span>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleJoin(g)}
                            >
                              {t('joinGroup')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 space-y-3">
                <Users size={32} className="mx-auto text-gray-300" />
                <h3 className="font-bold text-sm">No food groups found</h3>
                <p className="text-xs text-gray-400">
                  Be the first to create a recipe group and invite fellow foodies!
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal: Create Food Group */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-[500px] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 text-center">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                {t('createGroup')}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute right-3 top-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 text-gray-500 dark:text-gray-300 flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Traditional Bangladeshi Desi Curries"
                  className="w-full px-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none border border-transparent focus:border-red-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Tell people what recipes and tips to share in this group..."
                  className="w-full px-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none border border-transparent focus:border-red-300 resize-none"
                />
              </div>

              {/* Cover Photo */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Cover Photo
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://... or upload"
                    className="flex-1 px-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5">
                    {uploadingCover ? (
                      <span className="w-4 h-4 border-2 border-[#e02f21] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleCoverUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              {/* Privacy Radio */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Group Privacy
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      privacy === 'PUBLIC'
                        ? 'border-[#e02f21] bg-red-50/50 dark:bg-red-950/20 text-[#e02f21]'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="PUBLIC"
                      checked={privacy === 'PUBLIC'}
                      onChange={() => setPrivacy('PUBLIC')}
                      className="hidden"
                    />
                    <Globe size={18} />
                    <div>
                      <p className="font-bold text-xs">Public</p>
                      <p className="text-[10px] opacity-75">Anyone can see and join</p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                      privacy === 'PRIVATE'
                        ? 'border-[#e02f21] bg-red-50/50 dark:bg-red-950/20 text-[#e02f21]'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="PRIVATE"
                      checked={privacy === 'PRIVATE'}
                      onChange={() => setPrivacy('PRIVATE')}
                      className="hidden"
                    />
                    <Lock size={18} />
                    <div>
                      <p className="font-bold text-xs">Private</p>
                      <p className="text-[10px] opacity-75">Admin approves members</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Require Post Approval Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t('requiresPostApproval')}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Members' posts require approval before appearing on feed.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requiresPostApproval}
                  onChange={(e) => setRequiresPostApproval(e.target.checked)}
                  className="toggle toggle-error"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitting || uploadingCover}
                  variant="primary"
                  size="md"
                >
                  {t('createGroup')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
