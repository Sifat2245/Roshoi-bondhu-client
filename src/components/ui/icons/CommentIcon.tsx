import React from "react";

export interface CommentIconProps {
  size?: number;
  className?: string;
}

export const CommentIcon: React.FC<CommentIconProps> = ({
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
      <path d="M12 2.5C6.753 2.5 2.5 6.438 2.5 11.295c0 2.768 1.382 5.242 3.548 6.858-.17 1.365-.796 3.038-.826 3.12a.475.475 0 0 0 .587.606c1.872-.587 3.506-1.466 4.376-1.986.58.099 1.188.152 1.815.152 5.247 0 9.5-3.938 9.5-8.75S17.247 2.5 12 2.5z" />
    </svg>
  );
};

export default CommentIcon;

