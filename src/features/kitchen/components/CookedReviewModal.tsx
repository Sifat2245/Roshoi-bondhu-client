import { useState } from "react";
import { Star, ImagePlus, X, ChefHat } from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { useSession } from "../../../lib/auth-client";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { kitchenId, rememberRecipe, useKitchen } from "../model/kitchen-store";
import type { Recipe } from "../model/recipe-utils";

export default function CookedReviewModal({
  recipe,
  onClose,
}: {
  recipe: Recipe;
  onClose: () => void;
}) {
  const { state, update } = useKitchen();
  const { data: session } = useSession();
  const { user: authUser } = useAuth();
  const user = session?.user || authUser;
  const { notify } = useToast();
  const existing = state.reviews.find(
    (r) => r.recipeId === recipe.id && r.author.id === user?.id,
  );
  const [rating, setRating] = useState(existing?.rating || 5);
  const [text, setText] = useState(existing?.text || "");
  const [image, setImage] = useState(existing?.image || "");
  const [reading, setReading] = useState(false);
  async function photo(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1500000) {
      notify.error("Choose an image smaller than 1.5 MB.");
      return;
    }
    setReading(true);
    try {
      const result = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setImage(result);
    } catch {
      notify.error("Could not read that image. Please try another.");
    } finally {
      setReading(false);
    }
  }
  function submit(event) {
    event.preventDefault();
    if (text.trim().length < 10 || !user) return;
    try {
      update((s) => {
        rememberRecipe(s, recipe);
        s.reviews = s.reviews.filter(
          (r) => !(r.recipeId === recipe.id && r.author.id === user.id),
        );
        s.reviews.unshift({
          id: existing?.id || kitchenId(),
          recipeId: recipe.id,
          author: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
          rating,
          text: text.trim(),
          image,
          createdAt: new Date().toISOString(),
        });
      });
      notify.success("Your cooking experience has been saved");
      onClose();
    } catch {
      notify.error(
        "Device storage is full. Try a smaller photo or remove an older draft.",
      );
    }
  }
  return (
    <Modal
      isOpen
      onClose={onClose}
      title="I cooked this!"
      subtitle={recipe.title}
      maxWidth="max-w-lg"
    >
      <form onSubmit={submit} className="p-5 sm:p-6 space-y-5">
        <div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-950/20 flex gap-3 items-start">
          <ChefHat size={24} className="text-amber-600 shrink-0" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your version matters. Tell us what worked, what you changed, and how
            it tasted.
          </p>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold mb-3">
            How did it turn out?
          </legend>
          <div className="flex gap-2" role="group" aria-label="Recipe rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                aria-label={`Rate ${n} ${n === 1 ? "star" : "stars"}`}
                aria-pressed={rating === n}
                onClick={() => setRating(n)}
                className="p-1.5 text-amber-500 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                <Star size={30} fill={n <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm font-semibold">
          Your cooking experience
          <textarea
            required
            minLength={10}
            maxLength={1200}
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Any substitutions? A tip for the next cook?"
            className="kitchen-input block w-full mt-2 resize-y"
          />
        </label>
        <div>
          {image ? (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={image}
                alt="Your cooked dish"
                className="w-full max-h-56 object-cover"
              />
              <button
                type="button"
                aria-label="Remove cooking photo"
                onClick={() => setImage("")}
                className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-5 text-sm font-semibold text-gray-500 cursor-pointer">
              <ImagePlus size={22} />
              {reading ? "Reading photo…" : "Add a photo of your plate"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Photo of your cooked dish"
                disabled={reading}
                onChange={(e) => photo(e.target.files?.[0])}
              />
            </label>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Your review is saved on this device.
        </p>
        <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={text.trim().length < 10 || reading}>
            {existing ? "Update review" : "Save review"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
