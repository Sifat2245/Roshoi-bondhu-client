import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { SettingsLayout } from '../../app/layouts/SettingsLayout';
import SettingsSidebar from '../../features/settings/components/SettingsSidebar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useSession, passkey, authApi } from '../../lib/auth-client';
import {
  usePasskeysQuery,
  useInvalidateProfileQueries,
} from '../../features/profile/hooks/useProfileQueries';
import {
  ArrowLeft,
  KeyRound,
  Trash2,
  Plus,
  Fingerprint,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export const PasskeysPage: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data: session } = useSession();
  const token = session?.session?.token;

  const { data: passkeys = [], isLoading } = usePasskeysQuery(token);
  const { invalidatePasskeys } = useInvalidateProfileQueries();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setPasskeyName('');
    setIsAddModalOpen(true);
  };

  const handleAddPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const name = passkeyName.trim() || 'My Passkey';
      const res = await passkey.addPasskey({
        name,
      });

      if (res?.error) {
        if (res.error.code === 'REGISTRATION_CANCELLED') {
          return;
        }
        throw new Error(res.error.message || 'Failed to create passkey.');
      }

      notify.success(`Passkey "${name}" has been registered successfully!`, 'Passkey Added');
      setIsAddModalOpen(false);
      setPasskeyName('');
      invalidatePasskeys();
    } catch (err: any) {
      notify.error(err.message || 'Could not register passkey on this device.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePasskey = async (id: string, name?: string) => {
    if (!window.confirm(`Are you sure you want to remove the passkey "${name || 'this passkey'}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await authApi.deletePasskey(id, token);
      notify.success('Passkey removed successfully.');
      invalidatePasskeys();
    } catch (err: any) {
      notify.error(err.message || 'Failed to remove passkey.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SettingsLayout
      sidebar={
        <SettingsSidebar
          activeTab="SECURITY"
          onSelectTab={(tab) => navigate(tab === 'HOME' ? '/settings' : `/settings?tab=${tab}`)}
        />
      }
    >
      <div className="max-w-2xl mx-auto py-2 space-y-6 animate-in fade-in duration-200">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/settings?tab=SECURITY')}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
              aria-label="Back to Security Settings"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Passkeys
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Sign in fast and securely with fingerprint, Face ID, or your device lock.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            className="cursor-pointer font-bold flex items-center gap-1.5 shrink-0"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Passkey</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Info Banner */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-xs p-5 flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Fingerprint size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Phishing-Resistant & Passwordless
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Passkeys use end-to-end cryptographic credentials synced through your device ecosystem (Apple iCloud Keychain, Google Password Manager, or Windows Hello). You don&apos;t have to remember or type a password.
            </p>
          </div>
        </div>

        {/* Passkeys List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Registered Passkeys ({passkeys.length})
          </h2>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
              <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
            </div>
          ) : passkeys.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center">
                <KeyRound size={22} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  No passkeys registered yet
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  Add this device to sign in instantly next time with Touch ID, Face ID, or Windows Hello.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAdd}
                className="cursor-pointer font-bold text-xs"
              >
                Create your first passkey
              </Button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-xs divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
              {passkeys.map((pk: any) => (
                <div
                  key={pk.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-[#2c2d2e] transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
                      <KeyRound size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                          {pk.name || 'Device Passkey'}
                        </p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Added {new Date(pk.createdAt).toLocaleDateString()}
                        </span>
                        {pk.deviceType && (
                          <span className="capitalize">• {pk.deviceType}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePasskey(pk.id, pk.name)}
                    disabled={deletingId === pk.id}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer disabled:opacity-50"
                    title="Remove passkey"
                    aria-label={`Remove passkey ${pk.name || ''}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Passkey Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          if (!actionLoading) setIsAddModalOpen(false);
        }}
        title="Register a New Passkey"
      >
        <form onSubmit={handleAddPasskey} className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-[#343536] text-xs text-gray-600 dark:text-gray-300">
            <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Your browser will prompt you to use your biometric sensor (fingerprint, Touch ID, Face ID) or device pin.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              Passkey Name (Optional)
            </label>
            <input
              type="text"
              value={passkeyName}
              onChange={(e) => setPasskeyName(e.target.value)}
              placeholder="e.g. Work MacBook, iPhone 15, Home PC"
              className="w-full px-4 py-2.5 bg-[#f0f2f5] dark:bg-[#343536] rounded-xl text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
              disabled={actionLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={actionLoading}
              disabled={actionLoading}
              className="cursor-pointer font-bold"
            >
              Continue to Biometrics
            </Button>
          </div>
        </form>
      </Modal>
    </SettingsLayout>
  );
};

export default PasskeysPage;

