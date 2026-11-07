import React from 'react';
import { Shield, UserCheck, Sparkles } from 'lucide-react';

const DemoAccountsBar = ({ onSelectAccount }) => {
  const accounts = [
    {
      role: 'ADMIN',
      label: 'Admin',
      email: 'admin@heshel.com',
      pass: 'AdminPassword123!',
      color: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
      icon: Shield,
    },
    {
      role: 'MODERATOR',
      label: 'Moderator',
      email: 'moderator@heshel.com',
      pass: 'ModPassword123!',
      color: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
      icon: Shield,
    },
    {
      role: 'FOODIE',
      label: 'Foodie Chef',
      email: 'chef.rahima@heshel.com',
      pass: 'UserPassword123!',
      color: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
      icon: UserCheck,
    },
  ];

  return (
    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
        <Sparkles size={14} className="text-amber-500" />
        <span>Quick Demo Access (1-Click Fill):</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {accounts.map((acc) => {
          const Icon = acc.icon;
          return (
            <button
              key={acc.role}
              type="button"
              onClick={() => onSelectAccount(acc.email, acc.pass)}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 ${acc.color}`}
            >
              <Icon size={13} />
              <span>{acc.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DemoAccountsBar;

