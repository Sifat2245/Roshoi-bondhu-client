import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import { useLanguage } from '../../context/LanguageContext';
import SocialHeader from '../../components/common/SocialHeader';
import LeftSidebar from '../../components/LeftSidebar';
import GroupCard from '../../components/groups/GroupCard';
import GroupSearchBar from '../../components/groups/GroupSearchBar';
import CreateGroupModal from '../../components/groups/CreateGroupModal';
import { Users } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GroupsPage = () => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const user = session?.user;

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'MY'
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const requireAuth = () => {
    navigate('/login');
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'MY') params.set('myGroups', 'true');
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`${API_BASE}/api/group?${params.toString()}`, {
        credentials: 'include',
        headers: session?.session?.token
          ? { Authorization: `Bearer ${session.session.token}` }
          : {},
      });

      const json = await res.json();
      if (json.data) {
        setGroups(json.data);
      }
    } catch (err) {
      console.error('Failed to load groups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [activeTab, session]);

  const handleJoinToggle = async (group) => {
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
        setGroups((prev) =>
          prev.map((g) =>
            g.id === group.id
              ? {
                  ...g,
                  isMember: !g.isMember,
                  membersCount: g.isMember ? g.membersCount - 1 : g.membersCount + 1,
                }
              : g
          )
        );
      }
    } catch (err) {
      console.error('Join/Leave error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      <SocialHeader />

      <div className="pt-14 w-full">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex gap-6 items-start">
            {/* Left Sidebar */}
            <div className="hidden lg:block w-[280px] shrink-0 sticky top-18 self-start">
              <LeftSidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 space-y-6">
              <GroupSearchBar
                search={search}
                onSearchChange={setSearch}
                onSearchSubmit={(e) => {
                  e.preventDefault();
                  fetchGroups();
                }}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onOpenCreate={() => (user ? setIsCreateModalOpen(true) : requireAuth())}
              />

              {/* Groups Grid */}
              {loading ? (
                <div className="py-20 text-center">
                  <span className="w-8 h-8 border-3 border-[#e02f21] border-t-transparent rounded-full animate-spin inline-block" />
                </div>
              ) : groups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {groups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      user={user}
                      onJoinToggle={handleJoinToggle}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 space-y-2">
                  <Users size={32} className="mx-auto text-gray-400" />
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No Groups Found</p>
                  <p className="text-xs text-gray-500">Try a different search or create your own group!</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        token={session?.session?.token}
        onGroupCreated={fetchGroups}
      />
    </div>
  );
};

export default GroupsPage;
