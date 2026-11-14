import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { SettingsLayout } from '../../app/layouts/SettingsLayout';
import SettingsSidebar from '../../features/settings/components/SettingsSidebar';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { useSession, authApi, signOut } from '../../lib/auth-client';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Laptop, Smartphone, LogOut, RefreshCw, Globe, Shield } from 'lucide-react';

interface SessionItem {
  id: string;
  device: string;
  type: 'MOBILE' | 'DESKTOP';
  ipAddress?: string;
  location?: string;
  lastActive: string;
  activeNow?: boolean;
}

const ActiveSessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { logoutUser } = useAuth();
  const { data: session } = useSession();
  const token = session?.session?.token;

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingAll, setRevokingAll] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authApi.getSessions(token);
      setSessions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.warn('Could not load sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSingle = async (s: SessionItem) => {
    setRevokingId(s.id);
    try {
      if (s.activeNow) {
        // Logging out current session
        if (logoutUser) {
          await logoutUser();
        } else {
          await signOut();
        }
        navigate('/login');
        notify.success('Signed out of current session.');
        return;
      }

      await authApi.revokeSession(s.id, token);
      notify.success('Session signed out successfully.');
      setSessions((prev) => prev.filter((item) => item.id !== s.id));
    } catch (err: any) {
      notify.error(err.message || 'Failed to revoke session.');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    setRevokingAll(true);
    try {
      await authApi.revokeOtherSessions(token);
      notify.success('Logged out of all other sessions.');
      await fetchSessions();
    } catch (err: any) {
      notify.error(err.message || 'Failed to revoke other sessions.');
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <SettingsLayout
      isMobileSubpage={true}
      sidebar={
        <SettingsSidebar
          activeTab="SECURITY"
          onSelectTab={(tab) => navigate(tab === 'HOME' ? '/settings' : `/settings?tab=${tab}`)}
        />
      }
    >
      <div className="max-w-xl mx-auto py-2 space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/settings?tab=SECURITY')}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Where you're logged in
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Review devices that currently have access to your account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchSessions}
            disabled={loading}
            title="Refresh sessions"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="space-y-3">
            {loading && !sessions.length ? (
              <div className="py-8 text-center text-xs text-gray-400 animate-pulse">
                Loading active devices...
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#2c2d2e] text-center text-xs text-gray-500">
                Current browser session is active.
              </div>
            ) : (
              sessions.map((s, idx) => {
                const isItemRevoking = revokingId === s.id;
                return (
                  <div
                    key={s.id || idx}
                    className="p-4 bg-gray-50/80 dark:bg-[#2b2c2d] rounded-2xl border border-gray-100 dark:border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[#e02f21] shrink-0 mt-0.5">
                        {s.type === 'MOBILE' ? (
                          <Smartphone size={20} />
                        ) : (
                          <Laptop size={20} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-gray-900 dark:text-white break-words">
                            {s.device || 'Web Browser'}
                          </p>
                          {s.activeNow ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              This Device
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                          <span>{s.lastActive}</span>
                          {s.ipAddress && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-[11px] text-gray-600 dark:text-gray-400">
                                IP: {s.ipAddress}
                              </span>
                            </>
                          )}
                          {s.location && (
                            <>
                              <span>•</span>
                              <span>{s.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/50 dark:border-gray-700/50 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant={s.activeNow ? 'outline' : 'danger'}
                        size="sm"
                        loading={isItemRevoking}
                        disabled={isItemRevoking || revokingAll}
                        onClick={() => handleRevokeSingle(s)}
                        className="text-xs px-3 py-1.5 cursor-pointer w-full sm:w-auto justify-center whitespace-nowrap"
                      >
                        {s.activeNow ? 'Log out' : 'Sign out'}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {sessions.length > 1 && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="danger"
                size="md"
                loading={revokingAll}
                disabled={revokingAll || Boolean(revokingId)}
                onClick={handleRevokeAllOthers}
                icon={LogOut}
                className="w-full cursor-pointer"
              >
                Log out of all other sessions
              </Button>
            </div>
          )}
        </div>
      </div>
    </SettingsLayout>
  );
};

export default ActiveSessionsPage;
