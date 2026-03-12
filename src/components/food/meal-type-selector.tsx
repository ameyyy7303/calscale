"use client";

import { Sunrise, Sun, Sunset, Cookie } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MealType } from "@/lib/constants";

const options: { value: MealType; label: string; icon: React.ElementType }[] = [
  { value: "breakfast", label: "Breakfast", icon: Sunrise },
  { value: "lunch", label: "Lunch", icon: Sun },
  { value: "dinner", label: "Dinner", icon: Sunset },
  { value: "snack", label: "Snack", icon: Cookie },
];

interface MealTypeSelectorProps {
  value: MealType;
  onChange: (value: MealType) => void;
}

export function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all",
            value === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
          )}
        >
          <opt.icon className="size-4" />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
