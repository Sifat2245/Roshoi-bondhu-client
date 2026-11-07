import React, { useState } from 'react';
import { useSession } from '../../lib/auth-client';
import { SettingsLayout } from '../../app/layouts/SettingsLayout';
import SettingsSidebar from '../../features/settings/components/SettingsSidebar';
import SettingsHomeTab from '../../features/settings/components/SettingsHomeTab';
import SettingsPersonalTab from '../../features/settings/components/SettingsPersonalTab';
import SettingsSecurityTab from '../../features/settings/components/SettingsSecurityTab';
import { Link } from 'react-router';

const SettingsPage = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState('HOME'); // 'HOME', 'PERSONAL', 'SECURITY'

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
        <SettingsHomeTab
          user={user}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'PERSONAL' && (
        <SettingsPersonalTab
          user={user}
          onUserUpdated={() => window.location.reload()}
        />
      )}

      {activeTab === 'SECURITY' && (
        <SettingsSecurityTab
          user={user}
        />
      )}
    </SettingsLayout>
  );
};

export default SettingsPage;

