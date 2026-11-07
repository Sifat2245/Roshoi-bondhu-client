import React from 'react';
import { useNavigate } from 'react-router';
import {
  Users,
  UserCheck,
  UserPlus,
  Users2,
  Gift,
  ListFilter,
  Settings,
  ChevronRight,
} from 'lucide-react';

const FriendsSidebar = ({
  activeSection,
  onSelectSection,
  requestCount = 0,
}) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Users,
      badge: 0,
      hasChevron: false,
    },
    {
      id: 'requests',
      label: 'Friend requests',
      icon: UserCheck,
      badge: requestCount,
      hasChevron: true,
    },
    {
      id: 'suggestions',
      label: 'Suggestions',
      icon: UserPlus,
      badge: 0,
      hasChevron: true,
    },
    {
      id: 'all',
      label: 'All friends',
      icon: Users2,
      badge: 0,
      hasChevron: true,
    },
    {
      id: 'birthdays',
      label: 'Birthdays',
      icon: Gift,
      badge: 0,
      hasChevron: false,
    },
    {
      id: 'custom',
      label: 'Custom lists',
      icon: ListFilter,
      badge: 0,
      hasChevron: true,
    },
  ];

  const handleItemClick = (id) => {
    if (id === 'all') {
      navigate('/friends/list');
    } else {
      onSelectSection(id);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#242526] h-full flex flex-col p-3 border-r border-gray-200 dark:border-gray-800 shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between px-2 py-3 mb-1">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Friends
        </h1>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition cursor-pointer"
          title="Friend Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-base font-bold transition cursor-pointer ${
                isActive
                  ? 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-[#3a3b3c]/60'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-[#e02f21] text-white shadow-xs'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <Icon size={19} />
                </div>
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#e02f21] text-white text-xs font-black">
                    {item.badge}
                  </span>
                )}
                {item.hasChevron && (
                  <ChevronRight size={18} className="text-gray-400" />
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default FriendsSidebar;

