import React, { useState } from "react";
import { Heart } from "lucide-react";

export default function LikeButton({
  liked,
  onClick,
}: {
  liked: boolean;
  onClick: () => void;
}) {
  const [burst, setBurst] = useState(0);
  return (
    <button
      type="button"
      aria-label={liked ? "Unlike post" : "Like post"}
      aria-pressed={liked}
      onClick={() => {
        if (!liked) setBurst((value) => value + 1);
        onClick();
      }}
      className={`reaction-button relative min-h-11 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer ${liked ? "text-[#e02f21]" : ""}`}
    >
      <span className="relative inline-flex">
        <Heart
          key={burst}
          size={19}
          fill={liked ? "currentColor" : "none"}
          className={burst && liked ? "reaction-pop" : ""}
          aria-hidden="true"
        />
        {burst > 0 && liked && (
          <span
            key={`burst-${burst}`}
            className="reaction-burst"
            aria-hidden="true"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        )}
      </span>
      <span>{liked ? "Liked" : "Like"}</span>
    </button>
  );
}
