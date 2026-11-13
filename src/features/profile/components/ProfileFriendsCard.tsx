import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Search, Users } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";
import { useFriendsQuery } from "../../friends/hooks/useFriendsQueries";
import { useSession } from "../../../lib/auth-client";
import { isDemoMode, readDemo } from "../../../lib/demo/demo-store";

export default function ProfileFriendsCard({
  profile,
  isOwnProfile,
}: {
  profile?: any;
  isOwnProfile?: boolean;
}) {
  const { data: session } = useSession();
  const token = session?.session?.token;
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All friends");
  const targetUid = isOwnProfile ? undefined : (profile?.id || undefined);
  const { data: queryFriends, isLoading } = useFriendsQuery(token, undefined, targetUid);

  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (isDemoMode()) {
      const state = readDemo();
      setFriends(
        state.users.filter(
          (user) => user.id !== profile?.id && state.friends.includes(user.id),
        ),
      );
    } else if (queryFriends) {
      setFriends(queryFriends);
    } else if (profile?.friends) {
      setFriends(profile.friends);
    }
  }, [profile?.id, profile?.friends, queryFriends]);
  const filtered = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(search.toLowerCase()) &&
      (tab !== "Current city" || friend.city === profile?.city) &&
      (tab !== "Following" ||
        !isDemoMode() ||
        readDemo().following.includes(friend.id)),
  );
  if (tab === "Recently added") filtered.reverse();
  return (
    <section className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Friends & connections</h2>
          <p className="text-sm text-gray-500 mt-1">
            {friends.length} connections
          </p>
        </div>
        <label className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            aria-label="Search connections"
            placeholder="Search connections"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-full bg-gray-100 dark:bg-[#3a3b3c] py-2.5 pl-9 pr-3 text-sm"
          />
        </label>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["All friends", "Recently added", "Current city"].map(
          (label) => (
            <button
              key={label}
              type="button"
              aria-pressed={tab === label}
              onClick={() => setTab(label)}
              className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold ${tab === label ? "bg-red-50 text-[#e02f21] dark:bg-red-950/40 dark:text-red-300" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              {label}
            </button>
          ),
        )}
      </div>
      {isLoading && !friends.length ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 border border-gray-100 dark:border-gray-800 rounded-xl p-3 animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((friend) => (
            <Link
              key={friend.id}
              to={`/profile/${friend.id}`}
              className="flex items-center gap-3 border border-gray-100 dark:border-gray-800 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <Avatar src={friend.image} alt={friend.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold truncate text-gray-900 dark:text-white">{friend.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {friend.city || "Home cook"}{friend.mutualFriends > 0 ? ` · ${friend.mutualFriends} mutual friends` : ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-sm text-gray-500">
          <Users size={28} className="mx-auto mb-3 text-gray-400" />
          No connections match your search.
        </div>
      )}
      <Link
        to="/friends/list"
        className="block w-full text-center rounded-xl bg-gray-100 dark:bg-[#3a3b3c] py-3 font-semibold text-sm"
      >
        See all friends
      </Link>
    </section>
  );
}
