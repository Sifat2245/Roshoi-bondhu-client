import React from "react";

export interface ShareIconProps {
  size?: number;
  className?: string;
}

export const ShareIcon: React.FC<ShareIconProps> = ({
  size = 19,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 17a9 9 0 0 1 11.2-8.6l.8.2V5l7 7-7 7v-3.8l-1-.1A9 9 0 0 0 3 17z" />
    </svg>
  );
};

export default ShareIcon;

