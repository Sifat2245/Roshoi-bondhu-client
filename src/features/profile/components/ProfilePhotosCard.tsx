import React, { useState } from 'react';
import { Image as ImageIcon, Camera, MoreHorizontal } from 'lucide-react';

interface ProfilePhotosCardProps {
  posts?: any[];
}

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500',
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500',
];

const ProfilePhotosCard: React.FC<ProfilePhotosCardProps> = ({ posts = [] }) => {
  const [subTab, setSubTab] = useState<'PHOTOS_OF_YOU' | 'UPLOADS' | 'ALBUMS'>('PHOTOS_OF_YOU');

  // Gather uploaded images from actual posts
  const postImages = posts.filter((p) => p.image).map((p) => p.image);
  const displayImages = postImages.length > 0 ? postImages : DEFAULT_PHOTOS;

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Photos</h2>
          <p className="text-sm text-gray-500 font-medium">{displayImages.length} photos</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
        <button
          type="button"
          onClick={() => setSubTab('PHOTOS_OF_YOU')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            subTab === 'PHOTOS_OF_YOU'
              ? 'bg-red-50 dark:bg-red-950/40 text-[#e02f21]'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Photos of you
        </button>
        <button
          type="button"
          onClick={() => setSubTab('UPLOADS')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            subTab === 'UPLOADS'
              ? 'bg-red-50 dark:bg-red-950/40 text-[#e02f21]'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Your photos & recipes
        </button>
        <button
          type="button"
          onClick={() => setSubTab('ALBUMS')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            subTab === 'ALBUMS'
              ? 'bg-red-50 dark:bg-red-950/40 text-[#e02f21]'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Albums
        </button>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
        {displayImages.map((imgUrl, index) => (
          <div
            key={index}
            className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative group cursor-pointer shadow-xs"
          >
            <img
              src={imgUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
              <Camera size={20} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePhotosCard;

