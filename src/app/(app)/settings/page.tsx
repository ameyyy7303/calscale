"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Loader2, LogOut, User, Target, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ACTIVITY_LEVELS } from "@/lib/constants";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    height: "",
    weight: "",
    age: "",
    sex: "",
    activityLevel: "",
  });

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
        const [profileRes, goalsRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/goals"),
        ]);
        if (profileRes.ok) {
          const { user } = await profileRes.json();
          setProfile({
            name: user.name || "",
            height: user.height?.toString() || "",
            weight: user.weight?.toString() || "",
            age: user.age?.toString() || "",
            sex: user.sex || "",
            activityLevel: user.activityLevel || "",
          });
        }
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

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          height: profile.height ? parseFloat(profile.height) : null,
          weight: profile.weight ? parseFloat(profile.weight) : null,
          age: profile.age ? parseInt(profile.age) : null,
          sex: profile.sex || null,
          activityLevel: profile.activityLevel || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

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

      {/* Profile */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-4">
          <User className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Sex</Label>
              <Select value={profile.sex || undefined} onValueChange={(v) => setProfile({ ...profile, sex: v as string })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input type="number" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select value={profile.activityLevel || undefined} onValueChange={(v) => setProfile({ ...profile, activityLevel: v as string })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {ACTIVITY_LEVELS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

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

      <Separator />

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full text-destructive hover:text-destructive"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="size-4" />
        Sign Out
      </Button>
    </div>
  );
}
