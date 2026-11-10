import React, { useState } from "react";
import { Link } from "react-router";
import { Users, Lock, Globe, Check } from "lucide-react";
import Button from "../../../components/ui/Button";

const GroupCard = ({ group, onJoinToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onJoinToggle(group);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        {/* Cover Banner */}
        <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
          {group.coverImage ? (
            <img
              src={group.coverImage}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-red-500/20 to-orange-500/20">
              <Users size={32} className="text-[#e02f21]/40" />
            </div>
          )}
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center gap-1">
            {group.privacy === "PRIVATE" ? (
              <>
                <Lock size={11} />
                <span>Private</span>
              </>
            ) : (
              <>
                <Globe size={11} />
                <span>Public</span>
              </>
            )}
          </div>
        </div>

        {/* Content Info */}
        <div className="p-4 space-y-2">
          <Link
            to={`/group/${group.slug}`}
            className="font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:text-[#e02f21] line-clamp-1 transition"
          >
            {group.name}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {group.description ||
              "Welcome to our food community! Share recipes and food thoughts."}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-1">
            <Users size={12} />
            <span>
              {group.membersCount ?? group.members?.length ?? 0}{" "}
              {(group.membersCount ?? group.members?.length ?? 0) === 1
                ? "member"
                : "members"}
            </span>
            <span>•</span>
            <span>{group.postsCount || 0} posts</span>
          </div>
        </div>
      </div>

      {/* Footer / Join CTA */}
      <div className="p-4 pt-0">
        <Button
          onClick={handleAction}
          loading={loading}
          variant={group.isMember ? "outline" : "primary"}
          className="w-full text-sm font-bold py-2.5 rounded-xl"
        >
          {group.isMember ? (
            <span className="flex items-center justify-center gap-1">
              <Check size={14} /> Joined
            </span>
          ) : (
            <span>Join Group</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default GroupCard;
