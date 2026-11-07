import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useSession } from '../lib/auth-client';
import { useLanguage } from '../context/LanguageContext';
import SocialHeader from '../components/common/SocialHeader';
import LeftSidebar from '../components/LeftSidebar';
import PostCard from '../components/feed/PostCard';
import PostDetailsModal from '../components/modals/PostDetailsModal';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import {
  User as UserIcon,
  ChefHat,
  Users,
  Utensils,
  Calendar,
  Check,
  Plus,
  Edit3,
  X,
} from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserProfilePage = () => {
  const { id } = useParams();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const currentUser = session?.user;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Modals state
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  // Edit Bio modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [savingBio, setSavingBio] = useState(false);

  const requireAuth = () => {
    navigate('/login');
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/${id}`, {
        credentials: 'include',
        headers: session?.session?.token
          ? { Authorization: `Bearer ${session.session.token}` }
          : {},
      });
      const data = await res.json();
      if (data.data) {
        setProfile(data.data);
        setIsFollowing(data.data.isFollowing);
        setFollowersCount(data.data.followersCount || 0);
        setBioInput(data.data.bio || '');

        // Fetch User's Posts
        const postsRes = await fetch(`${API_BASE}/api/post?authorId=${data.data.id}`, {
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
    fetchProfile();
  }, [id, session]);

  // Toggle Follow
  const handleFollowToggle = async () => {
    if (!currentUser) return requireAuth();

    try {
      const res = await fetch(`${API_BASE}/api/user/${id}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.data) {
        setIsFollowing(data.data.following);
        setFollowersCount(data.data.followersCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Bio
  const handleSaveBio = async (e) => {
    e.preventDefault();
    setSavingBio(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/bio`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({ bio: bioInput }),
      });
      if (res.ok) {
        setProfile((prev) => ({ ...prev, bio: bioInput }));
        setIsEditOpen(false);
        Swal.fire({ icon: 'success', title: 'Bio Updated!', timer: 1500, showConfirmButton: false });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setSavingBio(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] flex items-center justify-center">
        <span className="w-8 h-8 border-3 border-[#e02f21] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-center py-24">
        <h2 className="text-xl font-bold">User not found</h2>
        <Link to="/" className="text-[#e02f21] hover:underline mt-2 inline-block">
          Return to Feed
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const filteredPosts =
    activeTab === 'RECIPES'
      ? posts.filter((p) => p.postType === 'RECIPE')
      : activeTab === 'CASUAL'
      ? posts.filter((p) => p.postType === 'CASUAL')
      : posts;

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      <SocialHeader />

      <div className="pt-14 w-full">
        <div className="flex justify-center">
          {/* Left Fixed Sidebar (Sticky on scroll) */}
          <aside className="hidden lg:block fixed top-14 left-0 bottom-0 w-[280px] xl:w-[320px] px-2 py-3 overflow-y-auto no-scrollbar z-30">
            <LeftSidebar />
          </aside>

          <main className="w-full lg:pl-[280px] xl:pl-[320px] max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Facebook Profile Banner & Info */}
            <div className="bg-white dark:bg-[#242526] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xs">
              <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-600 relative">
                <div className="absolute inset-0 bg-black/10"></div>
              </div>

              <div className="px-6 pb-6 pt-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="relative">
                      <img
                        src={
                          profile.image ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                        }
                        alt={profile.name}
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-white dark:ring-[#242526] shadow-md bg-white"
                      />
                      {profile.role && profile.role !== 'USER' && (
                        <span className="absolute bottom-1 right-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#e02f21] text-white ring-2 ring-white">
                          {profile.role}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 sm:mt-0">
                      <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {profile.name}
                      </h1>
                      <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300 mt-2 font-semibold">
                        <span>
                          <strong className="text-gray-900 dark:text-white">{followersCount}</strong> Followers
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="text-gray-900 dark:text-white">
                            {profile.followingCount || 0}
                          </strong> Following
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isOwnProfile ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit3}
                        onClick={() => setIsEditOpen(true)}
                      >
                        Edit Bio
                      </Button>
                    ) : (
                      <Button
                        variant={isFollowing ? 'secondary' : 'primary'}
                        size="sm"
                        icon={isFollowing ? Check : Plus}
                        onClick={handleFollowToggle}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Bio text */}
                {profile.bio && (
                  <p className="mt-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed">
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Sub-Tabs Line */}
              <div className="flex items-center gap-2 px-6 border-t border-gray-100 dark:border-gray-800 overflow-x-auto text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('ALL')}
                  className={`py-3.5 px-4 border-b-2 transition cursor-pointer ${
                    activeTab === 'ALL'
                      ? 'border-[#e02f21] text-[#e02f21]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All Posts ({posts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('RECIPES')}
                  className={`py-3.5 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'RECIPES'
                      ? 'border-[#e02f21] text-[#e02f21]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ChefHat size={14} />
                  <span>Recipes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('CASUAL')}
                  className={`py-3.5 px-4 border-b-2 transition cursor-pointer ${
                    activeTab === 'CASUAL'
                      ? 'border-[#e02f21] text-[#e02f21]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Foodie Posts
                </button>
              </div>
            </div>

            {/* User Posts Stream (max-w-[620px] centered) */}
            <div className="max-w-[620px] mx-auto space-y-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onOpenComments={(selected) => setSelectedPostForComments(selected)}
                    onOpenShare={() => {}}
                    onRequireAuth={requireAuth}
                  />
                ))
              ) : (
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400">No posts shared yet by this cook.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Edit Bio Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Edit your foodie bio</h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-black cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveBio} className="space-y-4">
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                rows={3}
                placeholder="Share your favorite cuisines, culinary specialties..."
                className="w-full p-3 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={savingBio} variant="primary" size="sm">
                  Save Bio
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Details Modal */}
      {selectedPostForComments && (
        <PostDetailsModal
          isOpen={Boolean(selectedPostForComments)}
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          onPostUpdated={fetchProfile}
          onRequireAuth={requireAuth}
        />
      )}
    </div>
  );
};

export default UserProfilePage;
