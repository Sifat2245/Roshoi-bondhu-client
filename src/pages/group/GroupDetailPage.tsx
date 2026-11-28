import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useMatch, useSearchParams } from 'react-router';
import { useSession } from '../../lib/auth-client';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import GroupHeader from '../../features/groups/components/GroupHeader';
import GroupInviteBanner from '../../features/groups/components/GroupInviteBanner';
import GroupAboutCard from '../../features/groups/components/GroupAboutCard';
import { useSocial } from '../../features/community/model/useSocial';
import { resolveGroup } from '../../features/community/model/community-domain';
import GroupMembersTab from '../../features/groups/components/GroupMembersTab';
import GroupSettingsTab from '../../features/groups/components/GroupSettingsTab';
import GroupCommunityTab from '../../features/groups/components/GroupCommunityTab';
import GroupManageSidebar from '../../features/groups/components/manage/GroupManageSidebar';
import GroupMobileManageHub from '../../features/groups/components/manage/GroupMobileManageHub';
import GroupManageView from '../../features/groups/components/manage/GroupManageView';
import {
  resolveManageSection,
  getManagePath,
  type GroupManageCounts,
  type GroupManageSection,
} from '../../features/groups/components/manage/types';
import CreatePostTrigger from '../../features/posts/components/CreatePostTrigger';
import UploadProgressFeedCard from '../../features/posts/components/UploadProgressFeedCard';
import { pinnedIn } from "../../features/posts/model/post-policy";
import PostCard from '../../features/posts/components/PostCard';
import CreatePostModal from '../../features/posts/components/CreatePostModal';
import PostDetailsModal from '../../features/posts/components/PostDetailsModal';
import { GroupHeaderSkeleton, PostSkeleton } from '../../components/ui/Skeleton';
import groupsApi from '../../features/groups/api/groups.api';
import postsApi from '../../features/posts/api/posts.api';
import {
  useGroupDetailQuery,
  useGroupPostsQuery,
  useInvalidateGroupQueries,
} from '../../features/groups/hooks/useGroupQueries';
import { useInvalidateFeedQueries } from '../../features/posts/hooks/useFeedQueries';
import { useToast } from '../../context/ToastContext';
import ImageViewer from '../../components/ui/ImageViewer';
import { Utensils, Info, Image as ImageIcon, PauseCircle } from 'lucide-react';

const GroupDetailPage = () => {
  const { slug, manageSection: manageParam } = useParams<{
    slug: string;
    manageSection?: string;
  }>();
  const isManageRoute = Boolean(useMatch('/group/:slug/manage/*'));
  const [searchParams, setSearchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite') || '';
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { state: social, user } = useSocial();
  const { notify } = useToast();

  const [activeTab, setActiveTab] = useState('DISCUSSION'); // 'DISCUSSION', 'FEATURED', 'ABOUT', 'MEMBERS', 'SETTINGS'
  const manageSection: GroupManageSection = resolveManageSection(
    isManageRoute,
    manageParam
  );
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const navigateToManageSection = (section: GroupManageSection) => {
    if (!slug) return;
    navigate(getManagePath(slug, section));
  };

  useEffect(() => {
    setActiveTab('DISCUSSION');
  }, [slug]);

  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0 });
  }, [manageSection]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState('CASUAL');
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevant');
  const [mediaIndex, setMediaIndex] = useState<number | null>(null);
  const [invitePreview, setInvitePreview] = useState<any>(null);
  const [loadingInvitePreview, setLoadingInvitePreview] = useState(false);

  useEffect(() => {
    if (!slug || !inviteToken) {
      setInvitePreview(null);
      setLoadingInvitePreview(false);
      return;
    }

    let cancelled = false;
    setLoadingInvitePreview(true);
    groupsApi
      .getInvitePreview(slug, inviteToken, session?.session?.token)
      .then((res) => {
        if (!cancelled) setInvitePreview(res);
      })
      .catch(() => {
        if (!cancelled) {
          setInvitePreview({
            valid: false,
            reason: 'Could not validate this invitation link.',
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingInvitePreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, inviteToken, session?.session?.token]);

  // TanStack Query + localStorage SWR 10-minute caching
  const {
    data: baseGroup = null,
    isLoading: loadingGroup,
  } = useGroupDetailQuery(slug, session?.session?.token, user?.id);

  const group = baseGroup ? resolveGroup(baseGroup, social.members[baseGroup.id], user?.id) : null;

  const {
    data: posts = [],
    isLoading: loadingPosts,
  } = useGroupPostsQuery(baseGroup?.id, session?.session?.token, user?.id);

  const {
    invalidateGroupDetail,
    invalidateGroupPosts,
    invalidateGroupFeed,
    invalidateAllGroups,
    updateGroupMembershipInCache,
    prependPostToGroup,
    deletePostFromGroup,
    updatePostInGroup,
  } = useInvalidateGroupQueries();
  const { invalidateFeed, prependPostToFeed, updatePostInFeed, deletePostFromFeed } =
    useInvalidateFeedQueries();

  const loading = loadingGroup || (loadingPosts && !group);

  const requireAuth = () => {
    navigate('/login');
  };

  const handleJoinToggle = async () => {
    if (!user || !group) return requireAuth();

    const isPending = group.myMembershipStatus === 'PENDING';
    const wasMember = Boolean(group.isMember);

    if (wasMember || isPending) {
      updateGroupMembershipInCache(group.id, false, false);
      try {
        await groupsApi.leaveGroup(group.id || group.slug, session?.session?.token);
        notify.info(isPending ? `Cancelled request to join ${group.name}` : `Left ${group.name}`);
        invalidateGroupDetail(slug);
        invalidateGroupPosts(group.id);
        invalidateGroupFeed();
        invalidateAllGroups();
        invalidateFeed();
      } catch (err: any) {
        updateGroupMembershipInCache(group.id, wasMember, isPending);
        notify.error(err.message || 'Could not update your group membership. Please try again.');
      }
      return;
    }

    const willAwaitApproval = group.joinMode === 'ADMIN_APPROVAL' && !group.myPendingInvite;
    updateGroupMembershipInCache(group.id, !willAwaitApproval, willAwaitApproval);

    try {
      const res = await groupsApi.joinGroup(group.id || group.slug, session?.session?.token);
      if (res?.isApproved === false) {
        updateGroupMembershipInCache(group.id, false, true);
        notify.info(`Join request sent for ${group.name}. Waiting for admin approval.`);
      } else {
        updateGroupMembershipInCache(group.id, true, false);
        notify.success(`Joined ${group.name}!`, 'Joined', true);
      }
      invalidateGroupDetail(slug);
      invalidateGroupPosts(group.id);
      invalidateGroupFeed();
      invalidateAllGroups();
      invalidateFeed();
    } catch (err: any) {
      updateGroupMembershipInCache(group.id, false, false);
      notify.error(err.message || 'Could not update your group membership. Please try again.');
    }
  };

  const clearInviteParam = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('invite');
    setSearchParams(next, { replace: true });
    setInvitePreview(null);
  };

  const handleAcceptInviteLink = async () => {
    if (!user || !group) return requireAuth();
    if (!inviteToken) return;
    try {
      const res = await groupsApi.acceptInviteLink(inviteToken, session?.session?.token);
      clearInviteParam();
      if (res?.isApproved) {
        updateGroupMembershipInCache(group.id, true, false);
        notify.success(`Joined ${group.name}!`, 'Welcome', true);
      } else {
        updateGroupMembershipInCache(group.id, false, true);
        notify.info(`Join request submitted for ${group.name}. Waiting for admin approval.`);
      }
      invalidateGroupDetail(slug);
      invalidateGroupPosts(group.id);
      invalidateGroupFeed();
      invalidateAllGroups();
      invalidateFeed();
    } catch (err: any) {
      notify.error(err?.message || 'Could not accept this invitation link.');
    }
  };

  const handleRespondDirectInvite = async (
    invitationId: string,
    action: 'ACCEPT' | 'DECLINE'
  ) => {
    if (!user || !group) return requireAuth();
    try {
      const res = await groupsApi.respondToInvitation(
        invitationId,
        action,
        session?.session?.token
      );
      if (action === 'ACCEPT') {
        if (res?.isApproved === false) {
          updateGroupMembershipInCache(group.id, false, true);
          notify.info(`Request submitted for ${group.name}. Waiting for admin approval.`);
        } else {
          updateGroupMembershipInCache(group.id, true, false);
          notify.success(`Joined ${group.name}!`, 'Welcome', true);
        }
      } else {
        notify.info('Group invitation declined.');
      }
      invalidateGroupDetail(slug);
      invalidateGroupPosts(group.id);
      invalidateGroupFeed();
      invalidateAllGroups();
      invalidateFeed();
    } catch (err: any) {
      notify.error(err?.message || 'Could not respond to the invitation.');
    }
  };

  // Skeleton Loading State
  if (loading && !group) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
        <SocialHeader />
        <main className="pt-[100px] md:pt-14 w-full">
          <GroupHeaderSkeleton />
          <div className="max-w-[1250px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="flex-1 w-full space-y-4">
                <PostSkeleton />
                <PostSkeleton />
              </div>
              <div className="w-full lg:w-[360px] shrink-0">
                <div className="h-64 bg-white dark:bg-[#242526] rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-center py-24">
        <h2 className="text-xl font-bold">Group not found</h2>
        <Link to="/groups" className="text-[#e02f21] hover:underline mt-2 inline-block">
          Explore all groups
        </Link>
      </div>
    );
  }

  const effectiveOwnerId = group.ownerId || group.createdById;
  const currentRole = group.currentUserRole || group.membershipRole || (effectiveOwnerId === user?.id ? 'ADMIN' : null);
  const isMember = Boolean(group.isMember || currentRole || effectiveOwnerId === user?.id);
  const isAdmin = currentRole === 'ADMIN' || effectiveOwnerId === user?.id;
  const canModerate = Boolean(group.canModerate || isAdmin || currentRole === 'MODERATOR');
  const isPaused = group.status === 'PAUSED';
  const manageCounts: GroupManageCounts = {
    memberRequests: group.pendingRequestsCount ?? 0,
    pendingPosts: group.pendingPostsCount ?? 0,
    reportedContent: 0,
    bannedMembers: 0,
  };
  const pendingManageCount =
    manageCounts.memberRequests +
    manageCounts.pendingPosts +
    manageCounts.reportedContent;
  const visiblePosts = posts.filter((post) => (activeTab !== 'FEATURED' || pinnedIn(post, social.pins, { type: 'group', groupId: group.id })) && `${post.title || ''} ${post.caption || ''}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'newest' ? +new Date(b.createdAt) - +new Date(a.createdAt) : (b.likeCount || 0) - (a.likeCount || 0));

  const recentMedia = [...new Set<string>(posts.map((post) => post.image).filter(Boolean))];

  return (
    <div className="h-dvh flex flex-col bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors overflow-hidden">
      <SocialHeader />

      <div className="flex-1 min-h-0 mt-[100px] md:mt-14 flex overflow-hidden">
        {/* Desktop Admin/Moderator Manage Left Sidebar */}
        {canModerate && (
          <GroupManageSidebar
            group={group}
            activeSection={manageSection === 'MOBILE_HUB' ? 'OVERVIEW' : manageSection}
            onSelectSection={navigateToManageSection}
            isAdmin={isAdmin}
            counts={manageCounts}
          />
        )}

        <main
          ref={mainScrollRef}
          className="flex-1 min-w-0 min-h-0 h-full overflow-y-auto no-scrollbar w-full"
        >
          {canModerate && manageSection === 'MOBILE_HUB' ? (
            <>
              <div className="lg:hidden">
                <GroupMobileManageHub
                  group={group}
                  isAdmin={isAdmin}
                  counts={manageCounts}
                  onSelectSection={navigateToManageSection}
                  onClose={() => navigateToManageSection('HOME')}
                />
              </div>
              <div className="hidden lg:block">
                <GroupManageView
                  group={group}
                  section="OVERVIEW"
                  isAdmin={isAdmin}
                  token={session?.session?.token}
                  counts={manageCounts}
                  onSelectSection={navigateToManageSection}
                  onBackMobileHub={() => navigateToManageSection('MOBILE_HUB')}
                  onBackHome={() => navigateToManageSection('HOME')}
                  onGroupUpdated={() => {
                    invalidateGroupDetail(slug);
                    invalidateAllGroups();
                  }}
                />
              </div>
            </>
          ) : canModerate && manageSection !== 'HOME' && manageSection !== 'MOBILE_HUB' ? (
            <GroupManageView
              group={group}
              section={manageSection}
              isAdmin={isAdmin}
              token={session?.session?.token}
              counts={manageCounts}
              onSelectSection={navigateToManageSection}
              onBackMobileHub={() => navigateToManageSection('MOBILE_HUB')}
              onBackHome={() => navigateToManageSection('HOME')}
              onGroupUpdated={() => invalidateGroupDetail(slug)}
            />
          ) : (
            <>
              {/* Contained Group Banner & Header */}
              <GroupHeader
                group={group}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onJoinToggle={handleJoinToggle}
                isMember={isMember}
                isAdmin={isAdmin}
                canModerate={canModerate}
                pendingManageCount={pendingManageCount}
                onOpenManage={(sec = 'MOBILE_HUB') => navigateToManageSection(sec)}
                search={search}
                onSearch={(value) => { setSearch(value); setActiveTab('DISCUSSION'); }}
              />

              {/* Group Invitation Link / Direct Invite / Pending Approval Banner */}
              <GroupInviteBanner
                group={group}
                isMember={isMember}
                invitePreview={invitePreview}
                loadingPreview={loadingInvitePreview}
                hasInviteToken={Boolean(inviteToken)}
                onAcceptInviteLink={handleAcceptInviteLink}
                onDismissInviteLink={clearInviteParam}
                onRespondDirectInvite={handleRespondDirectInvite}
                onCancelPendingRequest={handleJoinToggle}
              />

              {/* Paused Group Banner */}
              {isPaused && (
                <div className="max-w-[1250px] mx-auto px-4 sm:px-8 pt-4">
                  <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-amber-200 dark:border-amber-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <PauseCircle size={20} />
                      </span>
                      <div>
                        <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                          This group is paused
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          Admins temporarily paused new posts in this group. Existing posts remain readable.
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await groupsApi.updateGroupLifecycle(
                                group.id,
                                'RESUME',
                                session?.session?.token
                              );
                              notify.success('Group resumed!');
                              invalidateGroupDetail(slug);
                            } catch (err: any) {
                              notify.error(err?.message || 'Failed to resume group.');
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-[#e02f21] hover:bg-[#c92518] text-white text-xs sm:text-sm font-bold cursor-pointer transition"
                        >
                          Resume
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateToManageSection('SETTINGS')}
                          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-xs sm:text-sm font-bold cursor-pointer transition"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content Area with Generous Gap */}
              <div className="max-w-[1250px] mx-auto px-0 sm:px-8 py-3 sm:py-8">
                {(activeTab === 'DISCUSSION' || activeTab === 'FEATURED') && (
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left Column: Discussion Posts & Featured Section */}
                    <div className="flex-1 min-w-0 w-full space-y-4">
                      {/* Write Something Card */}
                      {isMember && !isPaused && (
                        <CreatePostTrigger
                          onClick={(mode) => {
                            setCreateInitialMode(mode);
                            setIsCreateOpen(true);
                          }}
                          onRequireAuth={requireAuth}
                        />
                      )}

                      {/* Upload Progress Feed Card (Background upload tracker) */}
                      <UploadProgressFeedCard />

                      {/* Featured Section */}
                      <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                        <div className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                          <span>Featured</span>
                          <Info size={16} className="text-gray-400" />
                        </div>

                        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-[#3a3b3c]/60 dark:to-gray-800 rounded-xl border border-red-100 dark:border-gray-700 flex items-start gap-3">

                          <div className="min-w-0">
                            <p className="font-bold text-base text-gray-900 dark:text-white break-words">
                              Welcome to {group.name}!
                            </p>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                              Share your authentic family recipes, review local dining spots, and connect with fellow chefs. Be kind, credit original recipes, and happy cooking!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Sort / Filter Row */}
                      <div className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-500 dark:text-gray-400 px-1">
                        <select aria-label="Sort group posts" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg bg-transparent py-2 pr-2"><option value="relevant">Most relevant</option><option value="newest">Newest first</option></select>
                        <span className="shrink-0">{visiblePosts.length} {visiblePosts.length === 1 ? 'post' : 'posts'}</span>
                      </div>

                      {/* Post Cards Stream */}
                      {loadingPosts && visiblePosts.length === 0 ? (
                        <div className="space-y-4">
                          <PostSkeleton />
                          <PostSkeleton />
                        </div>
                      ) : visiblePosts.length > 0 ? (
                        visiblePosts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            pinContext={{ type: "group", groupId: group.id }}
                            canManageGroupPins={canModerate}
                            showPinBadge={activeTab === 'FEATURED'}
                            onOpenComments={(selected) => setSelectedPostForComments(selected)}
                            onRequireAuth={requireAuth}
                            onDeletePost={(deletedId) => {
                              deletePostFromGroup(group.id, deletedId);
                              deletePostFromFeed(deletedId);
                              invalidateGroupDetail(slug);
                            }}
                            onUpdatePost={(updated) => {
                              updatePostInGroup(group.id, updated);
                              updatePostInFeed(updated);
                            }}
                          />
                        ))
                      ) : (
                        <div className="bg-white dark:bg-[#242526] rounded-2xl px-5 py-10 sm:p-12 text-center border border-gray-100 dark:border-gray-800 space-y-3">
                          <Utensils size={32} className="mx-auto text-gray-400" />
                          <h2 className="text-base sm:text-lg font-bold">{search ? 'No matching posts' : activeTab === 'FEATURED' ? 'No featured posts yet' : 'Start the conversation'}</h2>
                          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">{search ? 'Try a different recipe name or keyword.' : activeTab === 'FEATURED' ? 'Pinned recipes and community announcements will appear here.' : 'No posts in this group yet. Be the first to share a recipe or kitchen story.'}</p>
                        </div>
                      )}
                    </div>

                    {/* Right Column: About Card + Recent Media */}
                    <aside className="w-full lg:w-[360px] shrink-0 space-y-4 lg:sticky lg:top-20 self-start" aria-label="Group information and media">
                      {/* 1. About Card */}
                      <GroupAboutCard group={group} />

                      {/* 2. Recent Media Card */}
                      <section className="bg-white dark:bg-[#242526] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                            Recent media
                          </h2>
                          {recentMedia.length > 0 && <button type="button" onClick={() => setMediaIndex(0)} className="text-sm font-semibold text-[#e02f21] hover:underline cursor-pointer">
                            See all
                          </button>}
                        </div>

                        {recentMedia.length > 0 ? <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                          {recentMedia.slice(0, 4).map((img, idx) => (
                            <button type="button" key={idx} onClick={() => setMediaIndex(idx)} aria-label={`Open group photo ${idx + 1}`} className="h-28 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                              <img
                                src={img}
                                alt={`Photo ${idx + 1} shared in ${group.name}`}
                                loading="lazy"
                                className="w-full h-full object-cover hover:scale-105 transition duration-300"
                              />
                            </button>
                          ))}
                        </div> : <div className="rounded-xl bg-gray-50 dark:bg-[#18191a] p-6 text-center"><ImageIcon size={28} className="mx-auto mb-3 text-gray-400" /><p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Photos from group posts will appear here.</p></div>}
                      </section>
                    </aside>
                  </div>
                )}

                {activeTab === 'COMMUNITY' && <GroupCommunityTab group={group} posts={posts} isMember={isMember} onCreatePost={() => { setCreateInitialMode('RECIPE'); setIsCreateOpen(true); }} />}

                {activeTab === 'ABOUT' && (
                  <div className="max-w-[700px] mx-auto">
                    <GroupAboutCard group={group} />
                  </div>
                )}

                {activeTab === 'MEMBERS' && (
                  <div className="max-w-[700px] mx-auto">
                    <GroupMembersTab group={group} />
                  </div>
                )}

          {activeTab === 'COMMUNITY' && (
            <GroupCommunityTab
              group={group}
              posts={posts}
              isMember={isMember}
              onCreatePost={() => {
                setCreateInitialMode('RECIPE');
                setIsCreateOpen(true);
              }}
              onCreatePoll={() => {
                setCreateInitialMode('POLL');
                setIsCreateOpen(true);
              }}
            />
          )}

          {activeTab === 'ABOUT' && (
            <div className="max-w-[700px] mx-auto">
              <GroupAboutCard group={group} />
            </div>
          )}

          {activeTab === 'MEMBERS' && (
            <div className="max-w-[700px] mx-auto">
              <GroupMembersTab group={group} />
            </div>
          )}

          {activeTab === 'SETTINGS' && isAdmin && (
            <div className="max-w-[700px] mx-auto">
              <GroupSettingsTab
                group={group}
                token={session?.session?.token}
                onGroupUpdated={() => invalidateGroupDetail(slug)}
              />
            </div>
          )}
        </div>
            </>
          )}
        </main>
      </div>

      <CreatePostModal
        isOpen={isCreateOpen}
        initialMode={createInitialMode}
        defaultGroupId={group.id}
        defaultGroup={group}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={(newPost) => {
          if (newPost && newPost.status !== 'PENDING_APPROVAL') {
            prependPostToGroup(group.id, newPost);
            prependPostToFeed(newPost);
          }
          invalidateGroupPosts(group.id);
          invalidateGroupFeed();
          invalidateGroupDetail(slug);
          invalidateFeed();
        }}
      />

      {selectedPostForComments && (
        <PostDetailsModal
          isOpen={Boolean(selectedPostForComments)}
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          onPostUpdated={(updated) => {
            if (updated) updatePostInGroup(group.id, updated);
            invalidateGroupPosts(group.id);
          }}
          onRequireAuth={requireAuth}
        />
      )}
      {mediaIndex !== null && recentMedia.length > 0 && <ImageViewer images={recentMedia} initialIndex={mediaIndex} onClose={() => setMediaIndex(null)} />}
    </div>
  );
};

export default GroupDetailPage;
