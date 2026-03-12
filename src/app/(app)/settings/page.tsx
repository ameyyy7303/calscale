"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Target, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [goals, setGoals] = useState({
    calories: "2000",
    protein: "150",
    carbs: "200",
    fat: "65",
    fiber: "30",
  });

  useEffect(() => {
    async function load() {
      try {
        const goalsRes = await fetch("/api/user/goals");
        if (goalsRes.ok) {
          const { goal } = await goalsRes.json();
          if (goal) {
            setGoals({
              calories: goal.calories?.toString() || "2000",
              protein: goal.protein?.toString() || "150",
              carbs: goal.carbs?.toString() || "200",
              fat: goal.fat?.toString() || "65",
              fiber: goal.fiber?.toString() || "30",
            });
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveGoals() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: parseInt(goals.calories),
          protein: parseFloat(goals.protein),
          carbs: parseFloat(goals.carbs),
          fat: parseFloat(goals.fat),
          fiber: parseFloat(goals.fiber),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Goals updated");
    } catch {
      toast.error("Failed to save goals");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      {/* Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-4">
          <Target className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Daily Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Calories (kcal)</Label>
              <Input type="number" value={goals.calories} onChange={(e) => setGoals({ ...goals, calories: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Protein (g)</Label>
              <Input type="number" value={goals.protein} onChange={(e) => setGoals({ ...goals, protein: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Carbs (g)</Label>
              <Input type="number" value={goals.carbs} onChange={(e) => setGoals({ ...goals, carbs: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Fat (g)</Label>
              <Input type="number" value={goals.fat} onChange={(e) => setGoals({ ...goals, fat: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Fiber (g)</Label>
              <Input type="number" value={goals.fiber} onChange={(e) => setGoals({ ...goals, fiber: e.target.value })} />
            </div>
          </div>
          <Button onClick={saveGoals} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save Goals
          </Button>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-4">
          <Palette className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                  theme === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
