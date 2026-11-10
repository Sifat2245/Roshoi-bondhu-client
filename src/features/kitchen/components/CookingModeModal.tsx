import { useEffect, useState } from "react";
import {
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Timer,
  PartyPopper,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import {
  ingredientText,
  recipeSteps,
  scaleIngredient,
  type Recipe,
} from "../model/recipe-utils";

export default function CookingModeModal({
  recipe,
  servings = recipe.servings || 2,
  onClose,
  onReview,
}: {
  recipe: Recipe;
  servings?: number;
  onClose: () => void;
  onReview: () => void;
}) {
  const steps = recipeSteps(recipe);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(300);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [timerDone, setTimerDone] = useState(false);
  useEffect(() => {
    if (!deadline) return;
    function tick() {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        setDeadline(null);
        setTimerDone(true);
      }
    }
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [deadline]);
  function advance() {
    setCompleted((ids) => [...new Set([...ids, step])]);
    if (step === steps.length - 1) {
      setFinished(true);
      setDeadline(null);
    } else setStep((n) => n + 1);
  }
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={finished ? "Made with a little love" : "Let’s get cooking"}
      subtitle={recipe.title}
      maxWidth="max-w-2xl"
    >
      {finished ? (
        <div className="p-6 sm:p-10 text-center space-y-5">
          <div className="mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 w-20 h-20 flex items-center justify-center">
            <PartyPopper size={38} />
          </div>
          <h2 className="text-2xl font-bold">You made something delicious.</h2>
          <p className="text-gray-500">
            How did it go? Share your version and a tip for the next home cook.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Back to recipe
            </Button>
            <Button icon={ChefHat} onClick={onReview}>
              I cooked this
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-7 space-y-6">
          <div>
            <div className="flex justify-between text-sm font-semibold mb-2">
              <span>
                Step {step + 1} of {steps.length}
              </span>
              <span className="text-gray-500">
                {completed.length} completed
              </span>
            </div>
            <progress
              value={completed.length}
              max={steps.length || 1}
              className="w-full h-2 rounded-full overflow-hidden accent-[#e02f21]"
            />
          </div>
          <details className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <summary className="font-semibold text-sm cursor-pointer">
              Before you start · ingredients
            </summary>
            <div className="mt-4 space-y-3">
              {(recipe.ingredients || []).map((ingredient, i) => (
                <label
                  key={i}
                  className="flex gap-3 items-start text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked.includes(i)}
                    onChange={() =>
                      setChecked((ids) =>
                        ids.includes(i)
                          ? ids.filter((id) => id !== i)
                          : [...ids, i],
                      )
                    }
                    className="mt-1 accent-[#e02f21] h-4 w-4 shrink-0"
                  />
                  <span
                    className={
                      checked.includes(i) ? "line-through text-gray-400" : ""
                    }
                  >
                    {scaleIngredient(
                      ingredientText(ingredient),
                      servings / (recipe.servings || 2),
                    )}
                  </span>
                </label>
              ))}
            </div>
          </details>
          <section
            aria-label={`Cooking step ${step + 1}`}
            className="rounded-2xl p-5 sm:p-7 bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 min-h-44"
          >
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#e02f21] text-white font-bold mb-4">
              {completed.includes(step) ? <Check size={21} /> : step + 1}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">
              {steps[step]?.title || "No instructions yet"}
            </h2>
            <p className="text-base sm:text-lg leading-relaxed mt-3 text-gray-700 dark:text-gray-200">
              {steps[step]?.details ||
                "Ask the author to add their cooking steps."}
            </p>
          </section>
          <section className="rounded-xl bg-gray-50 dark:bg-[#18191a] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <Timer size={18} className="text-[#e02f21]" />
                Timer
                <input
                  aria-label="Timer minutes"
                  type="number"
                  min={1}
                  max={180}
                  disabled={!!deadline}
                  value={minutes}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setMinutes(value);
                    setRemaining(value * 60);
                    setTimerDone(false);
                  }}
                  className="kitchen-input w-19"
                />
                <span className="text-gray-500 font-normal">min</span>
              </label>
              <div className="flex items-center gap-3">
                <span
                  className="font-bold text-xl tabular-nums"
                  aria-label={`${Math.floor(remaining / 60)} minutes ${remaining % 60} seconds`}
                >
                  {String(Math.floor(remaining / 60)).padStart(2, "0")}:
                  {String(remaining % 60).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  aria-label={deadline ? "Pause timer" : "Start timer"}
                  disabled={remaining <= 0 || minutes < 1 || minutes > 180}
                  onClick={() => {
                    setTimerDone(false);
                    setDeadline(
                      deadline ? null : Date.now() + remaining * 1000,
                    );
                  }}
                  className="rounded-full p-2.5 bg-[#e02f21] text-white disabled:opacity-40"
                >
                  {deadline ? <Pause size={17} /> : <Play size={17} />}
                </button>
                <button
                  type="button"
                  aria-label="Reset timer"
                  onClick={() => {
                    setDeadline(null);
                    setRemaining(Math.max(1, Math.min(180, minutes)) * 60);
                    setTimerDone(false);
                  }}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  <RotateCcw size={17} />
                </button>
              </div>
            </div>
            <p
              role="status"
              className={`text-xs mt-3 ${timerDone ? "font-bold text-[#e02f21]" : "text-gray-500"}`}
            >
              {timerDone
                ? "Time’s up! Check on your food."
                : "Keep cooking mode open to use the timer."}
            </p>
          </section>
          <div className="flex flex-wrap justify-between gap-3">
            <Button
              variant="secondary"
              icon={ChevronLeft}
              disabled={step === 0}
              onClick={() => setStep((n) => n - 1)}
            >
              Previous
            </Button>
            <Button onClick={advance} disabled={!steps.length}>
              {step === steps.length - 1 ? "Finish cooking" : "Done, next step"}
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
