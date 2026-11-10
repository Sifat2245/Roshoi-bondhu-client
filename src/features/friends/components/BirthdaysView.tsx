import React from "react";
import { useChatDock } from "../../../context/ChatDockContext";
import { Gift, Calendar, Heart } from "lucide-react";
import Avatar from "../../../components/ui/Avatar";

const BirthdaysView = ({ friends = [] }) => {
  const { startConversation } = useChatDock();
  const sampleBirthdays = friends.slice(0, 3);

  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        Birthdays
      </h2>

      <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-amber-500 font-bold text-sm">
          <Gift size={20} />
          <span>Upcoming Foodie Birthdays</span>
        </div>

        {sampleBirthdays.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {sampleBirthdays.map((f, i) => (
              <div
                key={f.id}
                className="py-3 flex flex-wrap gap-3 items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={f.image} alt={f.name} size="md" />
                  <div>
                    <p className="font-bold text-xs text-gray-900 dark:text-white">
                      {f.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {i === 0
                        ? "Birthday is today! Wish them a delicious day!"
                        : `Birthday coming up in ${i * 4 + 2} days`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => startConversation(f)}
                  className="px-3 py-1.5 bg-[#e02f21] hover:bg-[#c22417] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Heart size={13} />
                  <span>Send Wishes</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-4">No birthdays today.</p>
        )}
      </div>
    </div>
  );
};

export default BirthdaysView;
