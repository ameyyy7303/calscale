"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Scale, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVITY_LEVELS, calculateTDEE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STEPS = ["Body Stats", "Activity", "Goals"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(200);
  const [fat, setFat] = useState(65);

  function goNext() {
    if (step === 1 && height && weight && age && sex && activityLevel) {
      const activity = ACTIVITY_LEVELS.find((a) => a.value === activityLevel);
      const tdee = calculateTDEE(
        parseFloat(weight),
        parseFloat(height),
        parseInt(age),
        sex,
        activity?.multiplier || 1.55
      );
      setCalorieGoal(tdee);
      setProtein(Math.round(parseFloat(weight) * 2));
      setFat(Math.round((tdee * 0.25) / 9));
      setCarbs(Math.round((tdee - protein * 4 - fat * 9) / 4));
    }
    setStep((s) => Math.min(2, s + 1));
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: parseFloat(height) || null,
          weight: parseFloat(weight) || null,
          age: parseInt(age) || null,
          sex: sex || null,
          activityLevel: activityLevel || null,
          onboarded: true,
        }),
      });

      await fetch("/api/user/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: calorieGoal,
          protein,
          carbs,
          fat,
          fiber: 30,
        }),
      });

      toast.success("You're all set!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary">
          <Scale className="size-6 text-primary-foreground" />
        </div>
        <CardTitle>Set up CalScale</CardTitle>
        <CardDescription>
          {STEPS[step]} — Step {step + 1} of {STEPS.length}
        </CardDescription>
        {/* Progress */}
        <div className="flex gap-1.5 justify-center pt-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i <= step ? "w-8 bg-primary" : "w-4 bg-muted"
              )}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Sex</Label>
                  <Select value={sex || undefined} onValueChange={(v) => setSex(v as string)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setActivityLevel(level.value)}
                  className={cn(
                    "flex w-full flex-col rounded-lg border p-4 text-left transition-all",
                    activityLevel === level.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <span className="text-sm font-medium">{level.label}</span>
                  <span className="text-xs text-muted-foreground">{level.description}</span>
                </button>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
                <p className="text-xs text-muted-foreground">Recommended Daily Calories</p>
                <p className="text-3xl font-bold text-primary">{calorieGoal}</p>
                <p className="text-xs text-muted-foreground">kcal/day (based on your stats)</p>
              </div>
              <div className="space-y-2">
                <Label>Daily Calories</Label>
                <Input type="number" value={calorieGoal} onChange={(e) => setCalorieGoal(parseInt(e.target.value) || 2000)} />
              </div>
              <div className="grid gap-4 grid-cols-3">
                <div className="space-y-2">
                  <Label>Protein (g)</Label>
                  <Input type="number" value={protein} onChange={(e) => setProtein(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Carbs (g)</Label>
                  <Input type="number" value={carbs} onChange={(e) => setCarbs(parseInt(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Fat (g)</Label>
                  <Input type="number" value={fat} onChange={(e) => setFat(parseInt(e.target.value) || 0)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft className="size-4" />
              Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 2 ? (
            <Button onClick={goNext}>
              Next
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Get Started
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
