import React from 'react';
import { useSession } from '../../lib/auth-client';
import { useAuth } from '../../context/AuthContext';
import { SettingsLayout } from '../../app/layouts/SettingsLayout';
import SettingsSidebar from '../../features/settings/components/SettingsSidebar';
import SettingsMobileMenu from '../../features/settings/components/SettingsMobileMenu';
import SettingsHomeTab from '../../features/settings/components/SettingsHomeTab';
import SettingsSecurityTab from '../../features/settings/components/SettingsSecurityTab';
import SettingsManageAccountTab from '../../features/settings/components/SettingsManageAccountTab';
import { Link, useSearchParams } from 'react-router';
import SettingsPersonalTab from '../../features/settings/components/SettingsPersonalTab';
import SettingsPreferences from '../../features/settings/components/SettingsPreferences';
import SettingsBlockingTab from '../../features/settings/components/SettingsBlockingTab';
import SettingsMediaTab from '../../features/settings/components/SettingsMediaTab';
import SettingsTrashTab from '../../features/settings/components/SettingsTrashTab';
import { ArrowLeft } from 'lucide-react';

const SettingsPage = () => {
  const { user: authUser, refetchUser } = useAuth();
  const { data: session, refetch: refetchSession } = useSession();
  const user = authUser || session?.user;

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const allowedTabs = ['HOME', 'PERSONAL', 'SECURITY', 'MANAGE', 'MEDIA', 'BLOCKING', 'TRASH'];
  const hasSelectedTab = Boolean(rawTab && allowedTabs.includes(rawTab));
  const activeTab = hasSelectedTab ? rawTab! : 'HOME';
  const isMobileSubpage = hasSelectedTab;

  const setActiveTab = (tab: string) => {
    if (!tab) {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

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
      isMobileSubpage={isMobileSubpage}
      sidebar={
        <>
          <div className="lg:hidden">
            <SettingsMobileMenu
              user={user}
              onSelectTab={setActiveTab}
            />
          </div>
          <div className="hidden lg:block">
            <SettingsSidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
            />
          </div>
        </>
      }
    >
      {/* Mobile Back Button to Settings Menu */}
      {isMobileSubpage && (
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('')}
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-[#e02f21] py-1 cursor-pointer transition"
          >
            <ArrowLeft size={16} />
            <span>Settings</span>
          </button>
        </div>
      )}

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

      {activeTab === 'BLOCKING' && (
        <SettingsBlockingTab />
      )}

      {activeTab === 'MEDIA' && (
        <SettingsMediaTab />
      )}

      {activeTab === 'TRASH' && (
        <SettingsTrashTab />
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

