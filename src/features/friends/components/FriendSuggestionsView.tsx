import React from 'react';
import { Link } from 'react-router';
import { UserPlus, X, Users } from 'lucide-react';
import Button from '../../../components/ui/Button';

const FriendSuggestionsView = ({
  suggestions = [],
  onAddFriend,
  onRemoveSuggestion,
  loading = false,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          People You May Know
        </h2>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-[#242526] rounded-2xl p-3 border border-gray-100 dark:border-gray-800 animate-pulse space-y-3"
            >
              <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
          {suggestions.map((person) => (
            <div
              key={person.id}
              className="bg-white dark:bg-[#242526] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md transition flex flex-col"
            >
              {/* Photo */}
              <Link
                to={`/profile/${person.id}`}
                className="block aspect-square w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden group"
              >
                <img
                  src={
                    person.image ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
                  }
                  alt={person.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </Link>

              {/* Body */}
              <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <Link
                    to={`/profile/${person.id}`}
                    className="font-black text-base text-gray-900 dark:text-white hover:underline truncate block"
                  >
                    {person.name}
                  </Link>

                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Users size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">
                      {person.mutualCount || 3} mutual friends
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    onClick={() => onAddFriend(person.id)}
                    className="w-full py-2.5 bg-[#e02f21] hover:bg-[#c92518] text-white rounded-xl text-sm font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus size={16} />
                    <span>Add Friend</span>
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onRemoveSuggestion(person.id)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-bold transition cursor-pointer"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
          <UserPlus size={36} className="mx-auto text-gray-400" />
          <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white">
            No New Suggestions
          </h3>
          <p className="text-sm text-gray-500">
            Check back soon as more food lovers join Heshel!
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendSuggestionsView;

