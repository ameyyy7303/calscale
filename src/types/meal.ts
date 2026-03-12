import type { MealType } from "@/lib/constants";

export interface MealLog {
  id: string;
  date: string;
  mealType: MealType;
  fdcId: number;
  foodName: string;
  brandName?: string | null;
  servingSize: number;
  servingUnit: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  weighedWithScale: boolean;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  meals: Record<MealType, MealLog[]>;
}

export interface AnalyticsData {
  period: "week" | "month";
  data: Array<{
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>;
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}
