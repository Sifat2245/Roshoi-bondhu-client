import React from 'react';
import { Search, Shield, Lock, CheckCircle } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const AdminUsersTab = ({
  users = [],
  search,
  onSearchChange,
  onSearchSubmit,
  onChangeRole,
  onToggleStatus,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden space-y-4 p-5">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <h3 className="font-bold text-base text-gray-900 dark:text-white">
          Platform Users ({users.length})
        </h3>
        <form onSubmit={onSearchSubmit} className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email or username..."
            className="w-full pl-9 pr-3.5 py-2 bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white focus:outline-none focus:border-[#e02f21]"
          />
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-200 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-[#3a3b3c]/40">
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar src={u.image} alt={u.name} size="sm" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-[11px] text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) => onChangeRole(u.id, e.target.value)}
                    className="px-2 py-1 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="USER">USER</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === 'BLOCKED'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                    }`}
                  >
                    {u.status || 'ACTIVE'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Button
                    onClick={() => onToggleStatus(u.id, u.status)}
                    variant={u.status === 'BLOCKED' ? 'primary' : 'outline'}
                    className="text-[11px] px-3 py-1 font-bold rounded-lg"
                  >
                    {u.status === 'BLOCKED' ? 'Unblock' : 'Block User'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsersTab;

