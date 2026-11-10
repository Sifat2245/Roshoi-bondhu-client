import { useSocial } from '../../features/community/model/useSocial';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Utensils } from 'lucide-react';
import { useSession } from '../../lib/auth-client';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import ProfileHeader from '../../features/profile/components/ProfileHeader';
import ProfileNavTabs from '../../features/profile/components/ProfileNavTabs';
import ProfileIntroCard from '../../features/profile/components/ProfileIntroCard';
import ProfileAboutCard from '../../features/profile/components/ProfileAboutCard';
import ProfileFriendsCard from '../../features/profile/components/ProfileFriendsCard';
import ProfilePhotosCard from '../../features/profile/components/ProfilePhotosCard';
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
import { pinnedIn, compareRecent } from "../../features/posts/model/post-policy";
import { postsApi } from '../../features/posts/api/posts.api';

const UserProfilePage = () => {
  const { id } = useParams();
  const { data: session } = useSession();
  const { notify } = useToast();
  const navigate = useNavigate();
  const { user: currentUser, state: social } = useSocial();
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
  const [showMobileIntro, setShowMobileIntro] = useState(false);

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
      const data = await postsApi.getPosts({ authorId: authorQuery, limit: 50 }, token, currentUser?.id);
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
      notify.error(err.message || 'Could not update this connection. Please try again.');
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
        <main className="pt-[100px] md:pt-14 w-full">
          <ProfileHeaderSkeleton />
          <div className="max-w-[1250px] mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
              <div className="w-full lg:w-[420px] shrink-0">
                <ProfileIntroSkeleton />
              </div>
              <div className="flex-1 max-w-[780px] w-full mx-auto space-y-4">
                <PostSkeleton />
                <PostSkeleton />
              </div>
            </div>
          </div>
        </main>
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
  const profilePosts = [...posts].sort((a, b) =>
    Number(pinnedIn(b, social.pins, { type: 'profile' })) -
    Number(pinnedIn(a, social.pins, { type: 'profile' })) || compareRecent(a, b)
  );
  const filteredPosts =
    activeTab === 'RECIPES'
      ? profilePosts.filter((p) => p.postType === 'RECIPE')
      : activeTab === 'PHOTOS'
      ? profilePosts.filter((p) => p.image)
      : profilePosts;

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* 1. Fixed Topbar */}
      <SocialHeader />

      {/* 2. Profile Page Body with pt-[100px] on mobile and pt-14 on desktop */}
      <main className="pt-[100px] md:pt-14 w-full">
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

        {/* Main Content Area with generous gap (matching Image 1) */}
        <div className="max-w-[1250px] mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-16">
          {activeTab === 'ABOUT' ? (
            /* About View (Matching Image 2 & Image 3) */
            <div className="space-y-8 animate-in fade-in duration-200">
              <ProfileAboutCard
                profile={profile}
                isOwnProfile={isOwnProfile}
                onOpenEditModal={() => setIsEditModalOpen(true)}
              />
              <ProfileFriendsCard
                profile={profile}
                isOwnProfile={isOwnProfile}
              />
            </div>
          ) : activeTab === 'FOLLOWERS' ? (
            /* Friends / Followers View (Matching Image 3) */
            <div className="animate-in fade-in duration-200">
              <ProfileFriendsCard
                profile={profile}
                isOwnProfile={isOwnProfile}
              />
            </div>
          ) : activeTab === 'PHOTOS' ? (
            /* Photos View (Matching Image 4) */
            <div className="animate-in fade-in duration-200">
              <ProfilePhotosCard posts={posts} />
            </div>
          ) : (
            /* Default 2-Column Feed: Intro Sidebar + Posts (Matching Image 1) */
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
              {/* Left Column: Intro & Personal Details Card */}
              <div className="w-full lg:w-[420px] xl:w-[440px] shrink-0 lg:sticky lg:top-18 self-start">
                <button type="button" aria-expanded={showMobileIntro} onClick={() => setShowMobileIntro((value) => !value)} className="lg:hidden w-full rounded-2xl bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-800 p-4 text-left"><span className="flex justify-between gap-3 font-bold text-sm">About {profile.name?.split(' ')[0]}<span className="text-[#e02f21] text-xs">{showMobileIntro ? 'Hide details' : 'See details'}</span></span><span className="block text-sm text-gray-500 mt-2 line-clamp-2">{profile.bio || 'A little more about this home cook.'}</span></button>
                <div className={showMobileIntro ? 'mt-3 lg:mt-0' : 'hidden lg:block'}>
                <ProfileIntroCard
                  profile={profile}
                  isOwnProfile={isOwnProfile}
                  onOpenEditModal={() => setIsEditModalOpen(true)}
                />
                </div>
              </div>

              {/* Right Column: User Stream / Posts Feed */}
              <div className="flex-1 max-w-[780px] w-full mx-auto space-y-4">
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
                      pinContext={{ type: "profile" }}
                      onOpenComments={(selected) => setSelectedPostForComments(selected)}
                      onOpenShare={async (selected) => { try { await postsApi.sharePost(selected.id, '', token, currentUser); notify.success('Post shared to your feed'); fetchUserPosts(); } catch (error: any) { notify.error(error.message || 'Could not share this post.'); } }}
                      onRequireAuth={requireAuth}
                      onDeletePost={(deletedId) =>
                        setPosts((prev) => prev.filter((p) => p.id !== deletedId))
                      }
                      onUpdatePost={(updated) =>
                        setPosts((prev) =>
                          prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
                        )
                      }
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
          )}
        </div>
      </main>

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

