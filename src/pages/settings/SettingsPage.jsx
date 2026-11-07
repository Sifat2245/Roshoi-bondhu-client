import React, { useState } from 'react';
import { useSession } from '../../lib/auth-client';
import { useLanguage } from '../../context/LanguageContext';
import SocialHeader from '../../components/common/SocialHeader';
import SettingsSidebar from '../../components/settings/SettingsSidebar';
import SettingsHomeTab from '../../components/settings/SettingsHomeTab';
import SettingsPersonalTab from '../../components/settings/SettingsPersonalTab';
import SettingsSecurityTab from '../../components/settings/SettingsSecurityTab';
import { Link } from 'react-router';

const SettingsPage = () => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState('HOME'); // 'HOME', 'PERSONAL', 'SECURITY'

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#18191a] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-black text-gray-900 dark:text-white">
          Sign In Required
        </h2>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          Please sign in to access your Hesheli account settings and personal details.
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
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Fixed Topbar */}
      <SocialHeader />

      {/* Main 2-Column Settings Layout */}
      <div className="pt-14 w-full">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Sidebar */}
            <div className="w-full lg:w-[300px] shrink-0 lg:sticky lg:top-18 self-start">
              <SettingsSidebar
                activeTab={activeTab}
                onSelectTab={setActiveTab}
              />
            </div>

            {/* Right Content Area */}
            <main className="flex-1 w-full max-w-[760px]">
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
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

