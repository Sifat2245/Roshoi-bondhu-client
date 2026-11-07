import React from 'react';
import { Link } from 'react-router';
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  User,
  Edit2,
  Settings as SettingsIcon,
  ChefHat,
  Heart,
} from 'lucide-react';
import Button from '../ui/Button';

const ProfileIntroCard = ({ profile, isOwnProfile, onOpenEditModal }) => {
  return (
    <div className="space-y-4">
      {/* 1. Personal Details Card (Matching Image 2) */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            Personal details
          </h3>
          {isOwnProfile && (
            <button
              type="button"
              onClick={onOpenEditModal}
              title="Edit Personal details"
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#e02f21] hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <Edit2 size={15} />
            </button>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line border-b border-gray-100 dark:border-gray-800 pb-3">
            {profile.bio}
          </p>
        )}

        {/* List of Details */}
        <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-gray-400 shrink-0" />
            <span>
              Lives in{' '}
              <strong className="text-gray-900 dark:text-white">
                {profile.city || 'Dhaka, Bangladesh'}
              </strong>
            </span>
          </div>

          {profile.gender && (
            <div className="flex items-center gap-3">
              <User size={16} className="text-gray-400 shrink-0" />
              <span>{profile.gender}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Mail size={16} className="text-gray-400 shrink-0" />
            <span className="truncate">{profile.email}</span>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-400 shrink-0" />
              <span>{profile.phone}</span>
            </div>
          )}
        </div>

        {/* Edit Details Action Button */}
        {isOwnProfile && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenEditModal}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Edit details
            </button>
          </div>
        )}
      </div>

      {/* 2. Work & Career Card (Matching Image 2) */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Work</h3>
          {isOwnProfile && (
            <button
              type="button"
              onClick={onOpenEditModal}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#e02f21] hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <Edit2 size={15} />
            </button>
          )}
        </div>

        <div className="flex items-start gap-3 text-xs">
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <Briefcase size={16} />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              {profile.work || 'Passionate Home Chef'}
            </p>
            <p className="text-[11px] text-gray-400">Culinary Creator at Hesheli</p>
          </div>
        </div>
      </div>

      {/* 3. Education Card (Matching Image 2) */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Education</h3>
          {isOwnProfile && (
            <button
              type="button"
              onClick={onOpenEditModal}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#e02f21] hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <Edit2 size={15} />
            </button>
          )}
        </div>

        <div className="flex items-start gap-3 text-xs">
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <GraduationCap size={16} />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              {profile.education || 'Self-Taught Culinary Enthusiast'}
            </p>
            <p className="text-[11px] text-gray-400">Bengali & International Gastronomy</p>
          </div>
        </div>
      </div>

      {/* 4. Settings Shortcut Box */}
      {isOwnProfile && (
        <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-[#242526] dark:to-gray-800 rounded-2xl border border-red-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-gray-900 dark:text-white">
              Account & Security
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Change password, 2FA, phone & login sessions.
            </p>
          </div>
          <Link
            to="/settings"
            className="px-3 py-1.5 bg-[#e02f21] hover:bg-[#c22417] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <SettingsIcon size={14} />
            <span>Settings</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfileIntroCard;

