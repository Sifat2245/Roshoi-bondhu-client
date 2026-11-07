import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import SocialHeader from '../../widgets/navbar/SocialHeader';
import AdminStatsTab from '../../features/admin/components/AdminStatsTab';
import AdminUsersTab from '../../features/admin/components/AdminUsersTab';
import AdminReportsTab from '../../features/admin/components/AdminReportsTab';
import { Shield } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { adminApi } from '../../features/admin/api/admin.api';
import { postsApi } from '../../features/posts/api/posts.api';

const AdminPortal = () => {
  const { notify } = useToast();
  const { data: session } = useSession();
  const navigate = useNavigate();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState('STATS'); // 'STATS', 'USERS', 'REPORTS'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  const token = session?.session?.token;

  const fetchStats = useCallback(async () => {
    try {
      const data = await adminApi.getStats(token);
      if (data) setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await adminApi.getUsers(userSearch, token);
      if (data) setUsersList(data);
    } catch (err) {
      console.error(err);
    }
  }, [userSearch, token]);

  const fetchReports = useCallback(async () => {
    try {
      const data = await adminApi.getReports(token);
      if (data) setReportsList(data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    if (user && user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      navigate('/');
      return;
    }
    fetchStats();
    fetchUsers();
    fetchReports();
  }, [user, navigate, fetchStats, fetchUsers, fetchReports]);

  const handleChangeRole = async (userId, role) => {
    try {
      const res = await adminApi.updateUserRole(userId, role, token);
      if (res) {
        setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
        notify.success('Role updated');
      }
    } catch (err) {
      notify.error(err.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    try {
      const res = await adminApi.updateUserStatus(userId, nextStatus, token);
      if (res) {
        setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
        notify.success(`User set to ${nextStatus.toLowerCase()}`);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to change status');
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      const res = await adminApi.resolveReport(reportId, token);
      if (res) {
        setReportsList((prev) => prev.filter((r) => r.id !== reportId));
        notify.success('Report resolved');
      }
    } catch (err) {
      notify.error(err.message || 'Failed to resolve report');
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      const res = await adminApi.dismissReport(reportId, token);
      if (res) {
        setReportsList((prev) => prev.filter((r) => r.id !== reportId));
        notify.info('Report dismissed');
      }
    } catch (err) {
      notify.error(err.message || 'Failed to dismiss report');
    }
  };

  const handleDeleteReportedPost = async (postId, reportId) => {
    const confirmed = window.confirm(
      'Delete this post? This action will permanently delete the reported post.'
    );
    if (!confirmed) return;

    try {
      await postsApi.deletePost(postId, token);
      await handleResolveReport(reportId);
      notify.success('Reported post deleted');
    } catch (err) {
      notify.error(err.message || 'Failed to delete reported post');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      <SocialHeader />

      <div className="pt-14 w-full">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950/60 text-[#e02f21] flex items-center justify-center">
                <Shield size={22} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  Heshel Admin & Moderation Portal
                </h1>
                <p className="text-xs text-gray-500">
                  Manage users, roles, community groups, and flagged recipe posts.
                </p>
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#242526] p-1 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
              {['STATS', 'USERS', 'REPORTS'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === tab
                      ? 'bg-[#e02f21] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                  }`}
                >
                  {tab === 'STATS' ? 'Overview' : tab === 'USERS' ? 'Users' : 'Reports Queue'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Contents */}
          {activeTab === 'STATS' && <AdminStatsTab stats={stats} />}

          {activeTab === 'USERS' && (
            <AdminUsersTab
              users={usersList}
              search={userSearch}
              onSearchChange={setUserSearch}
              onSearchSubmit={(e) => {
                e.preventDefault();
                fetchUsers();
              }}
              onChangeRole={handleChangeRole}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {activeTab === 'REPORTS' && (
            <AdminReportsTab
              reports={reportsList}
              onResolveReport={handleResolveReport}
              onDismissReport={handleDismissReport}
              onDeleteReportedPost={handleDeleteReportedPost}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
