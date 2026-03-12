"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PortionSelectorProps {
  value: number;
  onChange: (value: number) => void;
  unit: string;
  onUnitChange: (unit: string) => void;
  step?: number;
}

export function PortionSelector({
  value,
  onChange,
  unit,
  onUnitChange,
  step = 10,
}: PortionSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(Math.max(1, value - step))}
        >
          <Minus className="size-4" />
        </Button>
        <div className="relative flex-1">
          <Input
            type="number"
            value={value}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v > 0) onChange(v);
            }}
            className="pr-10 text-center text-lg font-semibold"
            min={1}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {unit}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(value + step)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <div className="flex gap-1.5">
        {["g", "oz", "serving"].map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => onUnitChange(u)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              unit === u
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
