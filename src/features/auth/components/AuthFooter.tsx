import React from 'react';
import { Link } from 'react-router';
import { useLanguage } from '../../../context/LanguageContext';

const AuthFooter = () => {
  const { language, toggleLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English (UK)' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ur', label: 'اردو' },
    { code: 'es', label: 'Español' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <footer className="w-full max-w-[1200px] mx-auto px-4 py-8 text-xs text-gray-500 dark:text-gray-400 space-y-3 border-t border-gray-200 dark:border-gray-800 mt-12">
      {/* Languages Row (Matching Image 1) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        {languages.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={toggleLanguage}
            className={`hover:underline cursor-pointer ${
              language === lang.code ? 'font-bold text-gray-800 dark:text-gray-200' : ''
            }`}
          >
            {lang.label}
          </button>
        ))}
        <span className="text-gray-400">•</span>
        <button
          type="button"
          onClick={toggleLanguage}
          className="p-1 px-2 border border-gray-300 dark:border-gray-700 rounded text-[10px] hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          + More languages
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800"></div>

      {/* Nav Links Row (Matching Image 1 & 2) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
        <Link to="/register" className="hover:underline">Sign up</Link>
        <Link to="/login" className="hover:underline">Log in</Link>
        <Link to="/groups" className="hover:underline">Groups</Link>
        <Link to="/forgot-password" className="hover:underline">Forgotten password?</Link>
        <span className="hover:underline cursor-pointer">Recipes</span>
        <span className="hover:underline cursor-pointer">Privacy Policy</span>
        <span className="hover:underline cursor-pointer">Privacy Centre</span>
        <span className="hover:underline cursor-pointer">Terms & Conditions</span>
        <span className="hover:underline cursor-pointer">Cookies</span>
        <span className="hover:underline cursor-pointer">About Heshel</span>
      </div>

      {/* Copyright */}
      <div className="pt-2 text-[11px] text-gray-400">
        Heshel © 2026 • Bengali Culinary Social Media Network
      </div>
    </footer>
  );
};

export default AuthFooter;

