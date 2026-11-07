import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSession } from '../lib/auth-client';
import { useLanguage } from '../context/LanguageContext';
import SocialHeader from '../components/common/SocialHeader';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import {
  Shield,
  Users,
  Utensils,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Lock,
  ChevronRight,
} from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminPortal = () => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState('STATS'); // 'STATS', 'USERS', 'REPORTS'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  // Fetch Platform Stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/stats`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
      });
      const data = await res.json();
      if (data.data) {
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users?search=${encodeURIComponent(userSearch)}`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
      });
      const data = await res.json();
      if (data.data) {
        setUsersList(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Reports
  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports?status=PENDING`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
      });
      const data = await res.json();
      if (data.data) {
        setReportsList(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user && ['ADMIN', 'MODERATOR'].includes(user.role)) {
      setLoading(true);
      Promise.all([fetchStats(), fetchUsers(), fetchReports()]).finally(() =>
        setLoading(false)
      );
    } else {
      setLoading(false);
    }
  }, [user, session]);

  // Update Role (Admin only)
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({ icon: 'success', title: 'Role Updated', timer: 1500, showConfirmButton: false });
        fetchUsers();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  // Ban/Unban user
  const handleToggleBan = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        Swal.fire({ icon: 'success', title: data.message, timer: 1500, showConfirmButton: false });
        fetchUsers();
        fetchStats();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  // Resolve / Dismiss Report
  const handleResolveReport = async (reportId, resolutionStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          status: resolutionStatus,
          adminNote: `Processed by ${user.name}`,
        }),
      });
      if (res.ok) {
        Swal.fire({ icon: 'success', title: `Report ${resolutionStatus}`, timer: 1500, showConfirmButton: false });
        fetchReports();
        fetchStats();
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  // Guard: Not an Admin/Moderator
  if (!loading && (!user || !['ADMIN', 'MODERATOR'].includes(user.role))) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center mb-4">
          <Lock size={32} />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          Restricted Staff Area
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mt-2">
          This portal is reserved strictly for Hesheli Platform Administrators and Community Moderators.
        </p>

        {!user ? (
          <Link
            to="/login"
            className="mt-6 px-6 py-2.5 bg-[#e02f21] hover:bg-[#c22417] text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            Sign in with Staff Account
          </Link>
        ) : (
          <Link
            to="/"
            className="mt-6 px-6 py-2.5 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition"
          >
            Return to Feed
          </Link>
        )}
      </div>
    );
  }

  const isFullAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      <SocialHeader />

      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-6">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-gray-900 to-black p-6 sm:p-8 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
                {user?.role} Control Panel
              </span>
              <span className="text-xs text-gray-400">Route: /admin-portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Hesheli Platform Oversight
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Manage platform users, roles, community groups, and content moderation queues.
            </p>
          </div>

          <Link
            to="/"
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Back to Social Feed</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#242526] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('STATS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'STATS'
                ? 'bg-[#e02f21] text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Shield size={14} />
            <span>Platform Stats</span>
          </button>

          {isFullAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('USERS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'USERS'
                  ? 'bg-[#e02f21] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Users size={14} />
              <span>User Directory</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('REPORTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'REPORTS'
                ? 'bg-[#e02f21] text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Flag size={14} />
            <span>Moderation Queue ({reportsList.length})</span>
          </button>
        </div>

        {/* TAB 1: Platform Stats */}
        {activeTab === 'STATS' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-[#242526] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs text-center">
                <span className="text-2xl font-black text-[#e02f21]">{stats.totalUsers}</span>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Total Users</p>
              </div>
              <div className="bg-white dark:bg-[#242526] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs text-center">
                <span className="text-2xl font-black text-amber-500">{stats.totalRecipes}</span>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Total Recipes</p>
              </div>
              <div className="bg-white dark:bg-[#242526] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs text-center">
                <span className="text-2xl font-black text-blue-500">{stats.totalPosts}</span>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Total Posts</p>
              </div>
              <div className="bg-white dark:bg-[#242526] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs text-center">
                <span className="text-2xl font-black text-purple-500">{stats.totalGroups}</span>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Active Groups</p>
              </div>
              <div className="bg-white dark:bg-[#242526] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs text-center">
                <span className="text-2xl font-black text-rose-500">{stats.pendingReports}</span>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Reports Pending</p>
              </div>
              <div className="bg-white dark:bg-[#242526] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs text-center">
                <span className="text-2xl font-black text-gray-400">{stats.bannedUsers}</span>
                <p className="text-[11px] text-gray-500 font-semibold mt-1">Banned Users</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: User Directory (Admin only) */}
        {activeTab === 'USERS' && isFullAdmin && (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-base">User Accounts & Roles</h3>
              <div className="relative max-w-xs w-full">
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  placeholder="Search user by name or email..."
                  className="w-full pl-9 pr-4 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Activity</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:border-gray-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={u.image} alt={u.name} size="sm" />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-[10px] text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          disabled={u.id === user.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-gray-100 dark:bg-gray-800 text-xs font-bold rounded-lg px-2 py-1 focus:outline-none"
                        >
                          <option value="USER">USER</option>
                          <option value="MODERATOR">MODERATOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      <td className="py-3 px-3">
                        {u.isBanned ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                            BANNED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-gray-500">
                        {u.postCount || 0} posts • {u.groupCount || 0} groups
                      </td>

                      <td className="py-3 px-3 text-right">
                        {u.id !== user.id && (
                          <button
                            type="button"
                            onClick={() => handleToggleBan(u.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                              u.isBanned
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            {u.isBanned ? 'Unban' : 'Ban User'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Moderation Queue */}
        {activeTab === 'REPORTS' && (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="font-bold text-base">Community Reports Queue</h3>

            {reportsList.length > 0 ? (
              <div className="space-y-3">
                {reportsList.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-[#f0f2f5] dark:bg-[#3a3b3c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px]">
                          {r.targetType}
                        </span>
                        <span className="text-gray-400">
                          Reported by <strong>{r.reporter?.name}</strong> ({r.reporter?.email})
                        </span>
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 mt-1">
                        <strong>Reason:</strong> {r.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleResolveReport(r.id, 'RESOLVED')}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleResolveReport(r.id, 'DISMISSED')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 text-xs">
                <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                Moderation queue is clean. No active reports!
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPortal;
