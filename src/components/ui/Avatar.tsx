import React, { useState } from 'react';

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
  const initials = (alt || 'Cook').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <div
      className={`relative inline-block rounded-full overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      {src && failedSource !== src ? <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => {
          setFailedSource(src);
        }}
      /> : <span role="img" aria-label={alt || 'Cook'} className="flex h-full w-full items-center justify-center bg-red-50 text-[#b72b20] dark:bg-red-950/40 dark:text-red-300 font-bold">{initials || 'H'}</span>}
    </div>
  );
};

export default Avatar;

