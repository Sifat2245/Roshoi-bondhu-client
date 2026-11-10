import type { ReactNode } from "react";
import { ChefHat } from "lucide-react";
import SocialHeader from "../../../widgets/navbar/SocialHeader";
import LeftSidebar from "../../../widgets/left-sidebar/LeftSidebar";

export default function KitchenLayout({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-gray-100">
      <SocialHeader />
      <div className="w-full pt-[100px] md:pt-14 flex items-start">
        <aside
          aria-label="Primary navigation"
          className="w-14 lg:w-[260px] xl:w-[280px] shrink-0 sticky top-[100px] md:top-14 h-[calc(100dvh-100px)] md:h-[calc(100dvh-56px)] overflow-y-auto border-r border-gray-200 dark:border-gray-800 px-1 py-3 lg:p-3"
        >
          <div className="lg:hidden">
            <LeftSidebar compact />
          </div>
          <div className="hidden lg:block">
            <LeftSidebar />
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-3 py-5 sm:p-6 lg:p-8">
          <div className="max-w-[1440px] mx-auto space-y-6">
            <header className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                <ChefHat size={18} className="text-[#e02f21]" /> My kitchen{" "}
                <span className="ml-auto text-xs font-normal">
                  Saved on this device
                </span>
              </div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {title}
                  </h1>
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-500 dark:text-gray-400 max-w-2xl">
                    {description}
                  </p>
                </div>
                {action}
              </div>
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
