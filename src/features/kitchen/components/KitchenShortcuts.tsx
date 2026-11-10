import { Link } from "react-router";
import { BookOpen, Carrot, CalendarDays, FilePenLine } from "lucide-react";
import { useKitchen } from "../model/kitchen-store";

export default function KitchenShortcuts() {
  const { state } = useKitchen();
  return (
    <nav
      aria-label="Recipe shortcuts"
      className="grid grid-cols-4 gap-1 rounded-2xl bg-white dark:bg-[#242526] border border-gray-100 dark:border-gray-800 p-2"
    >
      {[
        { to: "/cookbook", label: "Cookbooks", icon: BookOpen },
        { to: "/pantry", label: "My pantry", icon: Carrot },
        { to: "/meal-planner", label: "Meal planner", icon: CalendarDays },
        {
          to: "/drafts",
          label: `Drafts${state.drafts.length ? ` (${state.drafts.length})` : ""}`,
          icon: FilePenLine,
        },
      ].map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex flex-col sm:flex-row items-center justify-center text-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Icon size={18} className="text-[#e02f21] shrink-0" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
