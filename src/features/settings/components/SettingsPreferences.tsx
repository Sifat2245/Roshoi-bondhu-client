import React, { useState } from 'react';
import { Moon, Sun, Bell, Heart, MessageCircle, Users } from 'lucide-react';
import { useDarkMode } from '../../../context/ThemeContext';
import { getNotificationPreferences, saveNotificationPreferences } from '../../../lib/notification-preferences';

export default function SettingsPreferences() {
  const { darkMode, setDarkMode } = useDarkMode();
  const [preferences, setPreferences] = useState(getNotificationPreferences);
  return <div className="space-y-6">
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#242526] p-5">
      <h2 className="font-bold text-base">Appearance</h2><p className="text-sm text-gray-500 mt-1">Choose how Heshel looks on this device.</p>
      <div className="grid grid-cols-2 gap-3 mt-4">{[{ label: 'Light', value: false, icon: Sun }, { label: 'Dark', value: true, icon: Moon }].map(({ label, value, icon: Icon }) => <button key={label} type="button" aria-pressed={darkMode === value} onClick={() => setDarkMode(value)} className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-semibold transition ${darkMode === value ? 'border-[#e02f21] bg-red-50 dark:bg-red-950/30 text-[#e02f21] dark:text-red-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}><Icon size={18} />{label}</button>)}</div>
    </section>
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#242526] p-5">
      <h2 className="flex items-center gap-2 font-bold text-base"><Bell size={18} />Notification preferences</h2><p className="text-sm text-gray-500 mt-1">Show these updates in your notification feed. Saved on this device.</p>
      <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">{[{ key: 'LIKE', label: 'Likes and reactions', icon: Heart }, { key: 'COMMENT', label: 'Comments on your posts', icon: MessageCircle }, { key: 'GROUP_INVITE', label: 'Group invitations', icon: Users }].map(({ key, label, icon: Icon }) => <label key={key} className="flex items-center justify-between gap-4 py-4 cursor-pointer"><span className="flex items-center gap-3 text-sm font-medium"><Icon size={18} className="text-gray-400 shrink-0" />{label}</span><input type="checkbox" role="switch" aria-label={label} checked={preferences[key]} onChange={() => { const next = { ...preferences, [key]: !preferences[key] }; setPreferences(next); saveNotificationPreferences(next); }} className="toggle toggle-sm checked:bg-[#e02f21] checked:border-[#e02f21] shrink-0" /></label>)}</div>
    </section>
  </div>;
}
