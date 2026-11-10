import { useCallback, useSyncExternalStore } from "react";
import { useSession } from "../../../lib/auth-client";
import { useAuth } from "../../../context/AuthContext";
import { isDemoMode, readDemo } from "../../../lib/demo/demo-store";
import {
  ingredientText,
  localDate,
  scaleIngredient,
  type Recipe,
} from "./recipe-utils";

export type Draft = {
  id: string;
  mode: string;
  audience?: import("../../posts/model/post-policy").PostAudience;
  poll?: {
    question: string;
    options: string[];
    multiple: boolean;
    expiresAt?: string;
  };
  title: string;
  caption: string;
  image: string;
  preparationTime: string;
  servings: string;
  cuisine: string;
  ingredients: string[];
  instructions: { title: string; details: string }[];
  groupId?: string | null;
  group?: any;
  updatedAt: string;
};
export type Meal = {
  id: string;
  date: string;
  slot: string;
  recipeId: string;
  servings: number;
};
export type CookedReview = {
  id: string;
  recipeId: string;
  author: { id?: string; name?: string; image?: string };
  rating: number;
  text: string;
  image?: string;
  createdAt: string;
};
export type Community = {
  participants: string[];
  entries: { userId: string; recipeId: string }[];
  polls: {
    id: string;
    question: string;
    options: { label: string; count: number }[];
    vote: number | null;
  }[];
};
export type KitchenState = {
  collections: { id: string; name: string; recipeIds: string[] }[];
  recipes: Recipe[];
  pantry: string[];
  meals: Meal[];
  shopping: { id: string; text: string; source?: string }[];
  checkedShopping: string[];
  drafts: Draft[];
  reviews: CookedReview[];
  communities: Record<string, Community>;
};
const EVENT = "heshel:kitchen-change";
const prefix = "heshel:kitchen:v1:";
const snapshots = new Map<
  string,
  { raw: string | null; state: KitchenState }
>();
const empty: KitchenState = {
  collections: [{ id: "saved", name: "Saved recipes", recipeIds: [] }],
  recipes: [],
  pantry: [],
  meals: [],
  shopping: [],
  checkedShopping: [],
  drafts: [],
  reviews: [],
  communities: {},
};
export const kitchenId = () => crypto.randomUUID();

function initialState(): KitchenState {
  if (!isDemoMode()) return structuredClone(empty);
  const demo = readDemo();
  const recipes = demo.posts.filter((p) => p.postType === "RECIPE");
  return {
    ...structuredClone(empty),
    recipes,
    collections: [
      {
        id: "saved",
        name: "Weeknight favourites",
        recipeIds: recipes.slice(0, 3).map((p) => p.id),
      },
      {
        id: "weekend",
        name: "Slow weekends",
        recipeIds: recipes
          .filter((p) => ["demo-post-9", "demo-post-12"].includes(p.id))
          .map((p) => p.id),
      },
    ],
    pantry: ["Potato", "Garlic", "Olive oil", "Salt", "Pasta"],
    meals: recipes.slice(0, 2).map((recipe, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return {
        id: `sample-meal-${index}`,
        date: localDate(date),
        slot: "Dinner",
        recipeId: recipe.id,
        servings: recipe.servings || 2,
      };
    }),
    drafts: [
      {
        id: "sample-draft",
        mode: "RECIPE",
        title: "Ammu’s rainy-day khichuri",
        caption:
          "The recipe I always ask for when it rains. Still testing the spice measurements!",
        image: "",
        preparationTime: "40",
        servings: "4",
        cuisine: "Bangladeshi",
        ingredients: ["1 cup rice", "½ cup lentils", "1 onion, sliced"],
        instructions: [
          {
            title: "Toast the lentils",
            details:
              "Dry-toast the lentils over a low heat until fragrant, then rinse.",
          },
        ],
        updatedAt: new Date().toISOString(),
      },
    ],
    reviews: recipes.slice(0, 3).map((recipe, i) => ({
      id: `sample-review-${i}`,
      recipeId: recipe.id,
      author: demo.users[(i + 2) % demo.users.length],
      rating: i === 1 ? 4 : 5,
      text: [
        "Made this for dinner and everyone went back for seconds. The garlic tip really helped!",
        "Added a little chilli and served with yoghurt dip. Such a good weekend snack.",
        "A lovely way to use up the vegetables in my fridge. Will make it again.",
      ][i],
      image: recipe.image,
      createdAt: new Date().toISOString(),
    })),
  };
}

function read(scope: string): KitchenState {
  const raw = localStorage.getItem(prefix + scope);
  const cached = snapshots.get(scope);
  if (cached && cached.raw === raw) return cached.state;
  let state: KitchenState;
  try {
    const parsed = JSON.parse(raw || "null");
    state =
      parsed?.collections && parsed?.recipes
        ? { ...structuredClone(empty), ...parsed }
        : initialState();
  } catch {
    state = initialState();
  }
  snapshots.set(scope, { raw, state });
  return state;
}
function subscribe(listener: () => void) {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
export function updateKitchen(
  scope: string,
  change: (state: KitchenState) => void,
) {
  const next = structuredClone(read(scope));
  change(next);
  localStorage.setItem(prefix + scope, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}
export function useKitchen() {
  const { data: session } = useSession();
  const { user: authUser } = useAuth();
  const scope = `${isDemoMode() ? "demo" : "user"}:${session?.user?.id || authUser?.id || "guest"}`;
  const state = useSyncExternalStore(
    subscribe,
    () => read(scope),
    () => empty,
  );
  const update = useCallback(
    (change: (state: KitchenState) => void) => updateKitchen(scope, change),
    [scope],
  );
  return { state, update, scope };
}
export function rememberRecipe(state: KitchenState, recipe: Recipe) {
  const index = state.recipes.findIndex((p) => p.id === recipe.id);
  // Store only the recipe fields needed by the kitchen, not a feed of comments.
  const snapshot: Recipe = {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    postType: recipe.postType,
    servings: recipe.servings,
    preparationTime: recipe.preparationTime,
    cookingTime: recipe.cookingTime,
    cuisine: recipe.cuisine,
    author: recipe.author,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
  };
  if (index < 0) state.recipes.push(snapshot);
  else state.recipes[index] = snapshot;
}
export function shoppingItems(state: KitchenState, dates: string[]) {
  return [
    ...state.meals
      .filter((meal) => dates.includes(meal.date))
      .flatMap((meal) => {
        const recipe = state.recipes.find((p) => p.id === meal.recipeId);
        return (recipe?.ingredients || []).map((ingredient, i) => ({
          id: `${meal.id}:${i}`,
          text: scaleIngredient(
            ingredientText(ingredient),
            meal.servings / (recipe.servings || 2),
          ),
          source: `${recipe.title} · serves ${meal.servings}`,
        }));
      }),
    ...state.shopping,
  ];
}
