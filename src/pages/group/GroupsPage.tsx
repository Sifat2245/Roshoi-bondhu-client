import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import { GroupLayout } from '../../app/layouts/GroupLayout';
import GroupCard from '../../features/groups/components/GroupCard';
import GroupSearchBar from '../../features/groups/components/GroupSearchBar';
import CreateGroupModal from '../../features/groups/components/CreateGroupModal';
import { GroupCardSkeleton } from '../../components/ui/Skeleton';
import groupsApi from '../../features/groups/api/groups.api';
import { Users } from 'lucide-react';

const GroupsPage = () => {
  const { data: session } = useSession();
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

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await groupsApi.getGroups(
        {
          myGroups: activeTab === 'MY',
          search,
        },
        session?.session?.token
      );
      setGroups(data);
    } catch (err) {
      console.error('Failed to load groups', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, session]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleJoinToggle = async (group) => {
    if (!user) return requireAuth();

    try {
      if (group.isMember) {
        await groupsApi.leaveGroup(group.id, session?.session?.token);
      } else {
        await groupsApi.joinGroup(group.id, session?.session?.token);
      }

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
    } catch (err) {
      console.error('Join/Leave error:', err);
    }
  };

  return (
    <GroupLayout containerClassName="max-w-[1280px] mx-auto">
      <div className="space-y-6">
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

        {/* Groups Grid / Skeleton Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <GroupCardSkeleton />
            <GroupCardSkeleton />
            <GroupCardSkeleton />
            <GroupCardSkeleton />
            <GroupCardSkeleton />
            <GroupCardSkeleton />
          </div>
        ) : groups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
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
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        token={session?.session?.token}
        onGroupCreated={fetchGroups}
      />
    </GroupLayout>
  );
};

export default GroupsPage;
