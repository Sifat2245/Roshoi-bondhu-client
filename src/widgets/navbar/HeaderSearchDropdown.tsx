import React from "react";
import { Clock, Search, X, Users, Globe, Lock, Loader2 } from "lucide-react";
import type {
  RecentSearchItem,
  UserSearchResult,
  GroupSearchResult,
} from "../../features/search/api/search.api";
import defaultAvatar from "../../assets/user-image.png";

interface HeaderSearchDropdownProps {
  query: string;
  onSelectQuery: (term: string) => void;
  onSelectUser: (user: UserSearchResult) => void;
  onSelectGroup: (group: GroupSearchResult) => void;
  recentSearches: RecentSearchItem[];
  onRemoveRecent: (id: string, e: React.MouseEvent) => void;
  onClearAllRecent: () => void;
  suggestions: {
    users: UserSearchResult[];
    groups: GroupSearchResult[];
  };
  loadingSuggestions: boolean;
}

export const HeaderSearchDropdown: React.FC<HeaderSearchDropdownProps> = ({
  query,
  onSelectQuery,
  onSelectUser,
  onSelectGroup,
  recentSearches,
  onRemoveRecent,
  onClearAllRecent,
  suggestions,
  loadingSuggestions,
}) => {
  const isQuerying = Boolean(query.trim());

  if (!isQuerying) {
    return (
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 px-1 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            Recent searches
          </span>
          {recentSearches.length > 0 && (
            <button
              type="button"
              onClick={onClearAllRecent}
              className="text-xs sm:text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* List of Recent Items */}
        {recentSearches.length > 0 ? (
          <div className="mt-1 divide-y divide-gray-50 dark:divide-gray-800/50 max-h-80 overflow-y-auto">
            {recentSearches.map((item) => {
              if (item.targetType === "USER" && item.user) {
                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      onSelectUser({
                        id: item.user!.id,
                        name: item.user!.name,
                        username: item.user!.username,
                        image: item.user!.image,
                      })
                    }
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/80 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.user.image || defaultAvatar}
                        alt={item.user.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100 dark:border-gray-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = defaultAvatar;
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {item.user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.user.username ? `@${item.user.username}` : item.user.city || "Foodie"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => onRemoveRecent(item.id, e)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              }

              if (item.targetType === "GROUP" && item.group) {
                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      onSelectGroup({
                        id: item.group!.id,
                        name: item.group!.name,
                        slug: item.group!.slug,
                        avatar: item.group!.avatar,
                        privacy: item.group!.privacy,
                        membersCount: 0,
                        isMember: false,
                      })
                    }
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/80 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.group.avatar ? (
                        <img
                          src={item.group.avatar}
                          alt={item.group.name}
                          className="w-9 h-9 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-gray-700"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
                          <Users size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {item.group.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                          {item.group.privacy === "PUBLIC" ? (
                            <>
                              <Globe size={11} />
                              <span>Public group</span>
                            </>
                          ) : (
                            <>
                              <Lock size={11} />
                              <span>Private group</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => onRemoveRecent(item.id, e)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectQuery(item.query)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/80 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center shrink-0 group-hover:text-[#e02f21] transition">
                      <Clock size={15} />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {item.query}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => onRemoveRecent(item.id, e)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            No recent searches
          </div>
        )}
      </div>
    );
  }

  // Active query suggestions
  return (
    <div className="p-2 max-h-96 overflow-y-auto">
      {/* Search for keyword item */}
      <div
        onClick={() => onSelectQuery(query)}
        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/80 cursor-pointer transition group border-b border-gray-100 dark:border-gray-800/60 mb-1"
      >
        <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
          <Search size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            Search for &ldquo;<span className="text-[#e02f21]">{query}</span>&rdquo;
          </p>
          <p className="text-[11px] text-gray-400">See all matching people, groups & posts</p>
        </div>
      </div>

      {loadingSuggestions && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
          <Loader2 size={14} className="animate-spin text-[#e02f21]" />
          <span>Searching...</span>
        </div>
      )}

      {/* Suggested People */}
      {!loadingSuggestions && suggestions.users.length > 0 && (
        <div className="py-1">
          <div className="px-2 pb-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              People
            </span>
          </div>
          <div className="space-y-0.5">
            {suggestions.users.map((u) => (
              <div
                key={u.id}
                onClick={() => onSelectUser(u)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/80 cursor-pointer transition"
              >
                <img
                  src={u.image || defaultAvatar}
                  alt={u.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100 dark:border-gray-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAvatar;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {u.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {u.username ? `@${u.username}` : u.city ? `Lives in ${u.city}` : "Chef"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Groups (No member count in search result popup) */}
      {!loadingSuggestions && suggestions.groups.length > 0 && (
        <div className="py-1 border-t border-gray-100 dark:border-gray-800/60 mt-1">
          <div className="px-2 py-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Groups
            </span>
          </div>
          <div className="space-y-0.5">
            {suggestions.groups.map((g) => (
              <div
                key={g.id}
                onClick={() => onSelectGroup(g)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/80 cursor-pointer transition"
              >
                {g.avatar ? (
                  <img
                    src={g.avatar}
                    alt={g.name}
                    className="w-9 h-9 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center shrink-0">
                    <Users size={16} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {g.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                    {g.privacy === "PUBLIC" ? (
                      <>
                        <Globe size={11} />
                        <span>Public group</span>
                      </>
                    ) : (
                      <>
                        <Lock size={11} />
                        <span>Private group</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No suggestions match */}
      {!loadingSuggestions &&
        suggestions.users.length === 0 &&
        suggestions.groups.length === 0 && (
          <div className="py-4 text-center text-xs text-gray-400">
            Press Enter to search all posts and content
          </div>
        )}
    </div>
  );
};

export default HeaderSearchDropdown;

