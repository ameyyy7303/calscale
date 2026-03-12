"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, Apple } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodResultCard } from "@/components/food/food-result-card";
import { FoodDetailSheet } from "@/components/food/food-detail-sheet";
import type { FoodItem } from "@/types/food";

export default function LogPage() {
  return (
    <Suspense>
      <LogPageInner />
    </Suspense>
  );
}

function LogPageInner() {
  const searchParams = useSearchParams();
  const scaleWeight = searchParams.get("weight");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Fetch recent foods on mount
  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await fetch(
          `/api/meals?from=${getDateDaysAgo(30)}&to=${todayStr()}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const seen = new Set<number>();
        const recent: FoodItem[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const meal of (data.meals || []).reverse()) {
          if (!seen.has(meal.fdcId) && recent.length < 10) {
            seen.add(meal.fdcId);
            recent.push({
              fdcId: meal.fdcId,
              name: meal.foodName,
              brand: meal.brandName || undefined,
              nutrients: {
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat,
                fiber: meal.fiber,
              },
            });
          }
        }
        setRecentFoods(recent);
      } catch {
        // ignore
      }
    }
    fetchRecent();
  }, []);

  const searchFoods = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.foods || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => searchFoods(value), 300);
  }

  function handleSelectFood(food: FoodItem) {
    setSelectedFood(food);
    setSheetOpen(true);
  }

  const showRecent = query.trim().length < 2 && recentFoods.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Log Food</h1>
        <p className="text-sm text-muted-foreground">
          Search from 300,000+ foods including US grocery brands
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search foods... (e.g. banana, Great Value milk)"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-9 text-base"
          autoFocus
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[72px] rounded-lg" />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {results.length} results
          </p>
          <div className="space-y-2">
            {results.map((food) => (
              <FoodResultCard
                key={food.fdcId}
                food={food}
                onClick={() => handleSelectFood(food)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            No foods found for &quot;{query}&quot;
          </p>
          <p className="text-xs text-muted-foreground/70">
            Try a different search term
          </p>
        </div>
      )}

      {/* Recent Foods */}
      {showRecent && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recent Foods
          </p>
          <div className="space-y-2">
            {recentFoods.map((food) => (
              <FoodResultCard
                key={food.fdcId}
                food={food}
                onClick={() => handleSelectFood(food)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && query.trim().length < 2 && recentFoods.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10">
            <Apple className="size-8 text-primary" />
          </div>
          <p className="text-sm font-medium">Search for any food</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            We have 300,000+ foods from USDA including branded products like
            Great Value, Kirkland, and more
          </p>
        </div>
      )}

      {/* Food Detail Sheet */}
      <FoodDetailSheet
        food={selectedFood}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialWeight={scaleWeight ? parseFloat(scaleWeight) : undefined}
      />
    </div>
  );
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getDateDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}
