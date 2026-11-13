import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router";
import { useSession } from "../../lib/auth-client";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useDarkMode } from "../../context/ThemeContext";
import Avatar from "../../components/ui/Avatar";
import NotificationDropdown from "../../features/notifications/components/NotificationDropdown";
import MessengerDropdown from "../../features/messenger/components/MessengerDropdown";
import FloatingChatDock from "../../features/messenger/components/FloatingChatDock";
import notificationsApi from "../../features/notifications/api/notifications.api";
import LeftSidebar from "../left-sidebar/LeftSidebar";
import Modal from "../../components/ui/Modal";
import { isDemoMode } from "../../lib/demo/demo-store";
import { useChatDock } from "../../context/ChatDockContext";
import logo from "../../assets/logo.png";
import {
  Home,
  Users,
  Search,
  Sun,
  Moon,
  LogOut,
  Settings as SettingsIcon,
  ChefHat,
  MessageSquare,
  MessageCircle,
  Clock,
  X,
  Bell,
  UserCheck,
  Menu,
  SlidersHorizontal,
  ArrowLeft,
  Globe,
} from "lucide-react";

const RECENT_SEARCHES_KEY = "heshel_recent_searches";
const DEFAULT_RECENT = [
  "#KacchiBiryani",
  "Chef Rahima",
  "Shahi Morog Polao",
  "Ilish Bhuna",
  "Desserts",
];

export interface SocialHeaderProps {
  onToggleLeftSidebar?: () => void;
  onToggleRightSidebar?: () => void;
  hasActiveFilters?: boolean;
}

const SocialHeader: React.FC<SocialHeaderProps> = ({
  onToggleLeftSidebar,
  onToggleRightSidebar,
  hasActiveFilters = false,
}) => {
  const { data: session } = useSession();
  const { logoutUser, user: authUser } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { darkMode, setDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [globalMenuOpen, setGlobalMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const { conversations } = useChatDock();
  const unreadMessages = conversations.reduce(
    (sum, chat) => sum + chat.unreadCount,
    0,
  );

  useEffect(() => {
    setDropdownOpen(false);
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setIsNotifOpen(false);
    setIsMessengerOpen(false);
    setGlobalMenuOpen(false);
  }, [location.pathname, location.search]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const messengerContainerRef = useRef<HTMLDivElement>(null);
  const user = session?.user || authUser;

  // Fetch notifications for badge and dropdown
  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const notifs = await notificationsApi.getNotifications(
          session?.session?.token,
        );
        setNotifications(notifs);
      } catch (err) {
        console.error("Failed to load notifications in header:", err);
      }
    };
    fetchNotifs();
    window.addEventListener("heshel:notifications-updated", fetchNotifs);
    window.addEventListener("heshel:notification-preferences", fetchNotifs);
    return () => {
      window.removeEventListener("heshel:notifications-updated", fetchNotifs);
      window.removeEventListener(
        "heshel:notification-preferences",
        fetchNotifs,
      );
    };
  }, [user, session]);

  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const handleMarkAllRead = () => {
    notificationsApi.markRead(notifications.map((item) => item.id));
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  const handleMarkRead = (id: string) => {
    notificationsApi.markRead([id]);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnread: false } : n)),
    );
  };

  const handleNotificationAction = async (id: string, action: string) => {
    await notificationsApi.respond(id, action);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

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

  // Close search popover & notification popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node))
        setDropdownOpen(false);
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target as Node)
      ) {
        setIsNotifOpen(false);
      }
      if (
        messengerContainerRef.current &&
        !messengerContainerRef.current.contains(e.target as Node)
      ) {
        setIsMessengerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setIsSearchOpen(false);
        setIsMobileSearchOpen(false);
        setIsNotifOpen(false);
        setIsMessengerOpen(false);
      }
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [
      clean,
      ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const removeSearchTerm = (term: string, e: React.MouseEvent) => {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      saveSearchTerm(search.trim());
      setIsSearchOpen(false);
      setIsMobileSearchOpen(false);
      navigate(`/?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleSelectRecent = (term: string) => {
    setSearch(term);
    saveSearchTerm(term);
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    navigate(`/?search=${encodeURIComponent(term)}`);
  };

  const handleLogout = () => {
    logoutUser();
  };

  // Determine current active top tab
  const currentPath = location.pathname;
  const currentType = searchParams.get("type");
  const currentFilter = searchParams.get("filter");

  const isHomeActive = currentPath === "/" && !currentType && !currentFilter;
  const isFriendsActive = currentPath.startsWith("/friends");
  const isRecipesActive = currentPath === "/" && currentType === "RECIPE";
  const isThoughtsActive = currentPath === "/" && currentType === "CASUAL";
  const isGroupsActive = currentPath.startsWith("/group");

  const navTabs = [
    { to: "/", label: "Home (All Posts)", icon: Home, isActive: isHomeActive },
    {
      to: "/friends",
      label: "Friends",
      icon: UserCheck,
      isActive: isFriendsActive,
    },
    {
      to: "/?type=RECIPE",
      label: "Recipes Only",
      icon: ChefHat,
      isActive: isRecipesActive,
    },
    {
      to: "/groups",
      label: "Foodie Groups",
      icon: Users,
      isActive: isGroupsActive,
    },
    {
      to: "/?type=CASUAL",
      label: "Foodie Thoughts",
      icon: MessageSquare,
      isActive: isThoughtsActive,
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-gray-800 shadow-xs select-none">
        {/* 1. Main Header Bar (h-14) */}
        <div className="relative h-14 px-3 sm:px-4 flex items-center justify-between">
          {/* Left: Brand Logo, Mobile Drawer Toggle & Desktop Search */}
          <div
            ref={searchContainerRef}
            className="flex items-center gap-2 sm:gap-3 min-w-0"
          >
            {/* Mobile Left Sidebar Toggle Button */}
            {
              <button
                type="button"
                onClick={onToggleLeftSidebar || (() => setGlobalMenuOpen(true))}
                aria-label="Open navigation menu"
                className="lg:hidden w-9 h-9 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer shrink-0"
                title="Open Navigation Menu"
              >
                <Menu size={19} />
              </button>
            }

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src={logo}
                alt="Heshel"
                className="h-9 w-9 object-contain rounded-xl"
              />
              {isDemoMode() && (
                <span className="hidden xl:inline ml-2 text-[10px] rounded-full bg-red-50 dark:bg-red-950/40 px-2 py-1 text-[#b92b20] dark:text-red-300 font-bold">
                  Demo
                </span>
              )}
            </Link>

            {/* Desktop Search Input Box (Visible on md and larger screens) */}
            <div className="hidden xl:block relative w-60 2xl:w-72">
              <form onSubmit={handleSearchSubmit}>
                <Search
                  size={17}
                  className="absolute left-3.5 top-2.5 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search recipes, chefs..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200/70 rounded-full text-sm font-medium focus:bg-white dark:focus:bg-[#3a3b3c] focus:outline-none dark:text-white transition shadow-2xs"
                />
              </form>

              {/* Desktop Recent Searches Dropdown */}
              {isSearchOpen && (
                <div className="absolute left-0 top-12 w-80 sm:w-96 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2.5 px-1.5 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Recent searches
                    </span>
                    {recentSearches.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllRecent}
                        className="text-xs sm:text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {recentSearches.length > 0 ? (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800/50 mt-1.5 max-h-72 overflow-y-auto">
                      {recentSearches.map((term) => (
                        <div
                          key={term}
                          onClick={() => handleSelectRecent(term)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/80 cursor-pointer transition group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Clock
                              size={16}
                              className="text-gray-400 group-hover:text-[#e02f21] shrink-0 transition"
                            />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {term}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => removeSearchTerm(term, e)}
                            className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-gray-400">
                      No recent searches
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Center: Facebook Central Tabs (Desktop Only: md:flex) */}
          <nav className="hidden md:flex items-center justify-center flex-1 max-w-[640px] 2xl:max-w-[700px] h-full mx-auto px-2 gap-1 sm:gap-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  title={tab.label}
                  aria-label={tab.label}
                  aria-current={tab.isActive ? "page" : undefined}
                  className={`flex-1 max-w-[110px] lg:max-w-[124px] h-full flex items-center justify-center relative cursor-pointer border-b-[3px] transition duration-150 ${
                    tab.isActive
                      ? "border-[#e02f21] text-[#e02f21]"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  <div
                    className={`w-full h-[46px] my-auto rounded-xl flex items-center justify-center transition duration-150 ${
                      tab.isActive
                        ? ""
                        : "hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"
                    }`}
                  >
                    <Icon
                      size={26}
                      className={tab.isActive ? "text-[#e02f21]" : "text-gray-500 dark:text-gray-400"}
                      strokeWidth={tab.isActive ? 2.3 : 2}
                    />
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Right: Action Controls (Mobile Search, Filters, Bell, Lang, Theme, Avatar) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end">
            {/* Mobile Search Toggle Button (Visible on screens < md) */}
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen(true);
                setIsSearchOpen(true);
              }}
              className="xl:hidden w-9 h-9 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer shrink-0"
              title="Search recipes, chefs..."
            >
              <Search size={18} />
            </button>

            {/* Mobile Recipe Filter Toggle Button */}
            {onToggleRightSidebar && (
              <button
                type="button"
                onClick={onToggleRightSidebar}
                className="xl:hidden relative w-9 h-9 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer shrink-0"
                title="Filter Recipes & Food"
              >
                <SlidersHorizontal size={18} />
                {hasActiveFilters && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#e02f21] rounded-full ring-2 ring-white dark:ring-[#242526]" />
                )}
              </button>
            )}

            {/* Messenger Chat Button & Popover (matching Arrow 1 in Image 3 & Image 4) */}
            {user && (
              <div ref={messengerContainerRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsMessengerOpen(!isMessengerOpen);
                    setIsNotifOpen(false);
                  }}
                  title="Messenger"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer relative shrink-0"
                >
                  <MessageCircle size={20} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#e02f21] text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#242526]">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </button>

                {isMessengerOpen && (
                  <MessengerDropdown
                    onClose={() => setIsMessengerOpen(false)}
                    onOpenFullChat={() => {
                      setIsMessengerOpen(false);
                      navigate("/messages");
                    }}
                  />
                )}
              </div>
            )}

            {/* Notification Bell Button & Popover */}
            {user && (
              <div ref={notifContainerRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsMessengerOpen(false);
                  }}
                  title="Notifications"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center transition cursor-pointer relative shrink-0"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#e02f21] text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#242526]">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <NotificationDropdown
                    notifications={notifications}
                    onClose={() => setIsNotifOpen(false)}
                    onMarkAllRead={handleMarkAllRead}
                    onMarkRead={handleMarkRead}
                    onAction={handleNotificationAction}
                  />
                )}
              </div>
            )}

            {/* Desktop Language Switcher (Visible on md and larger) */}
            <button
              type="button"
              onClick={toggleLanguage}
              title="Toggle Language"
              className="hidden lg:flex w-10 h-10 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 items-center justify-center font-bold text-sm transition cursor-pointer shrink-0"
            >
              {language === "en" ? "বাং" : "EN"}
            </button>

            {/* Desktop Dark Mode Toggle (Visible on md and larger) */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Dark Mode"
              className="hidden lg:flex w-10 h-10 rounded-full bg-[#f0f2f5] dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 items-center justify-center transition cursor-pointer shrink-0"
            >
              {darkMode ? (
                <Sun size={19} className="text-amber-400" />
              ) : (
                <Moon size={19} />
              )}
            </button>

            {/* User Avatar Menu */}
            {user ? (
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="Account menu"
                  aria-expanded={dropdownOpen}
                  className="flex items-center p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer shrink-0"
                >
                  <Avatar src={user.image} alt={user.name} size="md" />
                </button>

                {dropdownOpen && (
                  <div className="social-popover absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-2.5 z-50 max-h-[80dvh] overflow-y-auto">
                    {isDemoMode() && (
                      <p className="px-3 py-2 text-xs text-gray-500">
                        Demo preview · Changes stay in this browser
                      </p>
                    )}
                    <Link
                      to={`/profile/${user.id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition mb-1"
                    >
                      <Avatar src={user.image} alt={user.name} size="md" />
                      <div className="truncate">
                        <p className="font-bold text-base text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          View your profile
                        </p>
                      </div>
                    </Link>

                    {/* Mobile Quick Settings (Language & Appearance) */}
                    <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 my-1 py-1">
                      <button
                        type="button"
                        onClick={toggleLanguage}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <div className="flex items-center gap-3.5">
                          <Globe size={20} />
                          <span>Language</span>
                        </div>
                        <span className="text-sm font-black px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] text-[#e02f21]">
                          {language === "en" ? "বাংলা" : "English"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDarkMode(!darkMode)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <div className="flex items-center gap-3.5">
                          {darkMode ? (
                            <Sun size={20} className="text-amber-400" />
                          ) : (
                            <Moon size={20} />
                          )}
                          <span>Appearance</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-400">
                          {darkMode ? "Dark" : "Light"}
                        </span>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                    <Link
                      to="/friends"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <UserCheck size={20} />
                      <span>Friends & Requests</span>
                    </Link>

                    <Link
                      to="/groups"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <Users size={20} />
                      <span>Your Groups</span>
                    </Link>

                    <Link
                      to="/notifications"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <Bell size={20} />
                      <span>Notifications</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <SettingsIcon size={20} />
                      <span>Settings & Privacy</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left cursor-pointer"
                    >
                      <LogOut size={19} />
                      <span>{isDemoMode() ? 'Exit demo' : 'Log Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#e02f21] hover:bg-[#c22417] text-white text-sm font-bold px-4 sm:px-5 py-2 rounded-full transition shadow-xs"
              >
                Log In
              </Link>
            )}
          </div>

          {/* 2. Mobile Full-Screen / Overlay Search Bar */}
          {isMobileSearchOpen && (
            <div
              ref={mobileSearchRef}
              className="absolute inset-0 bg-white dark:bg-[#242526] z-50 px-3 flex items-center gap-2 animate-in fade-in duration-100"
            >
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setIsSearchOpen(false);
                }}
                className="w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center transition cursor-pointer shrink-0"
                title="Back"
              >
                <ArrowLeft size={20} />
              </button>

              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3.5 top-2.5 text-gray-400"
                />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search recipes, chefs..."
                  className="w-full pl-10 pr-9 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-full text-sm font-medium focus:outline-none dark:text-white"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>
            </div>
          )}
        </div>

        {/* 3. Mobile Navigation Tab Bar (Second Row: h-11, Visible on screens < md) */}
        <nav className="md:hidden flex items-center justify-around w-full h-11 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#242526] px-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                title={tab.label}
                className={`flex-1 h-full flex items-center justify-center border-b-2 transition duration-150 cursor-pointer ${
                  tab.isActive
                    ? "border-[#e02f21] text-[#e02f21]"
                    : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Icon size={22} />
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Floating Bottom-Right Chat Popup / Dock (Matching user's Image 1 & 2) */}
      <FloatingChatDock />
      <Modal
        isOpen={globalMenuOpen}
        onClose={() => setGlobalMenuOpen(false)}
        title="Navigation"
        maxWidth="max-w-sm"
      >
        <div className="p-3">
          <LeftSidebar />
        </div>
      </Modal>
    </>
  );
};

export default SocialHeader;
