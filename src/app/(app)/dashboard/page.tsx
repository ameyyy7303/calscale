"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, subDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sunrise,
  Sun,
  Sunset,
  Cookie,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MealType } from "@/lib/constants";
import Link from "next/link";

const MEAL_ICON_MAP: Record<MealType, React.ElementType> = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Sunset,
  snack: Cookie,
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

interface MealLogItem {
  id: string;
  foodName: string;
  brandName?: string | null;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface DailySummaryData {
  date: string;
  totals: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  goals: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  meals: Record<MealType, MealLogItem[]>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<DailySummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const dateStr = format(date, "yyyy-MM-dd");
  const isToday = dateStr === format(new Date(), "yyyy-MM-dd");

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daily-summary?date=${dateStr}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      toast.error("Failed to load summary");
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  async function handleDelete(mealId: string) {
    try {
      const res = await fetch(`/api/meals/${mealId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Food removed");
      fetchSummary();
    } catch {
      toast.error("Failed to remove");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const { totals, goals } = data;
  const calPercent = Math.min(100, (totals.calories / goals.calories) * 100);
  const remaining = Math.max(0, goals.calories - totals.calories);
  const calColor =
    calPercent > 100 ? "text-red-500" : calPercent > 85 ? "text-amber-500" : "text-emerald-500";

  const macros = [
    { key: "protein", label: "Protein", unit: "g", color: "bg-blue-500", current: totals.protein, goal: goals.protein },
    { key: "carbs", label: "Carbs", unit: "g", color: "bg-amber-500", current: totals.carbs, goal: goals.carbs },
    { key: "fat", label: "Fat", unit: "g", color: "bg-rose-500", current: totals.fat, goal: goals.fat },
    { key: "fiber", label: "Fiber", unit: "g", color: "bg-green-500", current: totals.fiber, goal: goals.fiber },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Date Nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setDate(subDays(date, 1))}>
          <ChevronLeft className="size-4" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold">
            {isToday ? "Today" : format(date, "EEEE")}
          </p>
          <p className="text-xs text-muted-foreground">{format(date, "MMMM d, yyyy")}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDate(addDays(date, 1))}
          disabled={isToday}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Calorie Ring Card */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <div className="relative flex size-44 items-center justify-center">
            {/* SVG Ring */}
            <svg className="size-full -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/40"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${calPercent * 4.398} 440`}
                className={cn(
                  "transition-all duration-700",
                  calPercent > 100
                    ? "text-red-500"
                    : calPercent > 85
                    ? "text-amber-500"
                    : "text-emerald-500"
                )}
                stroke="currentColor"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <Flame className={cn("size-5 mb-1", calColor)} />
              <p className="text-3xl font-bold tracking-tight">{Math.round(totals.calories)}</p>
              <p className="text-xs text-muted-foreground">of {goals.calories} kcal</p>
            </div>
          </div>
          <p className={cn("text-sm font-medium", calColor)}>
            {totals.calories > goals.calories
              ? `${Math.round(totals.calories - goals.calories)} kcal over`
              : `${Math.round(remaining)} kcal remaining`}
          </p>
        </CardContent>
      </Card>

      {/* Macro Bars */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Macronutrients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {macros.map((m) => {
            const pct = m.goal > 0 ? Math.min(100, (m.current / m.goal) * 100) : 0;
            return (
              <div key={m.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{m.label}</span>
                  <span className="text-muted-foreground">
                    {Math.round(m.current)}{m.unit} / {Math.round(m.goal)}{m.unit}
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", m.color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Meal Cards */}
      {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((mealType) => {
        const meals = data.meals[mealType] || [];
        const Icon = MEAL_ICON_MAP[mealType];
        const mealCals = meals.reduce((s, m) => s + m.calories, 0);

        return (
          <Card key={mealType}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">
                    {MEAL_LABELS[mealType]}
                  </CardTitle>
                  {meals.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {Math.round(mealCals)} kcal
                    </p>
                  )}
                </div>
              </div>
              <Link href="/log">
                <Button variant="ghost" size="icon-sm">
                  <Plus className="size-3.5" />
                </Button>
              </Link>
            </CardHeader>
            {meals.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{meal.foodName}</p>
                        <p className="text-xs text-muted-foreground">
                          {meal.servingSize}{meal.servingUnit} — {Math.round(meal.calories)} kcal
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(meal.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
            {meals.length === 0 && (
              <CardContent className="pt-0">
                <Link href="/log">
                  <p className="cursor-pointer text-xs text-muted-foreground hover:text-primary transition-colors">
                    + Add food
                  </p>
                </Link>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* FAB */}
      <Link href="/log" className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30">
        <Button size="lg" className="size-14 rounded-full shadow-lg">
          <Plus className="size-6" />
        </Button>
      </Link>
    </div>
  );
}
