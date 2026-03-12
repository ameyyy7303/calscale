"use client";

import { Badge } from "@/components/ui/badge";
import type { FoodItem } from "@/types/food";

interface FoodResultCardProps {
  food: FoodItem;
  onClick: () => void;
}

export function FoodResultCard({ food, onClick }: FoodResultCardProps) {
  const { nutrients } = food;

  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col gap-1.5 rounded-lg border border-border bg-card p-3.5 text-left transition-all hover:border-primary/40 hover:bg-accent/50 hover:shadow-sm active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-sm text-card-foreground">
            {food.name}
          </p>
          {food.brand && (
            <p className="truncate text-xs text-muted-foreground">{food.brand}</p>
          )}
        </div>
        {food.category && (
          <Badge variant="secondary" className="shrink-0 text-[10px]">
            {food.category.length > 20
              ? food.category.slice(0, 20) + "..."
              : food.category}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">
          {Math.round(nutrients.calories)} kcal
        </span>
        <span className="text-muted-foreground/40">|</span>
        <span>{nutrients.protein}g P</span>
        <span className="text-muted-foreground/40">|</span>
        <span>{nutrients.carbs}g C</span>
        <span className="text-muted-foreground/40">|</span>
        <span>{nutrients.fat}g F</span>
        <span className="ml-auto text-[10px] text-muted-foreground/60">per 100g</span>
      </div>
    </button>
  );
}
