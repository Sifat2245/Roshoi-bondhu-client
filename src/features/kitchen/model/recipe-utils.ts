export type Recipe = {
  id: string;
  title?: string;
  image?: string;
  caption?: string;
  postType?: string;
  servings?: number;
  preparationTime?: number;
  cookingTime?: number;
  cuisine?: string;
  author?: { id?: string; name?: string; image?: string };
  ingredients?: (
    | string
    | { name?: string; text?: string; quantity?: string; unit?: string }
  )[];
  instructions?: (string | { title?: string; details?: string })[];
};

export const ingredientText = (
  item: NonNullable<Recipe["ingredients"]>[number],
) =>
  typeof item === "string"
    ? item
    : item.text ||
      [item.quantity, item.unit, item.name].filter(Boolean).join(" ");
export const recipeTime = (recipe: Recipe) =>
  Number(recipe.preparationTime || recipe.cookingTime || 0);
export const recipeSteps = (recipe: Recipe) =>
  (recipe.instructions || [])
    .map((step, index) =>
      typeof step === "string"
        ? { title: `Step ${index + 1}`, details: step }
        : {
            title: step.title || `Step ${index + 1}`,
            details: step.details || "",
          },
    )
    .filter((step) => step.details.trim());

const fractions: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
};
export function scaleIngredient(text: string, factor: number) {
  if (factor === 1 || !Number.isFinite(factor) || factor <= 0) return text;
  const match = text.match(
    /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+\s*[¼½¾⅓⅔⅛]|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛])(?=\s|$|[a-zA-Z])/,
  );
  if (!match) return text;
  const quantity = match[1].split(" ").reduce((sum, part) => {
    const mixed = part.match(/^(\d+)([¼½¾⅓⅔⅛])$/);
    if (mixed) return sum + Number(mixed[1]) + fractions[mixed[2]];
    if (part in fractions) return sum + fractions[part];
    const [a, b] = part.split("/").map(Number);
    return sum + (part.includes("/") ? (b > 0 ? a / b : NaN) : a);
  }, 0);
  if (!Number.isFinite(quantity)) return text;
  return `${Number((quantity * factor).toFixed(2))}${text.slice(match[0].length)}`;
}

function words(value: string) {
  return value
    .toLowerCase()
    .replace(/potatoes/g, "potato")
    .replace(/tomatoes/g, "tomato")
    .replace(/onions/g, "onion")
    .replace(/carrots/g, "carrot")
    .replace(/prawns|shrimp/g, "prawn")
    .replace(/noodles/g, "noodle")
    .replace(/leaves/g, "leaf")
    .replace(/\beggs\b/g, "egg")
    .replace(/\bchickpeas\b/g, "chickpea")
    .replace(/\blentils\b/g, "lentil")
    .replace(/\bherbs\b/g, "herb")
    .replace(/\bpeppers\b/g, "pepper")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
export function pantryMatch(ingredient: string, pantry: string[]) {
  const tokens = words(ingredient);
  return pantry.some((item) => {
    const terms = words(item);
    return terms.length > 0 && terms.every((term) => tokens.includes(term));
  });
}
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function weekDays(offset = 0) {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
}
