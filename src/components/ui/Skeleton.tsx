import React from 'react';

// Single Line Skeleton
export const SkeletonLine = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-gray-200 dark:bg-[#3a3b3c] rounded-md animate-pulse ${className}`} />
);

// Single Circle / Avatar Skeleton
export const SkeletonCircle = ({ size = 'w-10 h-10', className = '' }) => (
  <div className={`${size} rounded-full bg-gray-200 dark:bg-[#3a3b3c] animate-pulse shrink-0 ${className}`} />
);

// Post Card Skeleton (Facebook Style)
export const PostSkeleton = () => (
  <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3.5">
    {/* Author Row */}
    <div className="flex items-center gap-3">
      <SkeletonCircle size="w-10 h-10" />
      <div className="space-y-1.5 flex-1">
        <SkeletonLine className="h-3.5 w-32" />
        <SkeletonLine className="h-2.5 w-20" />
      </div>
    </div>

    {/* Caption Lines */}
    <div className="space-y-2 pt-1">
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-4/5" />
    </div>

    {/* Post Image Placeholder */}
    <div className="w-full h-56 sm:h-72 rounded-xl bg-gray-200 dark:bg-[#3a3b3c] animate-pulse" />

    {/* Bottom Actions Row */}
    <div className="pt-2 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2">
      <SkeletonLine className="h-8 rounded-lg" />
      <SkeletonLine className="h-8 rounded-lg" />
      <SkeletonLine className="h-8 rounded-lg" />
    </div>
  </div>
);

// Profile Header Skeleton
export const ProfileHeaderSkeleton = () => (
  <div className="w-full bg-white dark:bg-[#242526] shadow-xs">
    {/* Contained Banner */}
    <div className="max-w-[1095px] mx-auto px-0 sm:px-4 pt-0 sm:pt-4">
      <div className="h-60 sm:h-80 md:h-[360px] w-full bg-gray-200 dark:bg-[#3a3b3c] sm:rounded-2xl animate-pulse" />
    </div>

    {/* Overlapping Avatar & User Row */}
    <div className="max-w-[1095px] mx-auto px-4 sm:px-8 pb-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 sm:-mt-24 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gray-300 dark:bg-[#4e4f50] ring-4 sm:ring-[5px] ring-white dark:ring-[#242526] animate-pulse self-center sm:self-auto shrink-0" />
          <div className="space-y-2 mb-2 text-center sm:text-left">
            <SkeletonLine className="h-6 w-48 sm:w-64 mx-auto sm:mx-0" />
            <SkeletonLine className="h-3.5 w-36 mx-auto sm:mx-0" />
            <SkeletonLine className="h-3 w-56 mx-auto sm:mx-0" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center sm:justify-end gap-2 pb-2">
          <SkeletonLine className="h-9 w-28 rounded-xl" />
          <SkeletonLine className="h-9 w-28 rounded-xl" />
        </div>
      </div>
    </div>

    {/* Tabs Skeleton */}
    <div className="border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-[1095px] mx-auto px-4 sm:px-8 py-3.5 flex items-center gap-4">
        <SkeletonLine className="h-4 w-20" />
        <SkeletonLine className="h-4 w-24" />
        <SkeletonLine className="h-4 w-16" />
        <SkeletonLine className="h-4 w-16" />
      </div>
    </div>
  </div>
);

// Profile Intro Card Skeleton
export const ProfileIntroSkeleton = () => (
  <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
    <SkeletonLine className="h-4 w-32" />
    <SkeletonLine className="h-3 w-full" />
    <SkeletonLine className="h-3 w-4/5" />
    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
      <SkeletonLine className="h-3.5 w-44" />
      <SkeletonLine className="h-3.5 w-40" />
      <SkeletonLine className="h-3.5 w-48" />
    </div>
  </div>
);

// Group Header Skeleton
export const GroupHeaderSkeleton = () => (
  <div className="w-full bg-white dark:bg-[#242526] shadow-xs border-b border-gray-200 dark:border-gray-800">
    <div className="max-w-[1095px] mx-auto px-0 sm:px-4 pt-0 sm:pt-4">
      <div className="h-52 sm:h-72 w-full bg-gray-200 dark:bg-[#3a3b3c] sm:rounded-2xl animate-pulse" />
    </div>
    <div className="max-w-[1095px] mx-auto px-4 sm:px-8 py-5 space-y-3">
      <SkeletonLine className="h-7 w-64" />
      <SkeletonLine className="h-3.5 w-40" />
      <div className="flex items-center gap-2 pt-2">
        <SkeletonLine className="h-9 w-24 rounded-xl" />
        <SkeletonLine className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  </div>
);

// Group Card Skeleton (For Groups List)
export const GroupCardSkeleton = () => (
  <div className="bg-white dark:bg-[#242526] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm space-y-3 p-4">
    <div className="h-32 w-full rounded-xl bg-gray-200 dark:bg-[#3a3b3c] animate-pulse" />
    <SkeletonLine className="h-4 w-3/4" />
    <SkeletonLine className="h-3 w-full" />
    <SkeletonLine className="h-3 w-1/2" />
    <SkeletonLine className="h-8 w-full rounded-xl" />
  </div>
);

export default {
  SkeletonLine,
  SkeletonCircle,
  PostSkeleton,
  ProfileHeaderSkeleton,
  ProfileIntroSkeleton,
  GroupHeaderSkeleton,
  GroupCardSkeleton,
};

