import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router';
import { useSession, signOut } from '../../lib/auth-client';
import { useLanguage } from '../../context/LanguageContext';
import { useDarkMode } from '../../context/ThemeContext';
import Avatar from '../ui/Avatar';
import logo from '../../assets/logo.png';
import {
  Home,
  Users,
  Search,
  Globe,
  Sun,
  Moon,
  LogOut,
  Shield,
  Plus,
  Settings as SettingsIcon,
  ChefHat,
  MessageSquare,
  Heart,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';

const RECENT_SEARCHES_KEY = 'hesheli_recent_searches';
const DEFAULT_RECENT = ['#KacchiBiryani', 'Chef Rahima', 'Shahi Morog Polao', 'Ilish Bhuna', 'Desserts'];

const SocialHeader = ({ onOpenCreatePost }) => {
  const { data: session } = useSession();
  const { language, toggleLanguage, t } = useLanguage();
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const user = session?.user;

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      } else {
        setRecentSearches(DEFAULT_RECENT);
      }
    } catch {
      setRecentSearches(DEFAULT_RECENT);
    }
  }, []);

  // Close search popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSearchTerm = (term) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const removeSearchTerm = (term, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      saveSearchTerm(search.trim());
      setIsSearchOpen(false);
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleSelectRecent = (term) => {
    setSearch(term);
    saveSearchTerm(term);
    setIsSearchOpen(false);
    navigate(`/?search=${encodeURIComponent(term)}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Determine current active top tab
  const currentPath = location.pathname;
  const currentType = searchParams.get('type');
  const currentFilter = searchParams.get('filter');

  const isHomeActive = currentPath === '/' && !currentType && !currentFilter;
  const isRecipesActive = currentPath === '/' && currentType === 'RECIPE';
  const isThoughtsActive = currentPath === '/' && currentType === 'CASUAL';
  const isFollowingActive = currentPath === '/' && currentFilter === 'FOLLOWING';
  const isGroupsActive = currentPath.startsWith('/group');

  const navTabClass = (isActive) =>
    `h-14 px-5 sm:px-7 flex items-center justify-center border-b-3 transition duration-150 cursor-pointer ${
      isActive
        ? 'border-[#e02f21] text-[#e02f21]'
        : 'border-transparent text-gray-500 hover:bg-gray-100/80 dark:hover:bg-gray-800'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-14 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-gray-800 shadow-xs px-3 sm:px-4 flex items-center justify-between">
      {/* Left: Brand Logo & Interactive Search with Recent Searches Dropdown */}
      <div ref={searchContainerRef} className="relative flex items-center gap-2 sm:gap-3 min-w-[200px] sm:min-w-[260px]">
        <Link to="/" className="flex-shrink-0 flex items-center">
          <img src={logo} alt="Hesheli" className="h-9 w-auto object-contain" />
        </Link>

        {/* Search Input Box */}
        <div className="relative flex-1 max-w-[240px] sm:max-w-[260px]">
          <form onSubmit={handleSearchSubmit}>
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes, chefs..."
              className="w-full pl-9 pr-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200/70 rounded-full text-xs font-medium focus:bg-white dark:focus:bg-[#3a3b3c] focus:outline-none dark:text-white transition shadow-2xs"
            />
          </form>

          {/* Facebook-style Recent Searches Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 top-11 w-72 sm:w-80 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 px-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-900 dark:text-white">Recent searches</span>
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllRecent}
                    className="text-[11px] font-semibold text-[#e02f21] hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {recentSearches.length > 0 ? (
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50 mt-1 max-h-64 overflow-y-auto">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      onClick={() => handleSelectRecent(term)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/80 cursor-pointer transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock size={14} className="text-gray-400 group-hover:text-[#e02f21] shrink-0 transition" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                          {term}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeSearchTerm(term, e)}
                        className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400">
                  No recent searches
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Facebook Central Tabs (Home = All Posts by default, Recipes, Groups, Thoughts, Following) */}
      <nav className="flex items-center justify-center flex-1 max-w-xl h-full">
        {/* 1. Home (All Posts by default!) */}
        <Link
          to="/"
          className={navTabClass(isHomeActive)}
          title="Home (All Posts)"
        >
          <Home size={22} />
        </Link>

        {/* 2. Recipes Only */}
        <Link
          to="/?type=RECIPE"
          className={navTabClass(isRecipesActive)}
          title="Recipes Only"
        >
          <ChefHat size={22} />
        </Link>

        {/* 3. Groups */}
        <Link
          to="/groups"
          className={navTabClass(isGroupsActive)}
          title="Foodie Groups"
        >
          <Users size={22} />
        </Link>

        {/* 4. Foodie Thoughts / Casual */}
        <Link
          to="/?type=CASUAL"
          className={navTabClass(isThoughtsActive)}
          title="Foodie Thoughts"
        >
          <MessageSquare size={22} />
        </Link>

        {/* 5. Following */}
        {user && (
          <Link
            to="/?filter=FOLLOWING"
            className={navTabClass(isFollowingActive)}
            title="Following Feed"
          >
            <Heart size={22} />
          </Link>
        )}
      </nav>

      {/* Right: Controls & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-[200px] sm:min-w-[260px] justify-end">
        {/* Create Post Quick Button */}
        {user && onOpenCreatePost && (
          <button
            type="button"
            onClick={onOpenCreatePost}
            className="hidden md:flex items-center gap-1.5 bg-[#e02f21] hover:bg-[#c22417] text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Post</span>
          </button>
        )}

        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          title="Toggle Language"
          className="w-9 h-9 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold text-xs transition cursor-pointer"
        >
          {language === 'en' ? 'বাং' : 'EN'}
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark Mode"
          className="w-9 h-9 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer"
        >
          {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
        </button>

        {/* User Avatar Menu */}
        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <Avatar src={user.image} alt={user.name} size="sm" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2 z-50">
                <Link
                  to={`/profile/${user.id}`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition mb-1"
                >
                  <Avatar src={user.image} alt={user.name} size="md" />
                  <div className="truncate">
                    <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-400">View your profile</p>
                  </div>
                </Link>

                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                <Link
                  to="/groups"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <Users size={17} />
                  <span>Your Groups</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <SettingsIcon size={17} />
                  <span>Settings & Privacy</span>
                </Link>

                {['ADMIN', 'MODERATOR'].includes(user.role) && (
                  <Link
                    to="/admin-portal"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                  >
                    <Shield size={17} />
                    <span>Admin Control Panel</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                >
                  <LogOut size={17} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-[#e02f21] hover:bg-[#c22417] text-white text-xs font-bold px-4 py-2 rounded-full transition shadow-xs"
          >
            Log In
          </Link>
        )}
      </div>
    </header>
  );
};

export default SocialHeader;
