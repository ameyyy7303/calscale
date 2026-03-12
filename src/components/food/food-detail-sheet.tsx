"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Scale } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PortionSelector } from "./portion-selector";
import { MealTypeSelector } from "./meal-type-selector";
import { getMealTypeByTime } from "@/lib/constants";
import type { MealType } from "@/lib/constants";
import type { FoodItem } from "@/types/food";

interface FoodDetailSheetProps {
  food: FoodItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialWeight?: number;
}

export function FoodDetailSheet({
  food,
  open,
  onOpenChange,
  initialWeight,
}: FoodDetailSheetProps) {
  const router = useRouter();
  const [servingSize, setServingSize] = useState(initialWeight || food?.servingSize || 100);
  const [unit, setUnit] = useState("g");
  const [mealType, setMealType] = useState<MealType>(getMealTypeByTime());
  const [isLogging, setIsLogging] = useState(false);

  if (!food) return null;

  const multiplier = unit === "oz" ? (servingSize * 28.3495) / 100 : servingSize / 100;
  const computed = {
    calories: Math.round(food.nutrients.calories * multiplier),
    protein: Math.round(food.nutrients.protein * multiplier * 10) / 10,
    carbs: Math.round(food.nutrients.carbs * multiplier * 10) / 10,
    fat: Math.round(food.nutrients.fat * multiplier * 10) / 10,
    fiber: Math.round(food.nutrients.fiber * multiplier * 10) / 10,
  };

  async function handleLog() {
    if (!food) return;
    setIsLogging(true);
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          mealType,
          fdcId: food.fdcId,
          foodName: food.name,
          brandName: food.brand,
          servingSize,
          servingUnit: unit,
          quantity: 1,
          ...computed,
          weighedWithScale: !!initialWeight,
        }),
      });

      if (!res.ok) throw new Error("Failed to log");

      toast.success(`${food.name} logged!`, {
        description: `${computed.calories} kcal added to ${mealType}`,
      });
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to log food");
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">{food.name}</SheetTitle>
          {food.brand && (
            <SheetDescription className="text-left">{food.brand}</SheetDescription>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Nutrition per 100g */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Per 100g
            </p>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: "Cal", value: food.nutrients.calories, color: "text-orange-500" },
                { label: "Protein", value: food.nutrients.protein, color: "text-blue-500" },
                { label: "Carbs", value: food.nutrients.carbs, color: "text-amber-500" },
                { label: "Fat", value: food.nutrients.fat, color: "text-rose-500" },
                { label: "Fiber", value: food.nutrients.fiber, color: "text-green-500" },
              ].map((n) => (
                <div key={n.label}>
                  <p className={`text-sm font-bold ${n.color}`}>{n.value}</p>
                  <p className="text-[10px] text-muted-foreground">{n.label}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Portion */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">Portion Size</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/scale?returnTo=/log&fdcId=${food.fdcId}`)}
                className="text-xs"
              >
                <Scale className="size-3.5" />
                Use Scale
              </Button>
            </div>
            <PortionSelector
              value={servingSize}
              onChange={setServingSize}
              unit={unit}
              onUnitChange={setUnit}
            />
          </div>

          <Separator />

          {/* Computed Nutrition */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-primary">
              Your Portion
            </p>
            <div className="grid grid-cols-5 gap-2 text-center">
              {[
                { label: "Cal", value: computed.calories, color: "text-orange-500" },
                { label: "Protein", value: computed.protein, color: "text-blue-500" },
                { label: "Carbs", value: computed.carbs, color: "text-amber-500" },
                { label: "Fat", value: computed.fat, color: "text-rose-500" },
                { label: "Fiber", value: computed.fiber, color: "text-green-500" },
              ].map((n) => (
                <div key={n.label}>
                  <p className={`text-lg font-bold ${n.color}`}>{n.value}</p>
                  <p className="text-[10px] text-muted-foreground">{n.label}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Meal Type */}
          <div>
            <p className="mb-3 text-sm font-medium">Meal</p>
            <MealTypeSelector value={mealType} onChange={setMealType} />
          </div>

          {/* Log Button */}
          <Button className="w-full" size="lg" onClick={handleLog} disabled={isLogging}>
            {isLogging && <Loader2 className="size-4 animate-spin" />}
            Log Food — {computed.calories} kcal
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
