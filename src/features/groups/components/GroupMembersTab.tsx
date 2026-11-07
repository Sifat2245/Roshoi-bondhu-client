import React from 'react';
import { Shield, User } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';

const GroupMembersTab = ({ members = [] }) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
      <h3 className="font-bold text-base text-gray-900 dark:text-white">
        Members ({members.length})
      </h3>

      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {members.map((m) => {
          const u = m.user || {};
          const isAdmin = m.role === 'ADMIN' || m.role === 'MODERATOR';
          return (
            <div key={m.id || u.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={u.image} alt={u.name} size="md" />
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{u.name}</p>
                  <p className="text-xs text-gray-500">@{u.username || 'user'}</p>
                </div>
              </div>

              {isAdmin && (
                <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-[#e02f21] text-xs font-bold flex items-center gap-1">
                  <Shield size={12} />
                  <span>{m.role}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupMembersTab;

