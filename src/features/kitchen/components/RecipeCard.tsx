import { Link } from "react-router";
import { Bookmark, Clock, ChefHat } from "lucide-react";
import type { ReactNode } from "react";
import { recipeTime, type Recipe } from "../model/recipe-utils";
import Avatar from "../../../components/ui/Avatar";

export default function RecipeCard({
  recipe,
  saved,
  onSave,
  children,
}: {
  recipe: Recipe;
  saved: boolean;
  onSave: () => void;
  children?: ReactNode;
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#242526] overflow-hidden shadow-xs group">
      <div className="relative aspect-[4/3] overflow-hidden bg-red-50 dark:bg-red-950/20">
        <Link
          to={`/post/${recipe.id}`}
          className="block w-full h-full"
          aria-label={`View ${recipe.title}`}
        >
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-[#e02f21]">
              <ChefHat size={48} />
            </div>
          )}
        </Link>
        <button
          type="button"
          aria-label={
            saved ? `Manage saved ${recipe.title}` : `Save ${recipe.title}`
          }
          aria-pressed={saved}
          onClick={onSave}
          className="absolute top-3 right-3 rounded-full p-2.5 bg-white/95 text-[#e02f21] shadow-sm hover:bg-white"
        >
          <Bookmark size={19} fill={saved ? "currentColor" : "none"} />
        </button>
        {recipeTime(recipe) > 0 && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 bg-white/95 text-gray-800 text-xs font-semibold shadow-sm">
            <Clock size={14} />
            {recipeTime(recipe)} min
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold text-[#e02f21] dark:text-red-400 mb-1">
            {recipe.cuisine || "From a home kitchen"}
          </p>
          <Link
            to={`/post/${recipe.id}`}
            className="font-bold text-base leading-snug hover:underline line-clamp-2"
          >
            {recipe.title || "Untitled recipe"}
          </Link>
        </div>
        <Link
          to={`/profile/${recipe.author?.id}`}
          className="flex min-w-0 items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        >
          <Avatar
            src={recipe.author?.image}
            alt={recipe.author?.name}
            size="xs"
          />
          <span className="truncate">{recipe.author?.name || "Home cook"}</span>
        </Link>
        {children}
      </div>
    </article>
  );
}
