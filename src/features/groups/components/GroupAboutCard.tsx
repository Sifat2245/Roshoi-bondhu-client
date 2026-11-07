import React from 'react';
import { Lock, Globe, Eye, History, Shield, Users } from 'lucide-react';

const GroupAboutCard = ({ group }) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
        About this group
      </h3>

      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
        {group.description || 'Welcome to our foodie community. Connect with like-minded recipe enthusiasts!'}
      </p>

      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
        <div className="flex items-start gap-3">
          {group.privacy === 'PRIVATE' ? (
            <Lock size={16} className="text-gray-500 mt-0.5 shrink-0" />
          ) : (
            <Globe size={16} className="text-gray-500 mt-0.5 shrink-0" />
          )}
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              {group.privacy === 'PRIVATE' ? 'Private' : 'Public'}
            </p>
            <p className="text-gray-500 text-[11px]">
              {group.privacy === 'PRIVATE'
                ? 'Only members can see who is in the group and what they post.'
                : 'Anyone can see who is in the group and what they post.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Eye size={16} className="text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Visible</p>
            <p className="text-gray-500 text-[11px]">Anyone can find this group.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <History size={16} className="text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white">History</p>
            <p className="text-gray-500 text-[11px]">
              Created on {new Date(group.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupAboutCard;

