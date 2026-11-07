import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useSession } from '../lib/auth-client';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  Compass,
  ChefHat,
  Flame,
  Plus,
  Check,
  Sparkles,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RightSidebar = ({ onSelectCuisine, activeCuisine, onRequireAuth }) => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const user = session?.user;

  const [suggestedGroups, setSuggestedGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Suggested popular cuisines
  const cuisines = [
    { name: 'Bangladeshi', label: 'বাঙালি রান্না', count: '120+' },
    { name: 'Indian', label: 'Indian Curries', count: '85+' },
    { name: 'Mughlai', label: 'Mughlai & Biryani', count: '64+' },
    { name: 'Desserts', label: 'মিষ্টি ও বেকিং', count: '52+' },
    { name: 'Chinese', label: 'Desi Chinese', count: '41+' },
  ];

  // Fetch suggested groups
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await fetch(`${API_BASE}/api/group?limit=3`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.data) {
          setSuggestedGroups(data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load suggested groups', err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [user]);

  // Handle instant group join from sidebar
  const handleJoinGroup = async (groupId) => {
    if (!user) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    try {
      await fetch(`${API_BASE}/api/group/${groupId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
      });

      // Optimistic update
      setSuggestedGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, myMembership: { isApproved: g.privacy === 'PUBLIC' } }
            : g
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-full space-y-4">
      {/* Trending Cuisines Widget */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600">
            <Flame size={16} />
          </div>
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">
            {t('trendingCuisines')}
          </h4>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {cuisines.map((c) => {
            const isSelected = activeCuisine === c.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onSelectCuisine && onSelectCuisine(isSelected ? '' : c.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#e02f21] text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-[#e02f21]'
                }`}
              >
                <span>{c.label}</span>
                <span className={`text-[10px] ${isSelected ? 'text-red-200' : 'text-gray-400'}`}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested Food Groups Widget */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-red-100 dark:bg-red-950 text-[#e02f21]">
              <Users size={16} />
            </div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              {t('suggestedGroups')}
            </h4>
          </div>
          <Link
            to="/groups"
            className="text-xs font-bold text-[#e02f21] hover:underline"
          >
            See all
          </Link>
        </div>

        {loadingGroups ? (
          <div className="text-center py-4 text-xs text-gray-400">Loading groups...</div>
        ) : suggestedGroups.length > 0 ? (
          <div className="space-y-3">
            {suggestedGroups.map((g) => {
              const isJoined = g.myMembership?.isApproved;
              const isPending = g.myMembership && !g.myMembership.isApproved;

              return (
                <div key={g.id} className="flex items-center justify-between gap-3">
                  <Link to={`/group/${g.slug}`} className="flex items-center gap-2.5 flex-1 min-w-0">
                    <img
                      src={
                        g.avatar ||
                        g.coverImage ||
                        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100'
                      }
                      alt={g.name}
                      className="w-9 h-9 rounded-xl object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate hover:text-[#e02f21]">
                        {g.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {g.memberCount || 1} {t('members')} • {g.privacy === 'PRIVATE' ? '🔒' : '🌐'}
                      </p>
                    </div>
                  </Link>

                  {isJoined ? (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <Check size={12} /> {t('joined')}
                    </span>
                  ) : isPending ? (
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl">
                      {t('requested')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleJoinGroup(g.id)}
                      className="px-3 py-1 bg-red-50 dark:bg-red-950/30 hover:bg-[#e02f21] text-[#e02f21] hover:text-white text-xs font-bold rounded-xl transition flex items-center gap-1 flex-shrink-0"
                    >
                      <Plus size={13} />
                      <span>{t('joinGroup')}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">No groups yet.</p>
        )}
      </div>

      {/* Featured Cooks Widget */}
      <div className="bg-gradient-to-br from-amber-500/10 to-red-500/10 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-5 border border-amber-200/40 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <ChefHat size={16} className="text-[#e02f21]" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white">
            Community Spotlight
          </h4>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          Share your family spices, review local recipes, and post in food groups to earn the{' '}
          <strong className="text-[#e02f21]">Hesheli Verified Home Chef</strong> badge.
        </p>
      </div>
    </aside>
  );
};

export default RightSidebar;

