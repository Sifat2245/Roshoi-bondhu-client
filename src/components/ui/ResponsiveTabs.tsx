import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface ResponsiveTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  accent?: boolean;
}

export interface ResponsiveTabsProps {
  items: ResponsiveTabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Fixed visible count before collapsing remaining items into "More". Overrides breakpoints when provided. */
  visibleCount?: number;
  /** Responsive visible tab counts by viewport width: xs (<540), sm (<768), md (<1280), lg (>=1280). */
  breakpoints?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  variant?: "pill" | "soft";
  size?: "sm" | "md";
  dropdownAlign?: "left" | "right";
  className?: string;
}

export const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({
  items,
  activeId,
  onSelect,
  visibleCount,
  breakpoints,
  variant = "pill",
  size = "md",
  dropdownAlign = "right",
  className = "",
}) => {
  const [showMore, setShowMore] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount !== undefined) return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visibleCount]);

  useEffect(() => {
    if (!showMore) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMore(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMore]);

  const resolvedVisibleCount = (() => {
    if (visibleCount !== undefined) return visibleCount;
    const bp = {
      xs: breakpoints?.xs ?? 2,
      sm: breakpoints?.sm ?? 3,
      md: breakpoints?.md ?? 4,
      lg: breakpoints?.lg ?? items.length,
    };
    if (windowWidth < 540) return bp.xs;
    if (windowWidth < 768) return bp.sm;
    if (windowWidth < 1280) return bp.md;
    return bp.lg;
  })();

  const visibleItems = items.slice(0, resolvedVisibleCount);
  const overflowItems = items.slice(resolvedVisibleCount);
  const activeOverflowItem = overflowItems.find((item) => item.id === activeId);
  const isOverflowActive = Boolean(activeOverflowItem);
  const overflowBadgeTotal = overflowItems.reduce(
    (sum, item) => sum + (item.badge || 0),
    0
  );

  const sizeClass =
    size === "sm"
      ? "px-3 py-1.5 rounded-full text-xs font-bold gap-1.5"
      : "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold gap-1.5";

  const getTabClass = (isSelected: boolean, accent?: boolean) => {
    if (variant === "soft") {
      return isSelected
        ? "bg-red-50 text-[#e02f21] dark:bg-red-950/60"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800";
    }
    if (isSelected) {
      return "bg-[#e02f21] text-white shadow-xs";
    }
    if (accent) {
      return "bg-red-50 text-[#e02f21] dark:bg-red-950/60 hover:bg-red-100 border border-red-100 dark:border-red-900/40";
    }
    return "bg-white dark:bg-[#242526] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800";
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {visibleItems.map((item) => {
        const isSelected = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSelect(item.id);
              setShowMore(false);
            }}
            className={`whitespace-nowrap transition cursor-pointer flex items-center shrink-0 ${sizeClass} ${getTabClass(
              isSelected,
              item.accent
            )}`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none ${
                  isSelected
                    ? "bg-white text-[#e02f21]"
                    : "bg-[#e02f21] text-white"
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      {overflowItems.length > 0 && (
        <div ref={moreRef} className="relative">
          <button
            type="button"
            onClick={() => setShowMore((prev) => !prev)}
            aria-expanded={showMore}
            className={`whitespace-nowrap transition cursor-pointer flex items-center shrink-0 ${sizeClass} ${getTabClass(
              isOverflowActive
            )}`}
          >
            {activeOverflowItem?.icon}
            <span>{isOverflowActive ? activeOverflowItem?.label : "More"}</span>
            {!isOverflowActive && overflowBadgeTotal > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none bg-[#e02f21] text-white">
                {overflowBadgeTotal}
              </span>
            )}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                showMore ? "rotate-180" : ""
              }`}
            />
          </button>

          {showMore && (
            <div
              className={`absolute top-full mt-1.5 w-48 bg-white dark:bg-[#242526] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-40 ${
                dropdownAlign === "right" ? "right-0" : "left-0"
              }`}
            >
              {overflowItems.map((item) => {
                const isSelected = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item.id);
                      setShowMore(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm font-bold flex items-center justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? "bg-red-50 dark:bg-red-950/30 text-[#e02f21]"
                        : item.accent
                        ? "text-[#e02f21] hover:bg-red-50/70 dark:hover:bg-red-950/20"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0 truncate">
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none bg-[#e02f21] text-white">
                          {item.badge}
                        </span>
                      )}
                      {isSelected && <Check size={14} className="text-[#e02f21]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResponsiveTabs;

