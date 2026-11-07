import React from 'react';
import { ListFilter, Plus, Users, Star } from 'lucide-react';
import Button from '../../../components/ui/Button';

const CustomListsView = () => {
  const lists = [
    { name: 'Close Foodie Buddies', members: 6, icon: Star },
    { name: 'Master Chefs & Mentors', members: 3, icon: Users },
    { name: 'Secret Recipe Tasters', members: 12, icon: Users },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Custom Lists
        </h2>
        <Button className="px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5">
          <Plus size={14} />
          <span>Create List</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {lists.map((list) => {
          const Icon = list.icon;
          return (
            <div
              key={list.name}
              className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs hover:shadow-md transition space-y-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#e02f21] flex items-center justify-center">
                <Icon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {list.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {list.members} members
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomListsView;

