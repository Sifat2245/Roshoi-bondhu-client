import React, { useState } from 'react';
import FriendRequestCard from './FriendRequestCard';
import { UserCheck, ChevronDown } from 'lucide-react';

export interface FriendRequestsViewProps {
  requests?: any[];
  onConfirm?: (userId: string) => void;
  onDelete?: (userId: string) => void;
  onSeeAll?: () => void;
  loading?: boolean;
}

const FriendRequestsView: React.FC<FriendRequestsViewProps> = ({
  requests = [],
  onConfirm,
  onDelete,
  onSeeAll,
  loading = false,
}) => {
  const [visibleCount, setVisibleCount] = useState(12);

  const displayedRequests = requests.slice(0, visibleCount);
  const hasMore = requests.length > visibleCount;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Friend Requests
        </h2>
        {requests.length > 0 && onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
          >
            See all
          </button>
        )}
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
      ) : requests.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
            {displayedRequests.map((req) => (
              <FriendRequestCard
                key={req.id}
                request={req}
                onConfirm={onConfirm}
                onDelete={onDelete}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#e02f21] hover:bg-red-50 dark:hover:bg-red-950/40 px-4 py-2 rounded-xl transition cursor-pointer"
              >
                <span>See more</span>
                <ChevronDown size={14} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
          <UserCheck size={36} className="mx-auto text-gray-400" />
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            No Pending Friend Requests
          </h3>
          <p className="text-xs text-gray-500">
            When people send you foodie friend requests, you'll see them here!
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendRequestsView;

