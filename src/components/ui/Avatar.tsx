import React, { useState } from 'react';
import defaultUserAvatar from '../../assets/user-image.png';

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

  const [failedSource, setFailedSource] = useState<string | null>(null);
  const imageSource = src && failedSource !== src ? src : defaultUserAvatar;

  return (
    <div
      className={`relative inline-block rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      <img
        src={imageSource}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => {
          if (src) setFailedSource(src);
        }}
      />
    </div>
  );
};

export default Avatar;
