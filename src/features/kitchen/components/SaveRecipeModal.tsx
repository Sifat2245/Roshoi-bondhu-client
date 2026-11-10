import { useState } from "react";
import { BookOpen, Check, Plus } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../context/ToastContext";
import { kitchenId, rememberRecipe, useKitchen } from "../model/kitchen-store";
import type { Recipe } from "../model/recipe-utils";

export default function SaveRecipeModal({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  const { state, update } = useKitchen();
  const { notify } = useToast();
  const [selected, setSelected] = useState(() => {
    const ids = state.collections
      .filter((c) => c.recipeIds.includes(recipe.id))
      .map((c) => c.id);
    return ids.length ? ids : state.collections.slice(0, 1).map((c) => c.id);
  });
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  function createCollection(event) {
    event.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    if (
      state.collections.some(
        (c) => c.name.toLowerCase() === clean.toLowerCase(),
      )
    ) {
      notify.error("A cookbook with that name already exists.");
      return;
    }
    const id = kitchenId();
    update((s) => {
      s.collections.push({ id, name: clean, recipeIds: [] });
    });
    setSelected((ids) => [...ids, id]);
    setName("");
    setCreating(false);
  }
  function save() {
    try {
      update((s) => {
        rememberRecipe(s, recipe);
        s.collections.forEach((c) => {
          c.recipeIds = c.recipeIds.filter((id) => id !== recipe.id);
          if (selected.includes(c.id)) c.recipeIds.push(recipe.id);
        });
      });
      notify.success(
        selected.length
          ? "Recipe saved to your cookbooks"
          : "Recipe removed from your cookbooks",
      );
      onClose();
    } catch {
      notify.error(
        "Could not save. Please free some device storage and try again.",
      );
    }
  }
  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Save to a cookbook"
      subtitle={recipe.title}
      maxWidth="max-w-md"
    >
      <div className="p-5 sm:p-6 space-y-4">
        <div className="space-y-2">
          {state.collections.map((collection) => (
            <label
              key={collection.id}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${selected.includes(collection.id) ? "border-red-200 dark:border-red-900 bg-red-50/60 dark:bg-red-950/20" : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            >
              <BookOpen size={23} className="shrink-0 text-[#e02f21]" />
              <span className="flex-1 min-w-0">
                <span className="block font-semibold break-words">
                  {collection.name}
                </span>
                <span className="block text-sm text-gray-500">
                  {collection.recipeIds.length} recipes
                </span>
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#e02f21]"
                checked={selected.includes(collection.id)}
                onChange={() =>
                  setSelected((ids) =>
                    ids.includes(collection.id)
                      ? ids.filter((id) => id !== collection.id)
                      : [...ids, collection.id],
                  )
                }
              />
            </label>
          ))}
        </div>
        {creating ? (
          <form onSubmit={createCollection} className="flex gap-2">
            <input
              autoFocus
              aria-label="New cookbook name"
              maxLength={45}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunday lunches"
              className="kitchen-input flex-1"
              required
            />
            <Button type="submit" size="sm">
              Create
            </Button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 text-sm font-semibold text-[#e02f21] py-2"
          >
            <Plus size={18} />
            Create a cookbook
          </button>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Only you can see your cookbooks. Saved on this device.
        </p>
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button icon={Check} onClick={save}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
