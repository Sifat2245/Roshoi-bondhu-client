import React from 'react';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User',
  size = 'md',
  className = '',
}) => {
  const sizes: Record<string, string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-32 h-32 text-2xl',
  };

  const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120';

  return (
    <div
      className={`relative inline-block rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      <img
        src={src || defaultPhoto}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = defaultPhoto;
        }}
      />
    </div>
  );
};

export default Avatar;

