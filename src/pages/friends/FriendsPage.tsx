import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
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

const FriendsPage = () => {
  const { data: session } = useSession();
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') || 'home';
  const [activeSection, setActiveSection] = useState(tabParam);

  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = session?.session?.token;

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
        setRequests(friendsData.slice(0, 8));
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
    setRequests((prev) => prev.filter((r) => r.id !== userId));
    notify.success('Friend request confirmed');
  };

  const handleDeleteRequest = (userId) => {
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
              <CustomListsView />
            )}
          </div>
    </FriendsLayout>
  );
};

export default FriendsPage;

