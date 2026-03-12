export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: "Sunrise",
  lunch: "Sun",
  dinner: "Sunset",
  snack: "Cookie",
};

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
  fiber: 1079,
} as const;

export const MACRO_COLORS = {
  calories: "hsl(24, 95%, 53%)",
  protein: "hsl(221, 83%, 53%)",
  carbs: "hsl(45, 93%, 47%)",
  fat: "hsl(350, 89%, 60%)",
  fiber: "hsl(142, 71%, 45%)",
} as const;

export const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise", multiplier: 1.2 },
  { value: "light", label: "Lightly Active", description: "Light exercise 1-3 days/week", multiplier: 1.375 },
  { value: "moderate", label: "Moderately Active", description: "Moderate exercise 3-5 days/week", multiplier: 1.55 },
  { value: "active", label: "Active", description: "Hard exercise 6-7 days/week", multiplier: 1.725 },
  { value: "very_active", label: "Very Active", description: "Very hard exercise & physical job", multiplier: 1.9 },
] as const;

export const DEFAULT_GOALS = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  fiber: 30,
};

export function getMealTypeByTime(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 20) return "dinner";
  return "snack";
}

export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  sex: string,
  activityMultiplier: number
): number {
  // Mifflin-St Jeor equation
  const bmr =
    sex === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round(bmr * activityMultiplier);
}
