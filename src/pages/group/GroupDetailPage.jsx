import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import { useLanguage } from '../../context/LanguageContext';
import SocialHeader from '../../components/common/SocialHeader';
import GroupHeader from '../../components/group-details/GroupHeader';
import GroupAboutCard from '../../components/group-details/GroupAboutCard';
import GroupMembersTab from '../../components/group-details/GroupMembersTab';
import GroupSettingsTab from '../../components/group-details/GroupSettingsTab';
import CreatePostTrigger from '../../components/feed/CreatePostTrigger';
import PostCard from '../../components/feed/PostCard';
import CreatePostModal from '../../components/modals/CreatePostModal';
import PostDetailsModal from '../../components/modals/PostDetailsModal';
import { GroupHeaderSkeleton, PostSkeleton } from '../../components/ui/Skeleton';
import { Users, Utensils, Info, Image as ImageIcon, Sparkles, ChevronDown } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('DISCUSSION'); // 'DISCUSSION', 'FEATURED', 'ABOUT', 'MEMBERS', 'SETTINGS'

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialMode, setCreateInitialMode] = useState('CASUAL');
  const [selectedPostForComments, setSelectedPostForComments] = useState(null);

  const requireAuth = () => {
    navigate('/login');
  };

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

  const handleJoinToggle = async () => {
    if (!user) return requireAuth();

    try {
      const endpoint = group.isMember ? 'leave' : 'join';
      const res = await fetch(`${API_BASE}/api/group/${group.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
      });

      if (res.ok) {
        fetchGroupData();
      }
    } catch (err) {
      console.error('Join/Leave error:', err);
    }
  };

  // Skeleton Loading State (No full-page spinner!)
  if (loading && !group) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
        <SocialHeader />
        <div className="pt-14 w-full">
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
  const isAdmin = group.membershipRole === 'ADMIN' || user?.role === 'ADMIN';

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

      <div className="pt-14 w-full">
        {/* Contained Group Banner & Header (Matching Image 3) */}
        <GroupHeader
          group={group}
          user={user}
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
              {/* Left Column: Discussion Posts & Featured Section (Matching Image 3) */}
              <div className="flex-1 w-full space-y-4">
                {/* Write Something Card (Facebook Style) */}
                {isMember && (
                  <CreatePostTrigger
                    onClick={(mode) => {
                      setCreateInitialMode(mode);
                      setIsCreateOpen(true);
                    }}
                    onRequireAuth={requireAuth}
                  />
                )}

                {/* Featured Section (Matching Image 3) */}
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
                    />
                  ))
                ) : (
                  <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-100 dark:border-gray-800 space-y-2">
                    <Utensils size={28} className="mx-auto text-gray-400" />
                    <p className="text-xs text-gray-500 font-medium">No posts in this group yet. Be the first to share!</p>
                  </div>
                )}
              </div>

              {/* Right Column: About Card + Recent Media (Matching Image 3) */}
              <div className="w-full lg:w-[360px] shrink-0 space-y-4 sticky top-18">
                {/* 1. About Card */}
                <GroupAboutCard group={group} />

                {/* 2. Recent Media Card (Matching Image 3) */}
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
