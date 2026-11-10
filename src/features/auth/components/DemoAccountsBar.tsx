import React from "react";
import { Sparkles } from "lucide-react";

interface DemoAccountsBarProps {
  onSelectAccount: (email: string, pass: string) => void;
}

const DemoAccountsBar: React.FC<DemoAccountsBarProps> = ({ onSelectAccount }) => {
  const seedChef = {
    name: "Chef Rahima Sultana",
    email: "chef.rahima@heshel.com",
    pass: "UserPassword123!",
  };

  return (
    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Quick Demo Login
        </span>
        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          Verified User
        </span>
      </div>

      <button
        type="button"
        onClick={() => onSelectAccount(seedChef.email, seedChef.pass)}
        className="w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-between cursor-pointer bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 text-[#e02f21] dark:text-red-300 border border-red-200/80 dark:border-red-900/50 hover:border-[#e02f21] hover:shadow-sm active:scale-[0.99]"
      >
        <div className="flex items-center gap-2 text-left">
          <div className="w-7 h-7 rounded-lg bg-[#e02f21] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
            👩‍🍳
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-xs text-gray-900 dark:text-white">
              {seedChef.name}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
              {seedChef.email}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold bg-[#e02f21] text-white px-2.5 py-1 rounded-lg shrink-0">
          <Sparkles size={12} />
          <span>1-Click Fill</span>
        </div>
      </button>
    </div>
  );
};

export default DemoAccountsBar;
