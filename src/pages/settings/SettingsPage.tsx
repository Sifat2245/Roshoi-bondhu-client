import React from 'react';
import { useSession } from '../../lib/auth-client';
import { useAuth } from '../../context/AuthContext';
import { SettingsLayout } from '../../app/layouts/SettingsLayout';
import SettingsSidebar from '../../features/settings/components/SettingsSidebar';
import SettingsHomeTab from '../../features/settings/components/SettingsHomeTab';
import SettingsSecurityTab from '../../features/settings/components/SettingsSecurityTab';
import SettingsManageAccountTab from '../../features/settings/components/SettingsManageAccountTab';
import { Link, useSearchParams } from 'react-router';
import SettingsPersonalTab from '../../features/settings/components/SettingsPersonalTab';
import SettingsPreferences from '../../features/settings/components/SettingsPreferences';

const SettingsPage = () => {
  const { user: authUser, refetchUser } = useAuth();
  const { data: session, refetch: refetchSession } = useSession();
  const user = authUser || session?.user;

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab') || 'HOME';
  const activeTab = ['HOME', 'PERSONAL', 'SECURITY', 'MANAGE'].includes(requestedTab) ? requestedTab : 'HOME';
  const setActiveTab = (tab: string) => setSearchParams(tab === 'HOME' ? {} : { tab });

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#18191a] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">
          Sign In Required
        </h2>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Please sign in to access your Heshel account settings and personal details.
        </p>
        <Link
          to="/login"
          className="mt-4 px-6 py-2.5 bg-[#e02f21] hover:bg-[#c22417] text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <SettingsLayout
      sidebar={
        <SettingsSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      }
    >
      {activeTab === 'HOME' && (
        <div className="space-y-6">
        <SettingsHomeTab
          user={user}
          onNavigateTab={setActiveTab}
        />
        <SettingsPreferences />
        </div>
      )}
      {activeTab === 'PERSONAL' && (
        <SettingsPersonalTab
          user={user}
          onUserUpdated={() => {
            if (refetchUser) refetchUser();
            if (refetchSession) refetchSession();
          }}
        />
      )}

      {activeTab === 'SECURITY' && (
        <SettingsSecurityTab
          user={user}
        />
      )}

      {activeTab === 'MANAGE' && (
        <SettingsManageAccountTab
          user={user}
        />
      )}
    </SettingsLayout>
  );
};

export default SettingsPage;

