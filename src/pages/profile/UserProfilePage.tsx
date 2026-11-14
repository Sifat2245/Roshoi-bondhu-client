import { useSocial } from '../../features/community/model/useSocial';
import { useAuth } from '../../context/AuthContext';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { Utensils, List, LayoutGrid, SlidersHorizontal, Settings } from 'lucide-react';
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
import { useUpload } from '../../context/UploadContext';
import UploadProgressFeedCard from '../../features/posts/components/UploadProgressFeedCard';
import { profileApi } from '../../features/profile/api/profile.api';
import {
  useUserProfileQuery,
  useInvalidateProfileQueries,
} from '../../features/profile/hooks/useProfileQueries';
import { pinnedIn, compareRecent } from "../../features/posts/model/post-policy";
import { postsApi } from '../../features/posts/api/posts.api';
import { useChatDock } from '../../context/ChatDockContext';
import { friendsApi } from '../../features/friends/api/friends.api';
import { RelationshipStatusResponse } from '../../features/friends/types/friends.types';
import ContentUnavailable from '../../components/common/ContentUnavailable';
import BlockUserModal from '../../features/friends/components/BlockUserModal';
import UnfriendUserModal from '../../features/friends/components/UnfriendUserModal';
import UpdatePhotoModal from '../../features/profile/components/UpdatePhotoModal';
import {
  useFriendsQuery,
  useRelationshipStatusQuery,
  useInvalidateFriendsQueries,
} from '../../features/friends/hooks/useFriendsQueries';

const UserProfilePage = () => {
  const { id } = useParams();
  const { data: session, refetch } = useSession();
  const { updateUser, refetchUser } = useAuth();
  const { notify } = useToast();
  const { runUpload } = useUpload();
  const navigate = useNavigate();
  const { user: currentUser, state: social } = useSocial();
  const token = session?.session?.token;
  const targetId = id || currentUser?.id || 'me';

  const { data: cachedProfile, isLoading: isProfileQueryLoading } = useUserProfileQuery(targetId, token);
  const { invalidateProfile } = useInvalidateProfileQueries();
  const { invalidateAllFriendsData } = useInvalidateFriendsQueries();

  const isOtherUser = Boolean(targetId && targetId !== 'me' && (!currentUser?.id || targetId !== currentUser.id));
  const { data: cachedRelationship } = useRelationshipStatusQuery(isOtherUser ? targetId : null, token);
  const isOwnProfile = !isOtherUser;
  const targetFriendUid = isOwnProfile ? undefined : (targetId === 'me' ? undefined : targetId);
  const { data: userFriends } = useFriendsQuery(token, undefined, targetFriendUid);

  const [profile, setProfile] = useState<any>(cachedProfile || null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(!cachedProfile && isProfileQueryLoading);
  const [activeTab, setActiveTab] = useState('POSTS'); // 'POSTS', 'RECIPES', 'PHOTOS', 'ABOUT', 'FRIENDS'

  const { startConversation } = useChatDock();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isUnfriendModalOpen, setIsUnfriendModalOpen] = useState(false);
  const [modalActionLoading, setModalActionLoading] = useState(false);
  const [relationship, setRelationship] = useState<RelationshipStatusResponse>({
    status: 'NONE',
    friendsCount: 0,
    mutualCount: 0,
  });

  useEffect(() => {
    if (cachedRelationship) {
      setRelationship(cachedRelationship);
    }
  }, [cachedRelationship]);

  const handleSendFriendRequest = async () => {
    if (!currentUser) return requireAuth();
    setIsActionLoading(true);
    try {
      await friendsApi.sendFriendRequest(targetId, token);
      setRelationship((prev) => ({ ...prev, status: 'REQUEST_SENT' }));
      invalidateAllFriendsData(targetId);
      notify.success('Friend request sent');
    } catch (err: any) {
      notify.error(err.message || 'Could not send friend request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!currentUser) return requireAuth();
    setIsActionLoading(true);
    try {
      await friendsApi.cancelFriendRequest(targetId, token);
      setRelationship((prev) => ({ ...prev, status: 'NONE' }));
      invalidateAllFriendsData(targetId);
      notify.info('Friend request cancelled');
    } catch (err: any) {
      notify.error(err.message || 'Could not cancel request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!currentUser) return requireAuth();
    setIsActionLoading(true);
    try {
      await friendsApi.acceptFriendRequest(relationship.requestId || targetId, token);
      setRelationship((prev) => ({
        ...prev,
        status: 'FRIENDS',
        friendsCount: (prev.friendsCount || 0) + 1,
      }));
      invalidateAllFriendsData(targetId);
      notify.success('Friend request accepted');
    } catch (err: any) {
      notify.error(err.message || 'Could not accept request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeclineFriendRequest = async () => {
    if (!currentUser) return requireAuth();
    setIsActionLoading(true);
    try {
      await friendsApi.declineFriendRequest(relationship.requestId || targetId, token);
      setRelationship((prev) => ({ ...prev, status: 'NONE' }));
      invalidateAllFriendsData(targetId);
      notify.info('Friend request declined');
    } catch (err: any) {
      notify.error(err.message || 'Could not decline request');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenUnfriendModal = () => {
    if (!currentUser) return requireAuth();
    setIsUnfriendModalOpen(true);
  };

  const handleConfirmUnfriend = async () => {
    setModalActionLoading(true);
    try {
      await friendsApi.unfriend(targetId, token);
      setRelationship((prev) => ({
        ...prev,
        status: 'NONE',
        friendsCount: Math.max(0, (prev.friendsCount || 1) - 1),
      }));
      invalidateAllFriendsData(targetId);
      notify.success(`Unfriended ${profile?.name || 'user'}`);
      setIsUnfriendModalOpen(false);
    } catch (err: any) {
      notify.error(err.message || 'Could not unfriend');
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleOpenBlockModal = () => {
    if (!currentUser) return requireAuth();
    setIsBlockModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    setModalActionLoading(true);
    try {
      await friendsApi.blockUser(targetId, token);
      setRelationship((prev) => ({ ...prev, status: 'BLOCKING' }));
      invalidateAllFriendsData(targetId);
      notify.info(`${profile?.name || 'User'} has been blocked`);
      setIsBlockModalOpen(false);
    } catch (err: any) {
      notify.error(err.message || 'Could not block user');
    } finally {
      setModalActionLoading(false);
    }
  };

  const handleMessage = () => {
    if (!currentUser) return requireAuth();
    startConversation(profile);
  };

  useEffect(() => {
    if (cachedProfile) {
      setProfile(cachedProfile);
      setLoading(false);
    }
  }, [cachedProfile]);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState('CASUAL');
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  // Upload/Save states
  const [savingProfile, setSavingProfile] = useState(false);
  const [pendingPhotoUpload, setPendingPhotoUpload] = useState<{
    file: File;
    type: 'avatar' | 'cover';
  } | null>(null);
  const [showMobileIntro, setShowMobileIntro] = useState(false);
  const [feedViewMode, setFeedViewMode] = useState<'list' | 'grid'>('list');
  const [postFilter, setPostFilter] = useState<'all' | 'recipes' | 'casual'>('all');

  const requireAuth = () => {
    navigate('/login');
  };

  const fetchProfile = useCallback(async (uid = targetId) => {
    setLoading(true);
    try {
      const data = await profileApi.getUserProfile(uid, token);
      if (data) {
        setProfile(data);
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

  const handleInitiateCoverUpload = (file: File) => {
    if (!currentUser) return requireAuth();
    setPendingPhotoUpload({ file, type: 'cover' });
  };

  const handleInitiateAvatarUpload = (file: File) => {
    if (!currentUser) return requireAuth();
    setPendingPhotoUpload({ file, type: 'avatar' });
  };

  const handleConfirmPhotoUpload = (
    file: File,
    options: { caption: string; shareToFeed: boolean }
  ) => {
    if (!pendingPhotoUpload || !currentUser) return;
    const isAvatar = pendingPhotoUpload.type === 'avatar';
    const preview = URL.createObjectURL(file);

    // Close preview modal immediately so user doesn't wait!
    setPendingPhotoUpload(null);

    // Launch upload task in background with live progress tracking
    runUpload(
      {
        type: isAvatar ? 'AVATAR' : 'COVER',
        title: isAvatar ? 'updated their profile picture.' : 'updated their cover photo.',
        caption: options.caption || undefined,
        previewUrl: preview,
        userImage: currentUser?.image,
        userName: currentUser?.name || 'You',
      },
      async (onProgress) => {
        onProgress(30);
        const upData = await profileApi.uploadImage(file, token);
        const imageUrl = upData.data?.url;
        if (!imageUrl) throw new Error(upData.message || 'Image upload failed');
        onProgress(65);

        const profileUpdate = isAvatar ? { image: imageUrl } : { coverImage: imageUrl };
        await profileApi.updateProfile(profileUpdate, token);

        setProfile((prev: any) => ({ ...prev, ...profileUpdate }));
        if (updateUser) updateUser(profileUpdate);
        if (refetchUser) refetchUser();
        if (refetch) refetch();
        invalidateProfile(targetId);
        onProgress(85);

        if (options.shareToFeed) {
          const title = isAvatar
            ? 'updated their profile picture.'
            : 'updated their cover photo.';
          try {
            await postsApi.createPost(
              {
                postType: 'CASUAL',
                title,
                caption: options.caption || '',
                image: imageUrl,
                images: [imageUrl],
                audience: 'PUBLIC',
              } as any,
              token,
              { user: currentUser }
            );
            await fetchUserPosts(targetId);
            invalidateAllFriendsData(targetId);
          } catch (postErr) {
            console.error('Failed to publish photo update to feed:', postErr);
          }
        }

        notify.success(
          isAvatar
            ? (options.shareToFeed ? 'Profile picture updated & shared to feed!' : 'Profile picture updated!')
            : (options.shareToFeed ? 'Cover photo updated & shared to feed!' : 'Cover photo updated!')
        );
      }
    ).catch((err: any) => {
      notify.error(err.message || 'Failed to update photo');
    });
  };

  const handleSaveProfile = async (formData, avatarFile) => {
    setSavingProfile(true);
    try {
      let imageUrl = profile?.image;
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
      if (updateUser) {
        updateUser({
          name: formData.name,
          username: formData.username,
          bio: formData.bio,
          city: formData.city,
          work: formData.work,
          education: formData.education,
          phone: formData.phone,
          gender: formData.gender,
          image: imageUrl,
        });
      }
      if (refetchUser) refetchUser();
      if (refetch) refetch();
      invalidateProfile(targetId);
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

  if (
    !profile ||
    relationship.status === 'BLOCKED' ||
    relationship.status === 'BLOCKING'
  ) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
        <SocialHeader />
        <main className="pt-[100px] md:pt-14 w-full">
          <ContentUnavailable />
        </main>
      </div>
    );
  }

  const isOwner = currentUser?.id ? (currentUser.id === profile?.id || isOwnProfile) : isOwnProfile;
  const effectiveFriendsCount =
    typeof userFriends?.length === 'number'
      ? userFriends.length
      : (isOwner
          ? (profile?.friendsCount ?? 0)
          : (relationship.friendsCount ?? profile?.friendsCount ?? 0));
  const profilePosts = [...posts].sort((a, b) =>
    Number(pinnedIn(b, social.pins, { type: 'profile' })) -
    Number(pinnedIn(a, social.pins, { type: 'profile' })) || compareRecent(a, b)
  );
  let filteredPosts =
    activeTab === 'RECIPES'
      ? profilePosts.filter((p) => p.postType === 'RECIPE')
      : activeTab === 'PHOTOS'
      ? profilePosts.filter((p) => p.image)
      : profilePosts;

  if (activeTab === 'POSTS' || !activeTab) {
    if (postFilter === 'recipes') {
      filteredPosts = filteredPosts.filter((p) => p.postType === 'RECIPE');
    } else if (postFilter === 'casual') {
      filteredPosts = filteredPosts.filter((p) => p.postType === 'CASUAL');
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* 1. Fixed Topbar */}
      <SocialHeader />

      {/* 2. Profile Page Body with pt-[100px] on mobile and pt-14 on desktop */}
      <main className="pt-[100px] md:pt-14 w-full">
        {/* Profile Header Banner & Details */}
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwner}
          friendsCount={effectiveFriendsCount}
          mutualCount={relationship.mutualCount || 0}
          relationshipStatus={isOwner ? "SELF" : relationship.status}
          onViewFriends={() => {
            setActiveTab('FRIENDS');
            const navElem = document.getElementById('profile-nav-tabs');
            if (navElem) {
              navElem.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onSendFriendRequest={handleSendFriendRequest}
          onCancelFriendRequest={handleCancelFriendRequest}
          onAcceptFriendRequest={handleAcceptFriendRequest}
          onDeclineFriendRequest={handleDeclineFriendRequest}
          onUnfriend={handleOpenUnfriendModal}
          onBlock={handleOpenBlockModal}
          onMessage={handleMessage}
          onOpenEditModal={() => setIsEditModalOpen(true)}
          onOpenCreateRecipe={() => {
            setCreateInitialMode('RECIPE');
            setIsCreatePostOpen(true);
          }}
          onUpdateCover={handleInitiateCoverUpload}
          onUpdateAvatar={handleInitiateAvatarUpload}
          isActionLoading={isActionLoading}
        />

        {/* Profile Sub Navigation Tabs */}
        <ProfileNavTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          postCount={posts.length}
          friendsCount={effectiveFriendsCount}
        />

        {/* Main Content Area with generous gap (matching Image 1) */}
        <div className="max-w-[1250px] mx-auto px-0 sm:px-6 pt-3 sm:pt-10 pb-16">
          {activeTab === 'ABOUT' ? (
            /* About View (Matching Image 2 & Image 3) */
            <div className="space-y-8 animate-in fade-in duration-200">
              <ProfileAboutCard
                profile={profile}
                isOwnProfile={isOwner}
                onOpenEditModal={() => setIsEditModalOpen(true)}
                onProfileUpdated={(updated) => {
                  if (updated) {
                    setProfile((prev: any) => ({ ...prev, ...updated }));
                    if (updateUser) updateUser(updated);
                  } else {
                    fetchProfile(targetId);
                  }
                }}
              />
              <ProfileFriendsCard
                profile={profile}
                isOwnProfile={isOwner}
              />
            </div>
          ) : activeTab === 'FRIENDS' || activeTab === 'FOLLOWERS' ? (
            /* Friends / Followers View (Matching Image 3) */
            <div className="animate-in fade-in duration-200">
              <ProfileFriendsCard
                profile={profile}
                isOwnProfile={isOwner}
              />
            </div>
          ) : activeTab === 'PHOTOS' ? (
            /* Photos View (Matching Image 4) */
            <div className="animate-in fade-in duration-200">
              <ProfilePhotosCard posts={posts} />
            </div>
          ) : (
            /* Default 2-Column Feed: Intro Sidebar + Posts (Matching Image 1) */
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
              {/* Left Column: Intro & Personal Details Card */}
              <div className="w-full lg:w-[360px] xl:w-[380px] shrink-0 lg:sticky lg:top-18 self-start">
                <button type="button" aria-expanded={showMobileIntro} onClick={() => setShowMobileIntro((value) => !value)} className="lg:hidden w-full rounded-none sm:rounded-2xl bg-white dark:bg-[#242526] border-x-0 sm:border-x border-y border-gray-200 dark:border-gray-800 p-4 text-left"><span className="flex justify-between gap-3 font-bold text-sm">About {profile.name?.split(' ')[0]}<span className="text-[#e02f21] text-xs">{showMobileIntro ? 'Hide details' : 'See details'}</span></span><span className="block text-sm text-gray-500 mt-2 line-clamp-2">{profile.bio || 'A little more about this home cook.'}</span></button>
                <div className={showMobileIntro ? 'mt-3 lg:mt-0' : 'hidden lg:block'}>
                <ProfileIntroCard
                  profile={profile}
                  isOwnProfile={isOwnProfile}
                  onOpenEditModal={() => setIsEditModalOpen(true)}
                />
                </div>
              </div>

              {/* Right Column: User Stream / Posts Feed */}
              <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-4">
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

                {/* Uploading Progress Feed Card (Facebook style) */}
                <UploadProgressFeedCard />

                {/* Facebook-style "Posts" Header Card */}
                <div className="bg-white dark:bg-[#242526] rounded-none sm:rounded-2xl p-4 sm:p-5 border-x-0 sm:border-x border-y border-gray-100 dark:border-gray-800 shadow-none sm:shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-lg sm:text-xl text-gray-900 dark:text-white">
                      Posts
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPostFilter((prev) => {
                            if (prev === 'all') return 'recipes';
                            if (prev === 'recipes') return 'casual';
                            return 'all';
                          });
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          postFilter !== 'all'
                            ? 'bg-[#e02f21]/10 text-[#e02f21] border border-[#e02f21]/30'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                        title="Filter posts"
                      >
                        <SlidersHorizontal size={15} />
                        <span>
                          {postFilter === 'all'
                            ? 'Filters'
                            : postFilter === 'recipes'
                            ? 'Recipes only'
                            : 'Casual only'}
                        </span>
                      </button>

                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => {
                            const navElem = document.getElementById('profile-nav-tabs');
                            if (navElem) navElem.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer"
                          title="Manage posts"
                        >
                          <Settings size={15} />
                          <span>Manage posts</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List view vs Grid view tabs */}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex items-center justify-around text-sm font-bold">
                    <button
                      type="button"
                      onClick={() => setFeedViewMode('list')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                        feedViewMode === 'list'
                          ? 'text-[#e02f21] border-b-2 border-[#e02f21]'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <List size={18} />
                      <span>List view</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedViewMode('grid')}
                      className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                        feedViewMode === 'grid'
                          ? 'text-[#e02f21] border-b-2 border-[#e02f21]'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <LayoutGrid size={18} />
                      <span>Grid view</span>
                    </button>
                  </div>
                </div>

                {/* Posts Stream */}
                {filteredPosts.length > 0 ? (
                  feedViewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                      {filteredPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => setSelectedPostForComments(post)}
                          className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md transition"
                        >
                          {post.image || post.images?.[0] ? (
                            <img
                              src={post.image || post.images?.[0]}
                              alt={post.title || 'Post preview'}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="w-full h-full p-3.5 flex flex-col justify-between bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                              <span className="text-[10px] font-bold text-[#e02f21] uppercase tracking-wider">{post.postType}</span>
                              <p className="text-xs font-semibold line-clamp-3 text-gray-800 dark:text-gray-200">
                                {post.caption || post.title}
                              </p>
                              <span className="text-[10px] text-gray-400">Click to view</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold p-2 text-center">
                            <span className="line-clamp-2">{post.title || post.caption || 'View post'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        pinContext={{ type: "profile" }}
                        onOpenComments={(selected) => setSelectedPostForComments(selected)}
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
                  )
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

      {/* Block User Modal */}
      <BlockUserModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleConfirmBlock}
        userName={profile?.name}
        loading={modalActionLoading}
      />

      {/* Unfriend User Modal */}
      <UnfriendUserModal
        isOpen={isUnfriendModalOpen}
        onClose={() => setIsUnfriendModalOpen(false)}
        onConfirm={handleConfirmUnfriend}
        userName={profile?.name}
        loading={modalActionLoading}
      />

      {/* Upload Preview & Share to Feed Modal */}
      {pendingPhotoUpload && (
        <UpdatePhotoModal
          isOpen={Boolean(pendingPhotoUpload)}
          onClose={() => setPendingPhotoUpload(null)}
          file={pendingPhotoUpload.file}
          type={pendingPhotoUpload.type}
          onConfirm={handleConfirmPhotoUpload}
        />
      )}
    </div>
  );
};

export default UserProfilePage;

