import { useState } from "react";
import {
  Bookmark,
  ChefHat,
  CalendarPlus,
  ShoppingBasket,
  Minus,
  Plus,
  Star,
} from "lucide-react";
import { Link } from "react-router";
import { useKitchen, kitchenId } from "../model/kitchen-store";
import {
  ingredientText,
  scaleIngredient,
  recipeSteps,
  type Recipe,
} from "../model/recipe-utils";
import SaveRecipeModal from "./SaveRecipeModal";
import CookingModeModal from "./CookingModeModal";
import CookedReviewModal from "./CookedReviewModal";
import PlanRecipeModal from "./PlanRecipeModal";
import Avatar from "../../../components/ui/Avatar";
import { useToast } from "../../../context/ToastContext";

export default function RecipeExperience({ recipe }: { recipe: Recipe }) {
  const { state, update } = useKitchen();
  const { notify } = useToast();
  const [tool, setTool] = useState("");
  const [servings, setServings] = useState(Number(recipe.servings) || 2);
  const [checked, setChecked] = useState<number[]>([]);
  const saved = state.collections.some((c) => c.recipeIds.includes(recipe.id));
  const steps = recipeSteps(recipe);
  const reviews = state.reviews.filter(
    (review) => review.recipeId === recipe.id,
  );
  const ingredients = (recipe.ingredients || []).map((item) =>
    scaleIngredient(
      ingredientText(item),
      servings / (Number(recipe.servings) || 2),
    ),
  );
  return (
    <div className="space-y-5">
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        aria-label="Recipe tools"
      >
        {[
          {
            id: "save",
            label: saved ? "Saved" : "Save recipe",
            icon: Bookmark,
          },
          { id: "cook", label: "Cook now", icon: ChefHat },
          { id: "plan", label: "Plan a meal", icon: CalendarPlus },
          { id: "review", label: "I cooked this", icon: Star },
        ].map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => setTool(id)}
            disabled={id === "cook" && !steps.length}
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-xl border py-3 px-2 text-sm font-semibold transition disabled:opacity-40 ${id === "cook" ? "bg-[#e02f21] border-[#e02f21] text-white hover:bg-[#c22417]" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
          >
            <Icon
              size={18}
              fill={id === "save" && saved ? "currentColor" : "none"}
            />
            {label}
          </button>
        ))}
      </div>
      <section className="rounded-2xl bg-gray-50 dark:bg-[#18191a] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <h3 className="font-bold text-base">Ingredients</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Servings</span>
            <button
              type="button"
              aria-label="Fewer servings"
              disabled={servings <= 1}
              onClick={() => setServings((n) => Math.max(1, n - 1))}
              className="p-2 rounded-full bg-white dark:bg-[#3a3b3c] disabled:opacity-30"
            >
              <Minus size={15} />
            </button>
            <output
              aria-label="Recipe servings"
              className="font-bold w-6 text-center"
            >
              {servings}
            </output>
            <button
              type="button"
              aria-label="More servings"
              disabled={servings >= 24}
              onClick={() => setServings((n) => Math.min(24, n + 1))}
              className="p-2 rounded-full bg-white dark:bg-[#3a3b3c] disabled:opacity-30"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {ingredients.map((item, i) => (
            <label
              key={i}
              className="flex items-start gap-3 cursor-pointer text-sm sm:text-base"
            >
              <input
                type="checkbox"
                className="mt-1.5 accent-[#e02f21] h-4 w-4 shrink-0"
                checked={checked.includes(i)}
                onChange={() =>
                  setChecked((ids) =>
                    ids.includes(i)
                      ? ids.filter((id) => id !== i)
                      : [...ids, i],
                  )
                }
              />
              <span
                className={
                  checked.includes(i) ? "line-through text-gray-400" : ""
                }
              >
                {item}
              </span>
            </label>
          ))}
        </div>
        {!ingredients.length ? (
          <p className="text-sm text-gray-500">
            The author hasn’t added ingredients yet.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-400">
              Seasonings listed “to taste” stay the same when servings change.
            </p>
            <button
              type="button"
              onClick={() => {
                update((s) => {
                  const sourcePrefix = `${recipe.title} · serves `;
                  const oldIds = s.shopping
                    .filter((item) => item.source?.startsWith(sourcePrefix))
                    .map((item) => item.id);
                  s.shopping = s.shopping.filter(
                    (item) => !oldIds.includes(item.id),
                  );
                  s.checkedShopping = s.checkedShopping.filter(
                    (id) => !oldIds.includes(id),
                  );
                  ingredients.forEach((text) =>
                    s.shopping.push({
                      id: kitchenId(),
                      text,
                      source: `${recipe.title} · serves ${servings}`,
                    }),
                  );
                });
                notify.success("Ingredients added to your shopping list");
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#e02f21]"
            >
              <ShoppingBasket size={17} />
              Add ingredients to shopping list
            </button>
          </>
        )}
      </section>
      <section>
        <h3 className="text-base font-bold mb-4">How to make it</h3>
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="h-7 w-7 rounded-full bg-red-50 dark:bg-red-950/30 text-[#e02f21] flex items-center justify-center font-bold text-sm shrink-0">
                {i + 1}
              </span>
              <div>
                <h4 className="font-semibold text-sm sm:text-base">
                  {step.title}
                </h4>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  {step.details}
                </p>
              </div>
            </li>
          ))}
        </ol>
        {!steps.length && (
          <p className="text-sm text-gray-500">
            Cooking steps haven’t been added yet.
          </p>
        )}
      </section>
      <section className="border-t border-gray-100 dark:border-gray-700 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="font-bold text-base">
            From other kitchens{" "}
            <span className="text-gray-400 font-normal">
              ({reviews.length})
            </span>
          </h3>
          <button
            type="button"
            onClick={() => setTool("review")}
            className="text-sm font-semibold text-[#e02f21]"
          >
            Add your experience
          </button>
        </div>
        <div className="space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex gap-2.5 items-center">
                <Avatar
                  src={review.author.image}
                  alt={review.author.name}
                  size="sm"
                />
                <div>
                  <Link
                    to={`/profile/${review.author.id}`}
                    className="text-sm font-bold hover:underline"
                  >
                    {review.author.name}
                  </Link>
                  <div
                    className="flex gap-0.5 mt-1 text-amber-500"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={12}
                        fill={n <= review.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
                <span className="ml-auto text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm leading-relaxed mt-3 break-words">
                {review.text}
              </p>
              {review.image && (
                <img
                  src={review.image}
                  alt={`${review.author.name}’s version of ${recipe.title}`}
                  loading="lazy"
                  className="mt-3 h-28 w-36 rounded-lg object-cover"
                />
              )}
            </article>
          ))}
        </div>
        {!reviews.length && (
          <p className="rounded-xl bg-gray-50 dark:bg-[#18191a] p-4 text-sm text-gray-500">
            Cooked this recipe? Be the first to share how it went.
          </p>
        )}
      </section>
      {tool === "save" && (
        <SaveRecipeModal recipe={recipe} onClose={() => setTool("")} />
      )}
      {tool === "cook" && (
        <CookingModeModal
          recipe={recipe}
          servings={servings}
          onClose={() => setTool("")}
          onReview={() => setTool("review")}
        />
      )}
      {tool === "plan" && (
        <PlanRecipeModal
          recipes={[recipe]}
          initialRecipe={recipe}
          initialServings={servings}
          onClose={() => setTool("")}
        />
      )}
      {tool === "review" && (
        <CookedReviewModal recipe={recipe} onClose={() => setTool("")} />
      )}
    </div>
  );
}
