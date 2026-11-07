import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Utensils } from 'lucide-react';
import { useSession } from '../../lib/auth-client';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import ProfileHeader from '../../features/profile/components/ProfileHeader';
import ProfileNavTabs from '../../features/profile/components/ProfileNavTabs';
import ProfileIntroCard from '../../features/profile/components/ProfileIntroCard';
import CreatePostTrigger from '../../features/posts/components/CreatePostTrigger';
import PostCard from '../../features/posts/components/PostCard';
import EditProfileModal from '../../features/profile/components/EditProfileModal';
import CreatePostModal from '../../features/posts/components/CreatePostModal';
import PostDetailsModal from '../../features/posts/components/PostDetailsModal';
import {
  ProfileHeaderSkeleton,
  ProfileIntroSkeleton,
  PostSkeleton,
} from '../../components/ui/Skeleton';
import { useToast } from '../../context/ToastContext';
import { profileApi } from '../../features/profile/api/profile.api';
import { postsApi } from '../../features/posts/api/posts.api';

const UserProfilePage = () => {
  const { id } = useParams();
  const { data: session } = useSession();
  const { notify } = useToast();
  const navigate = useNavigate();
  const currentUser = session?.user;
  const token = session?.session?.token;
  const targetId = id || currentUser?.id || 'me';

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

  const fetchProfile = useCallback(async (uid = targetId) => {
    setLoading(true);
    try {
      const data = await profileApi.getUserProfile(uid, token);
      if (data) {
        setProfile(data);
        setIsFollowing(data.isFollowing);
        setFollowersCount(data.followersCount || 0);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [targetId, token]);

  const fetchUserPosts = useCallback(async (uid = targetId) => {
    try {
      const authorQuery = uid === 'me' && currentUser?.id ? currentUser.id : uid;
      const data = await postsApi.getPosts({ authorId: authorQuery, limit: 50 }, token);
      if (data) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching user posts:', err);
    }
  }, [targetId, currentUser?.id, token]);

  useEffect(() => {
    if (targetId) {
      fetchProfile(targetId);
      fetchUserPosts(targetId);
    }
  }, [targetId, fetchProfile, fetchUserPosts]);

  const handleFollowToggle = async () => {
    if (!currentUser) return requireAuth();

    try {
      const res = await profileApi.toggleFollow(targetId, token);
      if (res?.data) {
        setIsFollowing(res.data.isFollowing);
        setFollowersCount((prev) => (res.data.isFollowing ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleUpdateCover = async (file) => {
    if (!file || !currentUser) return;
    setUploadingCover(true);
    try {
      const upData = await profileApi.uploadImage(file, token);
      if (!upData.data?.url) throw new Error(upData.message || 'Cover upload failed');

      await profileApi.updateProfile({ coverImage: upData.data.url }, token);
      setProfile((prev) => ({ ...prev, coverImage: upData.data.url }));
      notify.success('Cover photo updated');
    } catch (err) {
      notify.error(err.message || 'Failed to update cover');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUpdateAvatar = async (file) => {
    if (!file || !currentUser) return;
    setUploadingAvatar(true);
    try {
      const upData = await profileApi.uploadImage(file, token);
      if (!upData.data?.url) throw new Error(upData.message || 'Avatar upload failed');

      await profileApi.updateProfile({ image: upData.data.url }, token);
      setProfile((prev) => ({ ...prev, image: upData.data.url }));
      notify.success('Profile picture updated');
    } catch (err) {
      notify.error(err.message || 'Failed to update avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (formData, avatarFile) => {
    setSavingProfile(true);
    try {
      let imageUrl = profile.image;
      if (avatarFile) {
        const upData = await profileApi.uploadImage(avatarFile, token);
        if (upData.data?.url) {
          imageUrl = upData.data.url;
        }
      }

      await profileApi.updateProfile(
        {
          name: formData.name,
          username: formData.username,
          bio: formData.bio,
          city: formData.city,
          work: formData.work,
          education: formData.education,
          phone: formData.phone,
          gender: formData.gender,
          image: imageUrl,
        },
        token
      );

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
      notify.success('Profile updated');
    } catch (err) {
      notify.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
        <SocialHeader />
        <div className="pt-14 w-full">
          <ProfileHeaderSkeleton />
          <div className="max-w-[1095px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
              <div className="w-full lg:w-[360px] shrink-0">
                <ProfileIntroSkeleton />
              </div>
              <div className="flex-1 max-w-[700px] w-full mx-auto space-y-4">
                <PostSkeleton />
                <PostSkeleton />
              </div>
            </div>
          </div>
        </div>
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

        {/* Main 2-Column Content Area with generous gap */}
        <div className="max-w-[1095px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            {/* Left Column: Intro & Personal Details Card */}
            <div className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-18 self-start">
              <ProfileIntroCard
                profile={profile}
                isOwnProfile={isOwnProfile}
                onOpenEditModal={() => setIsEditModalOpen(true)}
              />
            </div>

            {/* Right Column: User Stream / Posts Feed */}
            <div className="flex-1 max-w-[700px] w-full mx-auto space-y-4">
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

