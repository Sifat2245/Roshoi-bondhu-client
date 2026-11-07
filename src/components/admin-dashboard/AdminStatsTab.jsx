import React from 'react';
import { Users, Utensils, Flag, Shield } from 'lucide-react';

const AdminStatsTab = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Registered Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    },
    {
      label: 'Total Recipes & Posts',
      value: stats?.totalPosts || 0,
      icon: Utensils,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    {
      label: 'Active Foodie Groups',
      value: stats?.totalGroups || 0,
      icon: Shield,
      color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    },
    {
      label: 'Pending Flagged Reports',
      value: stats?.pendingReports || 0,
      icon: Flag,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white dark:bg-[#242526] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">{card.label}</p>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {card.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStatsTab;

