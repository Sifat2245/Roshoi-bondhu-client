import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import GroupHeader from '../../features/groups/components/GroupHeader';
import GroupAboutCard from '../../features/groups/components/GroupAboutCard';
import GroupMembersTab from '../../features/groups/components/GroupMembersTab';
import GroupSettingsTab from '../../features/groups/components/GroupSettingsTab';
import CreatePostTrigger from '../../features/posts/components/CreatePostTrigger';
import PostCard from '../../features/posts/components/PostCard';
import CreatePostModal from '../../features/posts/components/CreatePostModal';
import PostDetailsModal from '../../features/posts/components/PostDetailsModal';
import { GroupHeaderSkeleton, PostSkeleton } from '../../components/ui/Skeleton';
import groupsApi from '../../features/groups/api/groups.api';
import postsApi from '../../features/posts/api/posts.api';
import { Utensils, Info, Sparkles, ChevronDown } from 'lucide-react';

const GroupDetailPage = () => {
  const { slug } = useParams();
  const { data: session } = useSession();
  const navigate = useNavigate();
  const user = session?.user;

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('DISCUSSION'); // 'DISCUSSION', 'FEATURED', 'ABOUT', 'MEMBERS', 'SETTINGS'

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState('CASUAL');
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

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
        const groupPosts = await postsApi.getPosts({ groupId: data.id }, session?.session?.token);
        setPosts(groupPosts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug, session]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleJoinToggle = async () => {
    if (!user) return requireAuth();

    try {
      if (group.isMember) {
        await groupsApi.leaveGroup(group.id, session?.session?.token);
      } else {
        await groupsApi.joinGroup(group.id, session?.session?.token);
      }
      fetchGroupData();
    } catch (err) {
      console.error('Join/Leave error:', err);
    }
  };

  // Skeleton Loading State
  if (loading && !group) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
        <SocialHeader />
        <div className="pt-[100px] md:pt-14 w-full">
          <GroupHeaderSkeleton />
          <div className="max-w-[1095px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
        </div>
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

  // Sample media photos for the "Recent media" widget matching Image 3
  const groupMediaPhotos = posts.map((p) => p.image).filter(Boolean);
  const recentMedia = groupMediaPhotos.length > 0 ? groupMediaPhotos : [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      <SocialHeader />

      <div className="pt-[100px] md:pt-14 w-full">
        {/* Contained Group Banner & Header */}
        <GroupHeader
          group={group}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onJoinToggle={handleJoinToggle}
          isMember={isMember}
          isAdmin={isAdmin}
        />

        {/* Content Area with Generous Gap */}
        <div className="max-w-[1095px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {(activeTab === 'DISCUSSION' || activeTab === 'FEATURED') && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left Column: Discussion Posts & Featured Section */}
              <div className="flex-1 w-full space-y-4">
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
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                    <span>Featured</span>
                    <Info size={13} className="text-gray-400" />
                  </div>

                  <div className="p-3.5 bg-gradient-to-r from-red-50 to-orange-50 dark:from-[#3a3b3c]/60 dark:to-gray-800 rounded-xl border border-red-100 dark:border-gray-700 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#e02f21] text-white flex items-center justify-center shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-gray-900 dark:text-white">
                        Welcome to {group.name}!
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">
                        Share your authentic family recipes, review local dining spots, and connect with fellow chefs. Be kind, credit original recipes, and happy cooking!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sort / Filter Row */}
                <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-1">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                    <span>Most relevant</span>
                    <ChevronDown size={14} />
                  </div>
                  <span>{posts.length} posts</span>
                </div>

                {/* Post Cards Stream */}
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onOpenComments={(selected) => setSelectedPostForComments(selected)}
                      onOpenShare={() => {}}
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
                    <p className="text-xs text-gray-500 font-medium">No posts in this group yet. Be the first to share!</p>
                  </div>
                )}
              </div>

              {/* Right Column: About Card + Recent Media */}
              <div className="w-full lg:w-[360px] shrink-0 space-y-4 sticky top-18">
                {/* 1. About Card */}
                <GroupAboutCard group={group} />

                {/* 2. Recent Media Card */}
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      Recent media
                    </h3>
                    <span className="text-[11px] font-semibold text-[#e02f21] hover:underline cursor-pointer">
                      See all
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                    {recentMedia.slice(0, 4).map((img, idx) => (
                      <div key={idx} className="h-28 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={img}
                          alt="Media"
                          className="w-full h-full object-cover hover:scale-105 transition duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ABOUT' && (
            <div className="max-w-[700px] mx-auto">
              <GroupAboutCard group={group} />
            </div>
          )}

          {activeTab === 'MEMBERS' && (
            <div className="max-w-[700px] mx-auto">
              <GroupMembersTab members={group.members || []} />
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
      </div>

      <CreatePostModal
        isOpen={isCreateOpen}
        initialMode={createInitialMode}
        defaultGroupId={group.id}
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
    </div>
  );
};

export default GroupDetailPage;
