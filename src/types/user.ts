export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  sex: string | null;
  activityLevel: string | null;
  onboarded: boolean;
}

export interface DailyGoal {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}
