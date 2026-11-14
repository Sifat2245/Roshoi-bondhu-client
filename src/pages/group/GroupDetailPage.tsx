import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import GroupHeader from '../../features/groups/components/GroupHeader';
import GroupAboutCard from '../../features/groups/components/GroupAboutCard';
import { useSocial } from '../../features/community/model/useSocial';
import { resolveGroup } from '../../features/community/model/community-domain';
import GroupMembersTab from '../../features/groups/components/GroupMembersTab';
import GroupSettingsTab from '../../features/groups/components/GroupSettingsTab';
import GroupCommunityTab from '../../features/groups/components/GroupCommunityTab';
import CreatePostTrigger from '../../features/posts/components/CreatePostTrigger';
import { pinnedIn } from "../../features/posts/model/post-policy";
import PostCard from '../../features/posts/components/PostCard';
import CreatePostModal from '../../features/posts/components/CreatePostModal';
import PostDetailsModal from '../../features/posts/components/PostDetailsModal';
import { GroupHeaderSkeleton, PostSkeleton } from '../../components/ui/Skeleton';
import groupsApi from '../../features/groups/api/groups.api';
import postsApi from '../../features/posts/api/posts.api';
import { useToast } from '../../context/ToastContext';
import ImageViewer from '../../components/ui/ImageViewer';
import { Utensils, Info, Image as ImageIcon } from 'lucide-react';

const GroupDetailPage = () => {
  const { slug } = useParams();
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { state: social, user } = useSocial();
  const { notify } = useToast();

  const [baseGroup, setGroup] = useState(null);
  const group = baseGroup ? resolveGroup(baseGroup, social.members[baseGroup.id], user?.id) : null;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DISCUSSION'); // 'DISCUSSION', 'FEATURED', 'ABOUT', 'MEMBERS', 'SETTINGS'

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState('CASUAL');
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevant');
  const [mediaIndex, setMediaIndex] = useState<number | null>(null);

  const requireAuth = () => {
    navigate('/login');
  };

  const fetchGroupData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await groupsApi.getGroupBySlug(slug, session?.session?.token);
      if (data) {
        setGroup(data);

        // Fetch Group Feed
        const groupPosts = await postsApi.getPosts({ groupId: data.id }, session?.session?.token, user?.id);
        setPosts(groupPosts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug, session, user?.id]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleJoinToggle = async () => {
    if (!user) return requireAuth();

    try {
      if (group.isMember) {
        await groupsApi.leaveGroup(group.slug, session?.session?.token);
      } else {
        await groupsApi.joinGroup(group.slug, session?.session?.token);
      }
      fetchGroupData();
    } catch (err) {
      notify.error(err.message || 'Could not update your group membership. Please try again.');
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

  const isMember = group.isMember || false;
  const isAdmin = group.membershipRole === 'ADMIN';
  const visiblePosts = posts.filter((post) => (activeTab !== 'FEATURED' || pinnedIn(post, social.pins, { type: 'group', groupId: group.id })) && `${post.title || ''} ${post.caption || ''}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'newest' ? +new Date(b.createdAt) - +new Date(a.createdAt) : (b.likeCount || 0) - (a.likeCount || 0));

  const recentMedia = [...new Set<string>(posts.map((post) => post.image).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      <SocialHeader />

      <main className="pt-[100px] md:pt-14 w-full">
        {/* Contained Group Banner & Header */}
        <GroupHeader
          group={group}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onJoinToggle={handleJoinToggle}
          isMember={isMember}
          isAdmin={isAdmin}
          search={search}
          onSearch={(value) => { setSearch(value); setActiveTab('DISCUSSION'); }}
        />

        {/* Content Area with Generous Gap */}
        <div className="max-w-[1250px] mx-auto px-0 sm:px-8 py-3 sm:py-8">
          {(activeTab === 'DISCUSSION' || activeTab === 'FEATURED') && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left Column: Discussion Posts & Featured Section */}
              <div className="flex-1 min-w-0 w-full space-y-4">
                {/* Write Something Card */}
                {isMember && (
                  <CreatePostTrigger
                    onClick={(mode) => {
                      setCreateInitialMode(mode);
                      setIsCreateOpen(true);
                    }}
                    onRequireAuth={requireAuth}
                  />
                )}

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
                {visiblePosts.length > 0 ? (
                  visiblePosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      pinContext={{ type: "group", groupId: group.id }}
                      canManageGroupPins={isMember && ['ADMIN', 'MODERATOR'].includes(group.membershipRole)}
                      showPinBadge={activeTab === 'FEATURED'}
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

          {activeTab === 'SETTINGS' && isAdmin && (
            <div className="max-w-[700px] mx-auto">
              <GroupSettingsTab
                group={group}
                token={session?.session?.token}
                onGroupUpdated={fetchGroupData}
              />
            </div>
          )}
        </div>
      </main>

      <CreatePostModal
        isOpen={isCreateOpen}
        initialMode={createInitialMode}
        defaultGroupId={group.id}
        defaultGroup={group}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={fetchGroupData}
      />

      {selectedPostForComments && (
        <PostDetailsModal
          isOpen={Boolean(selectedPostForComments)}
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
          onPostUpdated={fetchGroupData}
          onRequireAuth={requireAuth}
        />
      )}
      {mediaIndex !== null && recentMedia.length > 0 && <ImageViewer images={recentMedia} initialIndex={mediaIndex} onClose={() => setMediaIndex(null)} />}
    </div>
  );
};

export default GroupDetailPage;
