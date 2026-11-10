import React from "react";
import { useNavigate } from "react-router";
import { startDemo } from "../../../lib/demo/demo-store";

const DemoAccountsBar = ({ onSelectAccount }) => {
  const navigate = useNavigate();
  const accounts = [
    {
      role: "FOODIE",
      label: "Demo Chef (Rahima)",
      email: "chef.rahima@heshel.com",
      pass: "UserPassword123!",
      color:
        "bg-red-50 text-[#e02f21] dark:bg-red-950/40 dark:text-red-300 border border-red-100 dark:border-red-900/40",
    },
  ];

  return (
    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
        <span>Quick Demo Access (1-Click Fill):</span>
      </div>
      <button
        type="button"
        onClick={() => {
          startDemo();
          navigate("/");
        }}
        className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
      >
        Explore interactive demo
      </button>
      <p className="mt-2 text-center text-[11px] text-gray-500">
        Try the community with sample data. No account needed.
      </p>
      <div className="w-full">
        {accounts.map((acc) => (
          <button
            key={acc.role}
            type="button"
            onClick={() => onSelectAccount(acc.email, acc.pass)}
            className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-95 ${acc.color}`}
          >
            <span>Sign in as {acc.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DemoAccountsBar;
