import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import { useLanguage } from '../../context/LanguageContext';
import SocialHeader from '../../components/common/SocialHeader';
import AdminStatsTab from '../../components/admin-dashboard/AdminStatsTab';
import AdminUsersTab from '../../components/admin-dashboard/AdminUsersTab';
import AdminReportsTab from '../../components/admin-dashboard/AdminReportsTab';
import { Shield } from 'lucide-react';
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

  const token = session?.session?.token;

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/stats`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      const data = await res.json();
      if (data.data) setStats(data.data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users?search=${encodeURIComponent(userSearch)}`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      const data = await res.json();
      if (data.data) setUsersList(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      const data = await res.json();
      if (data.data) setReportsList(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      navigate('/');
      return;
    }
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchReports()]);
      setLoading(false);
    };
    loadAll();
  }, [user, session]);

  const handleChangeRole = async (userId, role) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
        Swal.fire({ icon: 'success', title: 'Role Updated', timer: 1000, showConfirmButton: false });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
        Swal.fire({ icon: 'success', title: `User ${nextStatus}`, timer: 1000, showConfirmButton: false });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'RESOLVED' }),
      });
      if (res.ok) {
        setReportsList((prev) => prev.filter((r) => r.id !== reportId));
        Swal.fire({ icon: 'success', title: 'Report Resolved', timer: 1000, showConfirmButton: false });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  const handleDismissReport = async (reportId) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'DISMISSED' }),
      });
      if (res.ok) {
        setReportsList((prev) => prev.filter((r) => r.id !== reportId));
        Swal.fire({ icon: 'info', title: 'Report Dismissed', timer: 1000, showConfirmButton: false });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  const handleDeleteReportedPost = async (postId, reportId) => {
    const result = await Swal.fire({
      title: 'Delete this post?',
      text: 'This action will permanently delete the reported post.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      confirmButtonColor: '#e02f21',
    });
    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/post/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || ''}` },
        credentials: 'include',
      });
      if (res.ok) {
        await handleResolveReport(reportId);
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
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
                  Hesheli Admin & Moderation Portal
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
