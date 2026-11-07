import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import { useLanguage } from '../../context/LanguageContext';
import SocialHeader from '../../components/common/SocialHeader';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileNavTabs from '../../components/profile/ProfileNavTabs';
import ProfileIntroCard from '../../components/profile/ProfileIntroCard';
import CreatePostTrigger from '../../components/feed/CreatePostTrigger';
import PostCard from '../../components/feed/PostCard';
import EditProfileModal from '../../components/profile/EditProfileModal';
import CreatePostModal from '../../components/modals/CreatePostModal';
import PostDetailsModal from '../../components/modals/PostDetailsModal';
import { Utensils } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('POSTS'); // 'POSTS', 'RECIPES', 'PHOTOS', 'ABOUT', 'FOLLOWERS'
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState('CASUAL');
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  // Upload/Save states
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/post?authorId=${id}&limit=50`, {
        credentials: 'include',
        headers: session?.session?.token
          ? { Authorization: `Bearer ${session.session.token}` }
          : {},
      });
      const data = await res.json();
      if (data.data) {
        setPosts(data.data);
      }
    } catch (err) {
      console.error('Error fetching user posts:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [id, session]);

  const handleFollowToggle = async () => {
    if (!currentUser) return requireAuth();

    try {
      const res = await fetch(`${API_BASE}/api/user/${id}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.data.isFollowing);
        setFollowersCount((prev) => (data.data.isFollowing ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleUpdateCover = async (file) => {
    if (!file || !currentUser) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const upRes = await fetch(`${API_BASE}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
        credentials: 'include',
        body: formData,
      });
      const upData = await upRes.json();
      if (!upData.data?.url) throw new Error(upData.message || 'Cover upload failed');

      const updateRes = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({ coverImage: upData.data.url }),
      });

      if (updateRes.ok) {
        setProfile((prev) => ({ ...prev, coverImage: upData.data.url }));
        Swal.fire({ icon: 'success', title: 'Cover photo updated!', timer: 1200, showConfirmButton: false });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUpdateAvatar = async (file) => {
    if (!file || !currentUser) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const upRes = await fetch(`${API_BASE}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
        credentials: 'include',
        body: formData,
      });
      const upData = await upRes.json();
      if (!upData.data?.url) throw new Error(upData.message || 'Avatar upload failed');

      const updateRes = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({ image: upData.data.url }),
      });

      if (updateRes.ok) {
        setProfile((prev) => ({ ...prev, image: upData.data.url }));
        Swal.fire({ icon: 'success', title: 'Profile picture updated!', timer: 1200, showConfirmButton: false });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (formData, avatarFile) => {
    setSavingProfile(true);
    try {
      let imageUrl = profile.image;
      if (avatarFile) {
        const fData = new FormData();
        fData.append('image', avatarFile);
        const upRes = await fetch(`${API_BASE}/api/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
          credentials: 'include',
          body: fData,
        });
        const upData = await upRes.json();
        if (upData.data?.url) {
          imageUrl = upData.data.url;
        }
      }

      const res = await fetch(`${API_BASE}/api/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          bio: formData.bio,
          city: formData.city,
          work: formData.work,
          education: formData.education,
          phone: formData.phone,
          gender: formData.gender,
          image: imageUrl,
        }),
      });

      if (res.ok) {
        setProfile((prev) => ({
          ...prev,
          name: formData.name,
          username: formData.username,
          bio: formData.bio,
          city: formData.city,
          work: formData.work,
          education: formData.education,
          phone: formData.phone,
          gender: formData.gender,
          image: imageUrl,
        }));
        setIsEditModalOpen(false);
        Swal.fire({ icon: 'success', title: 'Profile Updated!', timer: 1200, showConfirmButton: false });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setSavingProfile(false);
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
      : activeTab === 'PHOTOS'
      ? posts.filter((p) => p.image)
      : posts;

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* 1. Fixed Topbar */}
      <SocialHeader
        onOpenCreatePost={() => {
          setCreateInitialMode('CASUAL');
          setIsCreatePostOpen(true);
        }}
      />

      {/* 2. Profile Page Body with pt-14 */}
      <div className="pt-14 w-full">
        {/* Profile Header Banner & Details */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          followersCount={followersCount}
          onFollowToggle={handleFollowToggle}
          onOpenEditModal={() => setIsEditModalOpen(true)}
          onOpenCreateRecipe={() => {
            setCreateInitialMode('RECIPE');
            setIsCreatePostOpen(true);
          }}
          onUpdateCover={handleUpdateCover}
          onUpdateAvatar={handleUpdateAvatar}
          uploadingCover={uploadingCover}
          uploadingAvatar={uploadingAvatar}
        />

        {/* Profile Sub Navigation Tabs */}
        <ProfileNavTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          postCount={posts.length}
        />

        {/* Main 2-Column Content Area */}
        <div className="max-w-[1150px] mx-auto px-4 sm:px-8 py-5">
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Left Column: Intro & Personal Details Card */}
            <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-18 self-start">
              <ProfileIntroCard
                profile={profile}
                isOwnProfile={isOwnProfile}
                onOpenEditModal={() => setIsEditModalOpen(true)}
              />
            </div>

            {/* Right Column: User Stream / Posts Feed */}
            <div className="flex-1 max-w-[720px] w-full mx-auto space-y-4">
              {/* "What's on your mind?" Create Post Trigger (if own profile) */}
              {isOwnProfile && (
                <CreatePostTrigger
                  onClick={(mode) => {
                    setCreateInitialMode(mode);
                    setIsCreatePostOpen(true);
                  }}
                  onRequireAuth={requireAuth}
                />
              )}

              {/* Posts Stream */}
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
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-800 space-y-2">
                  <Utensils size={28} className="mx-auto text-gray-400" />
                  <p className="text-xs text-gray-500 font-medium">No posts or recipes shared yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        saving={savingProfile}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        initialMode={createInitialMode}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={() => {
          fetchProfile();
          fetchUserPosts();
        }}
      />

      {/* Post Comments Details Modal */}
      {selectedPostForComments && (
        <PostDetailsModal
          isOpen={Boolean(selectedPostForComments)}
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          onPostUpdated={() => {
            fetchProfile();
            fetchUserPosts();
          }}
          onRequireAuth={requireAuth}
        />
      )}
    </div>
  );
};

export default UserProfilePage;

