import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { SettingsLayout } from '../../app/layouts/SettingsLayout';
import SettingsSidebar from '../../features/settings/components/SettingsSidebar';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { useSession } from '../../lib/auth-client';
import { profileApi } from '../../features/profile/api/profile.api';
import { ArrowLeft, ShieldCheck, Smartphone, CheckCircle2, Lock } from 'lucide-react';

const TwoFactorPage: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { data: session } = useSession();
  const token = session?.session?.token;

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    profileApi
      .getUserProfile('me', token)
      .then((data: any) => {
        if (isMounted && data?.preferences) {
          setEnabled(Boolean(data.preferences.twoFactorEnabled));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleToggle = async () => {
    setSaving(true);
    const next = !enabled;
    try {
      await profileApi.updatePreferences({ twoFactorEnabled: next }, token);
      setEnabled(next);
      notify.success(
        next
          ? 'Two-factor authentication has been enabled.'
          : 'Two-factor authentication has been turned off.'
      );
    } catch (err: any) {
      notify.error(err.message || 'Failed to update two-factor setting.');
    } finally {
      setSaving(false);
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
      <div className="max-w-xl mx-auto py-2 space-y-6 animate-in fade-in duration-200">
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
              Two-Factor Authentication (2FA)
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Add an extra layer of defense to keep unauthorized visitors out of your kitchen.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200/90 dark:border-gray-800 shadow-xs p-6 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Two-factor sign in
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  When logging in from an unrecognized device, Heshel will require a 6-digit confirmation code.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  enabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Security Methods
            </h4>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-[#2c2d2e] border border-gray-100 dark:border-gray-700">
              <Smartphone size={18} className="text-[#e02f21] shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">Email & SMS Codes</p>
                <p className="text-[11px] text-gray-500">Receive 6-digit verification codes to your verified account</p>
              </div>
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              variant={enabled ? 'danger' : 'primary'}
              size="md"
              loading={saving}
              disabled={loading || saving}
              onClick={handleToggle}
            >
              {enabled ? 'Turn Off Two-Factor' : 'Enable Two-Factor'}
            </Button>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default TwoFactorPage;

