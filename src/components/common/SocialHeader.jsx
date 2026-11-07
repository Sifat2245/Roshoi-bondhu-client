import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
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
  User as UserIcon,
  Shield,
  Plus,
} from 'lucide-react';

const SocialHeader = ({ onOpenCreatePost }) => {
  const { data: session } = useSession();
  const { language, toggleLanguage, t } = useLanguage();
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const user = session?.user;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navTabClass = ({ isActive }) =>
    `h-14 px-8 flex items-center justify-center border-b-3 transition duration-150 ${
      isActive
        ? 'border-[#e02f21] text-[#e02f21]'
        : 'border-transparent text-gray-500 hover:bg-gray-100/80 dark:hover:bg-gray-800'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-14 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-gray-800 shadow-xs px-4 flex items-center justify-between">
      {/* Left: Brand Logo & Search */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-[240px]">
        <Link to="/" className="flex-shrink-0 flex items-center">
          <img src={logo} alt="Hesheli" className="h-9 w-auto object-contain" />
        </Link>

        {/* Facebook-style Search Pill */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block flex-1 max-w-[240px]">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Hesheli..."
            className="w-full pl-9 pr-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200/70 rounded-full text-xs font-medium focus:bg-white dark:focus:bg-[#3a3b3c] focus:outline-none dark:text-white transition"
          />
        </form>
      </div>

      {/* Middle: Facebook Central Tabs */}
      <nav className="flex items-center justify-center flex-1 max-w-md h-full">
        <NavLink to="/" end className={navTabClass} title="Feed">
          <Home size={24} />
        </NavLink>
        <NavLink to="/groups" className={navTabClass} title="Groups">
          <Users size={24} />
        </NavLink>
      </nav>

      {/* Right: Controls & User Profile */}
      <div className="flex items-center gap-2 min-w-[240px] justify-end">
        {/* Create Post Quick Button */}
        {user && onOpenCreatePost && (
          <button
            type="button"
            onClick={onOpenCreatePost}
            className="hidden md:flex items-center gap-1.5 bg-[#e02f21] hover:bg-[#c22417] text-white px-3 py-1.5 rounded-full text-xs font-bold transition shadow-xs cursor-pointer"
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
          className="w-10 h-10 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold text-xs transition"
        >
          {language === 'en' ? 'বাং' : 'EN'}
        </button>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark Mode"
          className="w-10 h-10 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition"
        >
          {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        {/* User Avatar Menu or Sign In */}
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
                  <Users size={18} />
                  <span>Your Groups</span>
                </Link>

                {/* Secret Admin Route for Admin & Moderator */}
                {['ADMIN', 'MODERATOR'].includes(user.role) && (
                  <Link
                    to="/admin-portal"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition"
                  >
                    <Shield size={18} />
                    <span>Admin Control Panel</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                >
                  <LogOut size={18} />
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

