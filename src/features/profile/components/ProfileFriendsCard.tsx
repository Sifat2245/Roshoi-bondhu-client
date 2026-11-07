import React, { useState } from 'react';
import { Link } from 'react-router';
import { MoreHorizontal, Users, UserCheck, Search } from 'lucide-react';

interface ProfileFriendsCardProps {
  profile?: any;
  isOwnProfile?: boolean;
}

interface FriendItem {
  id: string;
  name: string;
  image: string;
  mutualFriends: number;
}

const MOCK_FRIENDS: FriendItem[] = [
  {
    id: 'f1',
    name: 'Md Rezaul Korim',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    mutualFriends: 77,
  },
  {
    id: 'f2',
    name: 'Md Kawsar Hossain',
    image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
    mutualFriends: 107,
  },
  {
    id: 'f3',
    name: 'Mohsin Islam Emon',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    mutualFriends: 87,
  },
  {
    id: 'f4',
    name: 'Irenity Afra',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    mutualFriends: 11,
  },
  {
    id: 'f5',
    name: 'Mehar Afrin',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    mutualFriends: 2,
  },
  {
    id: 'f6',
    name: 'Rt Rifat',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    mutualFriends: 100,
  },
  {
    id: 'f7',
    name: 'Selim Prodhan',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
    mutualFriends: 25,
  },
  {
    id: 'f8',
    name: 'Sakib Khandakar',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    mutualFriends: 18,
  },
];

const subTabs = [
  'All friends',
  'Recently Added',
  'Birthdays',
  'College',
  'Current city',
  'Following',
];

const ProfileFriendsCard: React.FC<ProfileFriendsCardProps> = ({ profile, isOwnProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState('All friends');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = MOCK_FRIENDS.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Top Header Row matching Image 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Friends
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {profile?.followersCount || MOCK_FRIENDS.length * 120} friends
          </p>
        </div>

        <div className="flex items-center gap-3.5 text-sm font-bold">
          <Link
            to="/friends"
            className="text-[#e02f21] hover:underline transition"
          >
            Friend requests
          </Link>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <Link
            to="/friends/list"
            className="text-gray-700 dark:text-gray-300 hover:text-[#e02f21] hover:underline transition"
          >
            Find Friends
          </Link>
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Sub Tabs Row matching Image 3 */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800 pb-1">
        {subTabs.map((tab) => {
          const isSelected = activeSubTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? 'bg-red-50 dark:bg-red-950/40 text-[#e02f21]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 2-Column Grid of Friends (Matching Image 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredFriends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-100 dark:border-gray-800 transition group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <img
                src={friend.image}
                alt={friend.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 shadow-xs"
              />
              <div className="min-w-0">
                <Link
                  to={`/profile/${friend.id}`}
                  className="font-black text-base sm:text-lg text-gray-900 dark:text-white hover:underline truncate block"
                >
                  {friend.name}
                </Link>
                <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
                  {friend.mutualFriends} mutual friends
                </p>
              </div>
            </div>

            <button
              type="button"
              title="Friend options"
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer shrink-0"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* See All Button matching Image 3 */}
      <div className="pt-2">
        <Link
          to="/friends/list"
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-sm sm:text-base font-bold transition flex items-center justify-center gap-2 cursor-pointer"
        >
          See all friends
        </Link>
      </div>
    </div>
  );
};

export default ProfileFriendsCard;

