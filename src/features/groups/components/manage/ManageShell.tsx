import React from "react";
import { ChevronLeft, Home } from "lucide-react";
import Button from "../../../../components/ui/Button";

interface ManageShellProps {
  groupName: string;
  title: string;
  subtitle: string;
  onBackMobileHub: () => void;
  onBackHome: () => void;
  children: React.ReactNode;
}

export const ManageShell: React.FC<ManageShellProps> = ({
  groupName,
  title,
  subtitle,
  onBackMobileHub,
  onBackHome,
  children,
}) => {
  return (
    <div className="min-h-full flex flex-col">
      {/* Mobile Sticky Sub-header pinned directly at top of scroll container */}
      <div className="lg:hidden sticky top-0 z-20 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-gray-800 px-3 py-3 flex items-center justify-between gap-3 shadow-xs">
        <button
          type="button"
          onClick={onBackMobileHub}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-800 dark:text-gray-100 cursor-pointer shrink-0"
        >
          <ChevronLeft size={20} />
          <span>Manage</span>
        </button>
        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
          {title}
        </span>
        <button
          type="button"
          onClick={onBackHome}
          className="text-xs font-bold text-[#e02f21] shrink-0 cursor-pointer"
        >
          Group home
        </button>
      </div>

      {/* Main Content Container */}
      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {/* Desktop Breadcrumb Header */}
        <div className="hidden lg:flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              <button
                type="button"
                onClick={onBackHome}
                className="inline-flex items-center gap-1 hover:text-[#e02f21] transition cursor-pointer"
              >
                <Home size={13} />
                <span>{groupName}</span>
              </button>
              <span>/</span>
              <span>Manage</span>
              <span>/</span>
              <span className="text-gray-800 dark:text-gray-200">{title}</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onBackHome}
            className="shrink-0 cursor-pointer"
          >
            View community home
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default ManageShell;

