import React, { useState, useMemo } from 'react';
import { Search, MoreHorizontal, UserCheck, Users } from 'lucide-react';
import Avatar from '../../../components/ui/Avatar';
import FriendProfilePreview from './FriendProfilePreview';

const AllFriendsSplitView = ({ friends = [], token, loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriendId, setSelectedFriendId] = useState(null);

  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return friends;
    const q = searchTerm.toLowerCase();
    return friends.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q) ||
        f.username?.toLowerCase().includes(q)
    );
  }, [friends, searchTerm]);

  // Default selection to first friend
  const currentSelectedFriend = useMemo(() => {
    if (selectedFriendId) {
      return (
        filteredFriends.find((f) => f.id === selectedFriendId) ||
        friends.find((f) => f.id === selectedFriendId) ||
        filteredFriends[0] ||
        friends[0]
      );
    }
    return filteredFriends[0] || friends[0];
  }, [selectedFriendId, filteredFriends, friends]);

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-start">
      {/* 1. Left List Column (Searchable Friends List) */}
      <div className="w-full lg:w-[340px] xl:w-[360px] shrink-0 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-xs space-y-3.5">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            All Friends
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
          </p>
        </div>

        {/* Search Friends Input */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Friends"
            className="w-full pl-9 pr-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs font-medium dark:text-white focus:outline-none focus:ring-1 focus:ring-[#e02f21]"
          />
        </div>

        {/* Friends Vertical List */}
        <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar pt-1">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                </div>
              </div>
            ))
          ) : filteredFriends.length > 0 ? (
            filteredFriends.map((f) => {
              const isSelected = currentSelectedFriend?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFriendId(f.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? 'bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40'
                      : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={f.image} alt={f.name} size="md" />
                    <div className="truncate">
                      <p className={`font-bold text-xs truncate ${isSelected ? 'text-[#e02f21]' : 'text-gray-900 dark:text-white'}`}>
                        {f.name}
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {f.mutualCount || 4} mutual friends
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                  >
                    <MoreHorizontal size={15} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">
              No friends found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>

      {/* 2. Right Column (Full Profile Preview) */}
      <div className="flex-1 min-w-0 w-full">
        {currentSelectedFriend ? (
          <FriendProfilePreview friend={currentSelectedFriend} token={token} />
        ) : (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
            <Users size={36} className="mx-auto text-gray-400 mb-2" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Select a friend to preview</h3>
            <p className="text-xs text-gray-500 mt-1">Click any friend from the list on the left to see their profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllFriendsSplitView;

