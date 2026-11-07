import React from 'react';
import { ChefHat, Sparkles } from 'lucide-react';

const DemoAccountsBar = ({ onSelectAccount }) => {
  const accounts = [
    {
      role: 'FOODIE',
      label: 'Demo Chef (Rahima)',
      email: 'chef.rahima@heshel.com',
      pass: 'UserPassword123!',
      color: 'bg-red-50 text-[#e02f21] dark:bg-red-950/40 dark:text-red-300 border border-red-100 dark:border-red-900/40',
      icon: ChefHat,
    },
  ];

  return (
    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
        <Sparkles size={14} className="text-amber-500" />
        <span>Quick Demo Access (1-Click Fill):</span>
      </div>
      <div className="w-full">
        {accounts.map((acc) => {
          const Icon = acc.icon;
          return (
            <button
              key={acc.role}
              type="button"
              onClick={() => onSelectAccount(acc.email, acc.pass)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-95 ${acc.color}`}
            >
              <Icon size={16} />
              <span>Sign in as {acc.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DemoAccountsBar;

