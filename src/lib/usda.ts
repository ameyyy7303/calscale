import { NUTRIENT_IDS } from "./constants";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

export interface FoodNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodItem {
  fdcId: number;
  name: string;
  brand?: string;
  category?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  nutrients: FoodNutrients;
}

export interface FoodSearchResponse {
  foods: FoodItem[];
  totalHits: number;
  currentPage: number;
}

function extractNutrient(foodNutrients: Array<{ nutrientId: number; value: number }>, id: number): number {
  const n = foodNutrients.find((fn) => fn.nutrientId === id);
  return n ? Math.round(n.value * 10) / 10 : 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformFood(raw: any): FoodItem {
  return {
    fdcId: raw.fdcId,
    name: raw.description || raw.lowercaseDescription || "Unknown",
    brand: raw.brandOwner || raw.brandName || undefined,
    category: raw.foodCategory || raw.brandedFoodCategory || undefined,
    servingSize: raw.servingSize || undefined,
    servingSizeUnit: raw.servingSizeUnit || undefined,
    nutrients: {
      calories: extractNutrient(raw.foodNutrients, NUTRIENT_IDS.calories),
      protein: extractNutrient(raw.foodNutrients, NUTRIENT_IDS.protein),
      carbs: extractNutrient(raw.foodNutrients, NUTRIENT_IDS.carbs),
      fat: extractNutrient(raw.foodNutrients, NUTRIENT_IDS.fat),
      fiber: extractNutrient(raw.foodNutrients, NUTRIENT_IDS.fiber),
    },
  };
}

export async function searchFoods(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<FoodSearchResponse> {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) throw new Error("USDA_API_KEY not configured");

  const res = await fetch(`${USDA_BASE}/foods/search?api_key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      dataType: ["Branded", "SR Legacy", "Foundation"],
      pageSize,
      pageNumber: page,
      sortBy: "dataType.keyword",
      sortOrder: "asc",
      nutrients: Object.values(NUTRIENT_IDS),
    }),
  });

  if (!res.ok) {
    throw new Error(`USDA API error: ${res.status}`);
  }

  const data = await res.json();

  return {
    foods: (data.foods || []).map(transformFood),
    totalHits: data.totalHits || 0,
    currentPage: page,
  };
}

export async function getFoodById(fdcId: number): Promise<FoodItem | null> {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) throw new Error("USDA_API_KEY not configured");

  const res = await fetch(
    `${USDA_BASE}/food/${fdcId}?api_key=${apiKey}&nutrients=${Object.values(NUTRIENT_IDS).join(",")}`,
  );

  if (!res.ok) return null;

  const data = await res.json();
  return transformFood(data);
}
