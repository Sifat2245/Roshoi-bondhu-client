import React, { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';

const SplashScreen = ({ onFinish, duration = 1200 }) => {
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, duration - 400);

    const finishTimer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-white dark:bg-[#18191a] text-gray-900 dark:text-white transition-opacity duration-400 select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex-1" />

      {/* Center Logo & Brand Name */}
      <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center p-3 shadow-lg shadow-red-500/10 ring-1 ring-red-100 dark:ring-red-900/30">
            <img
              src={logo}
              alt="Heshel"
              className="w-full h-full object-contain animate-pulse"
            />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            হেঁশেল
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#e02f21] tracking-widest uppercase">
            Heshel Social
          </p>
        </div>
      </div>

      {/* Bottom Meta/Brand Disclaimer */}
      <div className="flex-1 flex flex-col justify-end pb-8 text-center space-y-1">
        <p className="text-[11px] font-semibold text-gray-400">from</p>
        <p className="text-xs font-black tracking-wider text-gray-700 dark:text-gray-300">
          BENGALI CULINARY NETWORK
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;

