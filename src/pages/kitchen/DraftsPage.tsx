import { useState } from "react";
import { Link } from "react-router";
import {
  FilePenLine,
  Plus,
  Search,
  Trash2,
  ArrowRight,
  ChefHat,
  Clock,
} from "lucide-react";
import KitchenLayout from "../../features/kitchen/components/KitchenLayout";
import {
  useKitchen,
  type Draft,
} from "../../features/kitchen/model/kitchen-store";
import CreatePostModal from "../../features/posts/components/CreatePostModal";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";

export default function DraftsPage() {
  const { state, update } = useKitchen();
  const { notify } = useToast();
  const [search, setSearch] = useState("");
  const [composer, setComposer] = useState<{ draft: Draft | null } | null>(
    null,
  );
  const [deleting, setDeleting] = useState<Draft | null>(null);
  const drafts = state.drafts.filter((d) =>
    `${d.title} ${d.caption} ${d.poll?.question || ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <KitchenLayout
      title="Good ideas take a little time"
      description="Your recipes and kitchen stories, saved as you write. Pick up wherever you left off."
      action={
        <Button icon={Plus} onClick={() => setComposer({ draft: null })}>
          Write a recipe
        </Button>
      }
    >
      <div className="kitchen-panel p-5 sm:p-6 flex gap-4 items-start">
        <div className="bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl p-3">
          <FilePenLine size={25} />
        </div>
        <div>
          <h2 className="font-bold text-lg">
            A quiet corner for your next creation
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Drafts are private and stay on this device. Nothing appears in the
            feed until you choose Post.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-bold text-lg">
          Your drafts{" "}
          <span className="font-normal text-gray-400">
            ({state.drafts.length})
          </span>
        </h2>
        <label className="relative w-full sm:w-64">
          <Search size={17} className="absolute left-3 top-3 text-gray-400" />
          <input
            aria-label="Search drafts"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your drafts"
            className="kitchen-input w-full pl-10!"
          />
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {drafts.map((draft) => (
          <article key={draft.id} className="kitchen-panel p-5 space-y-4">
            <div className="flex justify-between items-center gap-3">
              <span className="kitchen-kicker">
                <ChefHat size={15} />
                {draft.mode === "RECIPE"
                  ? "Recipe draft"
                  : draft.mode === "POLL"
                    ? "Poll draft"
                    : "Kitchen story"}
              </span>
              <button
                type="button"
                aria-label={`Delete draft ${draft.title || draft.poll?.question || "Untitled post"}`}
                className="p-2 text-gray-400 rounded-full hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={() => setDeleting(draft)}
              >
                <Trash2 size={17} />
              </button>
            </div>
            <div className="flex gap-4">
              {draft.image && (
                <img
                  src={draft.image}
                  alt=""
                  className="w-20 h-24 object-cover rounded-xl shrink-0"
                />
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-lg break-words">
                  {draft.title ||
                    draft.poll?.question ||
                    "A little story from your kitchen"}
                </h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2 break-words">
                  {draft.caption ||
                    "Keep writing — your next favourite recipe is taking shape."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400 flex items-center gap-1.5">
                <Clock size={13} />
                Saved{" "}
                {new Date(draft.updatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <button
                type="button"
                onClick={() => setComposer({ draft })}
                className="flex items-center gap-1.5 font-semibold text-sm text-[#e02f21]"
              >
                Continue writing
                <ArrowRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
      {!drafts.length && (
        <div className="kitchen-panel py-14 px-6 text-center">
          <FilePenLine size={38} className="text-gray-300 mx-auto mb-4" />
          <h2 className="font-bold text-lg">
            {search
              ? "No matching drafts"
              : "Something good is waiting to be written"}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {search
              ? "Try another recipe name."
              : "Start a recipe, add a family story, or jot down a kitchen experiment."}
          </p>
          <button
            type="button"
            onClick={() => setComposer({ draft: null })}
            className="font-semibold text-[#e02f21] text-sm mt-5"
          >
            Start writing
          </button>
        </div>
      )}
      <Link
        to="/"
        className="inline-flex text-sm text-gray-500 hover:text-[#e02f21]"
      >
        Back to the community feed →
      </Link>
      {composer && (
        <CreatePostModal
          isOpen
          initialMode={composer.draft?.mode || "RECIPE"}
          initialDraft={composer.draft}
          onClose={() => setComposer(null)}
          onPostCreated={() => setComposer(null)}
        />
      )}
      {deleting && (
        <Modal
          isOpen
          title="Delete this draft?"
          onClose={() => setDeleting(null)}
          maxWidth="max-w-sm"
        >
          <div className="p-5 space-y-5">
            <p className="text-sm text-gray-500">
              “{deleting.title || deleting.poll?.question || "Untitled post"}”
              will be removed from this device. This can’t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                Keep draft
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  update((s) => {
                    s.drafts = s.drafts.filter((d) => d.id !== deleting.id);
                  });
                  setDeleting(null);
                  notify.success("Draft deleted");
                }}
              >
                Delete draft
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </KitchenLayout>
  );
}
