import React from 'react';
import { Link } from 'react-router';
import { Users } from 'lucide-react';
import Button from '../../../components/ui/Button';

const FriendRequestCard = ({
  request,
  onConfirm,
  onDelete,
  isProcessing = false,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col">
      {/* Top Photo */}
      <Link
        to={`/profile/${request.id}`}
        className="block aspect-square w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden group"
      >
        <img
          src={
            request.image ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400'
          }
          alt={request.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </Link>

      {/* Card Info & Actions */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link
            to={`/profile/${request.id}`}
            className="font-bold text-base text-gray-900 dark:text-white hover:underline truncate block"
          >
            {request.name}
          </Link>

          {/* Mutual Friends indicator */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            <Users size={14} className="text-gray-400 shrink-0" />
            <span className="truncate">
              {request.mutualCount || 2} mutual {request.mutualCount === 1 ? 'friend' : 'friends'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            onClick={() => onConfirm(request.id)}
            disabled={isProcessing}
            className="w-full py-2.5 bg-[#e02f21] hover:bg-[#c92518] text-white rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
          >
            Confirm
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => onDelete(request.id)}
            disabled={isProcessing}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-bold transition cursor-pointer"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestCard;

