import { useState } from "react";
import { Search, Clock, CalendarDays, Check } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../context/ToastContext";
import { kitchenId, rememberRecipe, useKitchen } from "../model/kitchen-store";
import { localDate, recipeTime, type Recipe } from "../model/recipe-utils";

export default function PlanRecipeModal({
  recipes,
  initialRecipe,
  initialServings,
  editingMealId,
  date = localDate(),
  slot = "Dinner",
  onClose,
}: {
  recipes: Recipe[];
  initialRecipe?: Recipe;
  initialServings?: number;
  editingMealId?: string;
  date?: string;
  slot?: string;
  onClose: () => void;
}) {
  const { update } = useKitchen();
  const { notify } = useToast();
  const [selected, setSelected] = useState(initialRecipe || null);
  const [search, setSearch] = useState("");
  const [mealDate, setMealDate] = useState(date);
  const [mealSlot, setMealSlot] = useState(slot);
  const [servings, setServings] = useState(
    initialServings || initialRecipe?.servings || 2,
  );
  function save(event) {
    event.preventDefault();
    if (!selected || !mealDate || servings < 1 || servings > 24) return;
    update((s) => {
      rememberRecipe(s, selected);
      const editing = s.meals.find((m) => m.id === editingMealId);
      const destination = s.meals.find(
        (m) => m.date === mealDate && m.slot === mealSlot,
      );
      const previous = editing || destination;
      const unchanged = previous && previous.recipeId === selected.id && previous.servings === servings && previous.date === mealDate && previous.slot === mealSlot;
      const resetIds = [editing, destination].filter((m) => m && (!unchanged || m.id !== previous.id)).map((m) => m.id);
      s.checkedShopping = s.checkedShopping.filter((key) => !resetIds.some((id) => key.startsWith(id + ':')));
      s.meals = s.meals.filter(
        (m) => m.id !== editingMealId && (m.date !== mealDate || m.slot !== mealSlot),
      );
      s.meals.push({
        id: previous?.id || kitchenId(),
        recipeId: selected.id,
        date: mealDate,
        slot: mealSlot,
        servings,
      });
    });
    notify.success(
      `${mealSlot} planned. Ingredients added to your shopping list.`,
    );
    onClose();
  }
  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Make room for something delicious"
      subtitle="Plan a meal and we’ll list the ingredients for you."
      maxWidth="max-w-lg"
    >
      <div className="p-5 sm:p-6 space-y-4">
        {!selected ? (
          <>
            <label className="relative block">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                autoFocus
                aria-label="Find a recipe to plan"
                placeholder="Find a recipe"
                className="kitchen-input w-full pl-10!"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recipes
                .filter((p) =>
                  `${p.title} ${p.author?.name}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((recipe) => (
                  <button
                    type="button"
                    key={recipe.id}
                    onClick={() => {
                      setSelected(recipe);
                      setServings(recipe.servings || 2);
                    }}
                    className="flex items-center gap-3 w-full rounded-xl p-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt=""
                        className="w-16 h-16 object-cover rounded-lg shrink-0"
                      />
                    ) : (
                      <CalendarDays
                        size={28}
                        className="m-4 shrink-0 text-[#e02f21]"
                      />
                    )}
                    <span className="min-w-0">
                      <span className="block font-semibold">
                        {recipe.title}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Clock size={13} />
                        {recipeTime(recipe)} min · {recipe.author?.name}
                      </span>
                    </span>
                  </button>
                ))}
              {!recipes.some((p) =>
                `${p.title} ${p.author?.name}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              ) && (
                <p className="py-6 text-center text-sm text-gray-500">
                  No recipes found. Try another name.
                </p>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={save} className="space-y-5">
            <div className="rounded-xl bg-gray-50 dark:bg-[#18191a] p-3 flex gap-3 items-center">
              {selected.image && (
                <img
                  src={selected.image}
                  alt=""
                  className="w-16 h-16 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="font-bold">{selected.title}</p>
                {recipes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-sm text-[#e02f21] mt-1"
                  >
                    Choose another recipe
                  </button>
                )}
              </div>
            </div>
            <label className="block text-sm font-semibold">
              Day
              <input
                type="date"
                required
                value={mealDate}
                onChange={(e) => setMealDate(e.target.value)}
                className="kitchen-input mt-2 w-full"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">
                Meal
                <select
                  value={mealSlot}
                  onChange={(e) => setMealSlot(e.target.value)}
                  className="kitchen-input mt-2 w-full"
                >
                  {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                    <option key={meal}>{meal}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">
                Servings
                <input
                  type="number"
                  min={1}
                  max={24}
                  required
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="kitchen-input mt-2 w-full"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Adding a recipe replaces any meal already planned for that slot.
            </p>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" icon={Check}>
                Plan this meal
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
