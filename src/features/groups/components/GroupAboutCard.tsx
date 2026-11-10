import React from "react";
import { Lock, Globe, Eye, History, Shield, Users } from "lucide-react";

const GroupAboutCard = ({ group }) => {
  return (
    <section className="bg-white dark:bg-[#242526] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
      <h2 className="font-bold text-lg text-gray-900 dark:text-white">
        About this group
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed break-words">
        {group.description ||
          "Welcome to our foodie community. Connect with like-minded recipe enthusiasts!"}
      </p>

      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm">
        <div className="flex items-start gap-3">
          {group.privacy === "PRIVATE" ? (
            <Lock size={16} className="text-gray-500 mt-0.5 shrink-0" />
          ) : (
            <Globe size={16} className="text-gray-500 mt-0.5 shrink-0" />
          )}
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              {group.privacy === "PRIVATE" ? "Private" : "Public"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              {group.privacy === "PRIVATE"
                ? "Only members can see who is in the group and what they post."
                : "Anyone can see who is in the group and what they post."}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Eye size={16} className="text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Visible</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Anyone can find this group.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <History size={16} className="text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-gray-900 dark:text-white">History</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Created{" "}
              {new Date(group.createdAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GroupAboutCard;
