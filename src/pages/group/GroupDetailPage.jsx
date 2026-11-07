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
import { Users, Utensils } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('DISCUSSION'); // 'DISCUSSION', 'ABOUT', 'MEMBERS', 'SETTINGS'

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

  if (loading && !group) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] flex items-center justify-center">
        <span className="w-8 h-8 border-3 border-[#e02f21] border-t-transparent rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      <SocialHeader />

      <div className="pt-14 w-full">
        {/* Group Banner & Header */}
        <GroupHeader
          group={group}
          user={user}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onJoinToggle={handleJoinToggle}
          isMember={isMember}
          isAdmin={isAdmin}
        />

        {/* Content Area */}
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-6">
          {activeTab === 'DISCUSSION' && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left Column: Discussion Posts */}
              <div className="flex-1 w-full space-y-4">
                {isMember && (
                  <CreatePostTrigger
                    onClick={(mode) => {
                      setCreateInitialMode(mode);
                      setIsCreateOpen(true);
                    }}
                    onRequireAuth={requireAuth}
                  />
                )}

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

              {/* Right Column: About Card */}
              <div className="w-full lg:w-[360px] shrink-0 sticky top-18">
                <GroupAboutCard group={group} />
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
