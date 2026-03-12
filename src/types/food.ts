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
