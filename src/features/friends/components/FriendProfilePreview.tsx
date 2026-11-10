import { useSocial } from '../../community/model/useSocial';
import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  MessageCircle,
  UserCheck,
  MoreHorizontal,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Utensils,
  ExternalLink,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import PostCard from "../../posts/components/PostCard";
import { useChatDock } from "../../../context/ChatDockContext";

import { profileApi } from "../../profile/api/profile.api";
import { postsApi } from "../../posts/api/posts.api";
import { useNavigate } from "react-router";
import { useToast } from "../../../context/ToastContext";

const FriendProfilePreview = ({ friend, token }) => {
  const { user } = useSocial();
  const { startConversation } = useChatDock();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!friend?.id) return;

    let isMounted = true;
    const fetchFullProfile = async () => {
      setLoading(true);
      try {
        const [userData, postsData] = await Promise.all([
          profileApi.getUserProfile(friend.id, token),
          postsApi.getPosts({ authorId: friend.id, limit: 5 }, token, user?.id),
        ]);
        if (isMounted) {
          setProfileData(userData);
          setPosts(postsData);
        }
      } catch (err) {
        console.error("Failed to load friend preview:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFullProfile();
    return () => {
      isMounted = false;
    };
  }, [friend?.id, token, user?.id]);

  const p = profileData || friend;

  return (
    <div className="w-full bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
      {/* 1. Cover Photo */}
      <div className="relative h-48 sm:h-64 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <img
          src={
            p.coverImage ||
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200"
          }
          alt={p.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 2. Avatar & Header Details */}
      <div className="px-5 sm:px-8 pb-5 border-b border-gray-100 dark:border-gray-800">
        <div className="relative flex flex-col 2xl:flex-row 2xl:items-end justify-between gap-4 mt-4 mb-4">
          <div className="flex items-end gap-4">
            <div className="relative -mt-20 shrink-0">
              <Avatar
                src={p.image}
                alt={p.name}
                size="xl"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-white dark:ring-[#242526] shadow-md object-cover"
              />
            </div>
            <div className="pb-1">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {p.name}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {p.mutualCount || 8} mutual friends • {p.followersCount || 12}{" "}
                followers
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              to={`/profile/${p.id}`}
              className="px-4 py-2 bg-[#e02f21] hover:bg-[#c22417] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink size={14} />
              <span>View Full Profile</span>
            </Link>

            <Button
              variant="secondary"
              onClick={() => startConversation(p)}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <MessageCircle size={14} />
              <span>Message</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Bio & Info summary */}
      <div className="p-5 sm:p-6 bg-[#f0f2f5]/40 dark:bg-transparent space-y-6">
        {p.bio && (
          <div className="bg-white dark:bg-[#242526] rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs">
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
              "{p.bio}"
            </p>
          </div>
        )}

        {/* User Details Grid */}
        <div className="bg-white dark:bg-[#242526] rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-[#e02f21] shrink-0" />
            <span>
              Lives in{" "}
              <b className="text-gray-800 dark:text-gray-200">
                {p.city || "Dhaka, Bangladesh"}
              </b>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Briefcase
              size={15}
              className="text-gray-500 dark:text-gray-400 shrink-0"
            />
            <span>
              Works as{" "}
              <b className="text-gray-800 dark:text-gray-200">
                {p.work || "Culinary Creator"}
              </b>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap size={15} className="text-emerald-500 shrink-0" />
            <span>
              Studied at{" "}
              <b className="text-gray-800 dark:text-gray-200">
                {p.education || "Heshel Cooking Academy"}
              </b>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-purple-500 shrink-0" />
            <span>
              Joined{" "}
              <b className="text-gray-800 dark:text-gray-200">Heshel Network</b>
            </span>
          </div>
        </div>

        {/* Recent Posts preview */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">
            Recent Recipes & Stories by {p.name?.split(" ")[0]}
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#242526] rounded-xl p-4 animate-pulse space-y-2"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                  <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onOpenComments={(post) => navigate(`/post/${post.id}`)}
                  onOpenShare={async (post) => {
                    try {
                      await postsApi.sharePost(post.id, "", token, user);
                      notify.success("Post shared to your feed");
                    } catch (error: any) {
                      notify.error(error.message);
                    }
                  }}
                  onRequireAuth={() => navigate("/login")}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#242526] rounded-xl p-8 text-center text-xs text-gray-400">
              <Utensils size={24} className="mx-auto mb-2 text-gray-300" />
              No public recipes shared yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendProfilePreview;
