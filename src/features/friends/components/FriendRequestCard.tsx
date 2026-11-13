import React from "react";
import { Link } from "react-router";
import { Users } from "lucide-react";
import Button from "../../../components/ui/Button";

const FriendRequestCard = ({
  request,
  onConfirm,
  onDelete,
  isProcessing = false,
  processingAction = null,
}: {
  request: any;
  onConfirm: (id: string) => void;
  onDelete: (id: string) => void;
  isProcessing?: boolean;
  processingAction?: "confirm" | "delete" | null;
}) => {
  const profileId = request.userId || request.id;
  const mutuals = request.mutualFriends ?? request.mutualCount ?? 0;

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md transition flex flex-col">
      {/* Top Photo */}
      <Link
        to={`/profile/${profileId}`}
        className="block aspect-square w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden group"
      >
        <img
          src={
            request.image ||
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"
          }
          alt={request.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </Link>

      {/* Card Info & Actions */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link
            to={`/profile/${profileId}`}
            className="font-bold text-base text-gray-900 dark:text-white hover:underline truncate block"
          >
            {request.name}
          </Link>

          {/* Mutual Friends or Location indicator */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
            {mutuals > 0 ? (
              <span className="flex items-center gap-1.5 truncate">
                <Users size={14} className="text-gray-400 shrink-0" />
                <span className="truncate">
                  {mutuals} mutual {mutuals === 1 ? "friend" : "friends"}
                </span>
              </span>
            ) : request.city ? (
              <span className="truncate">{request.city}</span>
            ) : (
              <span>Sent you a friend request</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            onClick={() => onConfirm(request.id)}
            disabled={isProcessing}
            loading={isProcessing && processingAction === "confirm"}
            className="w-full py-2.5 bg-[#e02f21] hover:bg-[#c92518] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            Confirm
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => onDelete(request.id)}
            disabled={isProcessing}
            loading={isProcessing && processingAction === "delete"}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestCard;
