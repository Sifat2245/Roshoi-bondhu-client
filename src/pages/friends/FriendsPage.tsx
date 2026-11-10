import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useSession } from '../../lib/auth-client';
import { FriendsLayout } from '../../app/layouts/FriendsLayout';
import FriendsSidebar from '../../features/friends/components/FriendsSidebar';
import FriendRequestsView from '../../features/friends/components/FriendRequestsView';
import FriendSuggestionsView from '../../features/friends/components/FriendSuggestionsView';
import AllFriendsSplitView from '../../features/friends/components/AllFriendsSplitView';
import BirthdaysView from '../../features/friends/components/BirthdaysView';
import CustomListsView from '../../features/friends/components/CustomListsView';
import { useToast } from '../../context/ToastContext';
import { friendsApi } from '../../features/friends/api/friends.api';
import { isDemoMode, readDemo, writeDemo } from '../../lib/demo/demo-store';

const FriendsPage = () => {
  const { data: session } = useSession();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') || 'home';
  const [activeSection, setActiveSection] = useState(tabParam);

  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = session?.session?.token;

  const mobileNavTabs = [
    { id: 'home', label: 'Home', badge: 0 },
    { id: 'requests', label: 'Friend requests', badge: requests.length },
    { id: 'suggestions', label: 'Suggestions', badge: 0 },
    { id: 'all', label: 'All friends', badge: 0 },
    { id: 'birthdays', label: 'Birthdays', badge: 0 },
    { id: 'custom', label: 'Custom lists', badge: 0 },
  ];

  useEffect(() => {
    setActiveSection(tabParam);
  }, [tabParam]);

  const handleSelectSection = (sectionId) => {
    setActiveSection(sectionId);
    setSearchParams({ tab: sectionId });
  };

  const fetchFriendsData = useCallback(async () => {
    setLoading(true);
    try {
      const [friendsData, suggData] = await Promise.all([
        friendsApi.getAllFriends(token),
        friendsApi.getSuggestions(token),
      ]);

      if (friendsData) {
        setFriends(friendsData);
        // Put half into requests to demonstrate the interactive friend requests grid matching user's Image 1
        setRequests(isDemoMode() ? readDemo().users.filter((person) => readDemo().requests.includes(person.id)) : []);
      }
      if (suggData) {
        setSuggestions(suggData);
      }
    } catch (err) {
      console.error('Failed to load friends data:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFriendsData();
  }, [fetchFriendsData]);

  const handleConfirmRequest = (userId) => {
    if (isDemoMode()) { const state = readDemo(); state.requests = state.requests.filter((id) => id !== userId); if (!state.friends.includes(userId)) state.friends.push(userId); writeDemo(state); setFriends(state.users.filter((person) => state.friends.includes(person.id))); }
    setRequests((prev) => prev.filter((r) => r.id !== userId));
    notify.success('Friend request confirmed');
  };

  const handleDeleteRequest = (userId) => {
    if (isDemoMode()) { const state = readDemo(); state.requests = state.requests.filter((id) => id !== userId); writeDemo(state); }
    setRequests((prev) => prev.filter((r) => r.id !== userId));
    notify.info('Friend request removed');
  };

  const handleAddFriend = async (userId) => {
    try {
      await friendsApi.sendFriendRequest(userId, token);
      setSuggestions((prev) => prev.filter((s) => s.id !== userId));
      notify.success('Friend request sent');
    } catch (err) {
      notify.error(err.message || 'Error sending request');
    }
  };

  const handleRemoveSuggestion = (userId) => {
    if (isDemoMode()) { const state = readDemo(); state.settings.hiddenSuggestions = [...(state.settings.hiddenSuggestions || []), userId]; writeDemo(state); }
    setSuggestions((prev) => prev.filter((s) => s.id !== userId));
  };

  return (
    <FriendsLayout
      sidebar={
        <FriendsSidebar
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          requestCount={requests.length}
        />
      }
    >
      <div className="max-w-[1280px] mx-auto pb-12">
        {/* Mobile Horizontal Navigation Tabs (< lg screens) */}
        <div className="lg:hidden mb-5 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1">
          {mobileNavTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'all') navigate('/friends/list');
                else handleSelectSection(item.id);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeSection === item.id
                  ? 'bg-[#e02f21] text-white shadow-xs'
                  : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${
                    activeSection === item.id
                      ? 'bg-white text-[#e02f21]'
                      : 'bg-[#e02f21] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
            {activeSection === 'home' && (
              <div className="space-y-8">
                <FriendRequestsView
                  requests={requests}
                  onConfirm={handleConfirmRequest}
                  onDelete={handleDeleteRequest}
                  onSeeAll={() => handleSelectSection('requests')}
                  loading={loading}
                />

                <div className="border-t border-gray-200 dark:border-gray-800"></div>

                <FriendSuggestionsView
                  suggestions={suggestions}
                  onAddFriend={handleAddFriend}
                  onRemoveSuggestion={handleRemoveSuggestion}
                  loading={loading}
                />
              </div>
            )}

            {activeSection === 'requests' && (
              <FriendRequestsView
                requests={requests}
                onConfirm={handleConfirmRequest}
                onDelete={handleDeleteRequest}
                loading={loading}
              />
            )}

            {activeSection === 'suggestions' && (
              <FriendSuggestionsView
                suggestions={suggestions}
                onAddFriend={handleAddFriend}
                onRemoveSuggestion={handleRemoveSuggestion}
                loading={loading}
              />
            )}

            {activeSection === 'all' && (
              <AllFriendsSplitView
                friends={friends}
                token={token}
                loading={loading}
              />
            )}

            {activeSection === 'birthdays' && (
              <BirthdaysView friends={friends} />
            )}

            {activeSection === 'custom' && (
              <CustomListsView friends={friends} />
            )}
          </div>
    </FriendsLayout>
  );
};

export default FriendsPage;

