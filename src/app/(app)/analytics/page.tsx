"use client";

import { useState, useEffect } from "react";
import { format, subWeeks, subMonths } from "date-fns";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Target, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Period = "week" | "month";

interface DayData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface AnalyticsResponse {
  period: string;
  data: DayData[];
  averages: { calories: number; protein: number; carbs: number; fat: number; fiber: number };
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [goals, setGoals] = useState<{ calories: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [analyticsRes, goalsRes] = await Promise.all([
          fetch(`/api/analytics?period=${period}&date=${format(new Date(), "yyyy-MM-dd")}`),
          fetch("/api/user/goals"),
        ]);
        if (analyticsRes.ok) setData(await analyticsRes.json());
        if (goalsRes.ok) {
          const g = await goalsRes.json();
          setGoals(g.goal);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const chartData = data.data.map((d) => ({
    ...d,
    day: format(new Date(d.date + "T12:00:00"), period === "week" ? "EEE" : "MMM d"),
  }));

  const daysWithData = data.data.filter((d) => d.calories > 0);
  const bestDay = daysWithData.reduce(
    (best, d) =>
      goals && Math.abs(d.calories - goals.calories) < Math.abs(best.calories - (goals?.calories || 2000))
        ? d
        : best,
    daysWithData[0] || { date: "", calories: 0 }
  );
  const totalCals = daysWithData.reduce((s, d) => s + d.calories, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your nutrition trends</p>
        </div>
        <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
          {(["week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                period === p
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <Flame className="size-4 text-orange-500 mb-1" />
            <p className="text-lg font-bold">{data.averages.calories}</p>
            <p className="text-[10px] text-muted-foreground">Avg Cal/Day</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <Target className="size-4 text-blue-500 mb-1" />
            <p className="text-lg font-bold">{Math.round(data.averages.protein)}g</p>
            <p className="text-[10px] text-muted-foreground">Avg Protein</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <TrendingUp className="size-4 text-emerald-500 mb-1" />
            <p className="text-lg font-bold">{daysWithData.length}</p>
            <p className="text-[10px] text-muted-foreground">Days Logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center py-4">
            <TrendingDown className="size-4 text-purple-500 mb-1" />
            <p className="text-lg font-bold">{Math.round(totalCals).toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Total Cal</p>
          </CardContent>
        </Card>
      </div>

      {/* Calorie Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Calorie Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                {goals && (
                  <ReferenceLine
                    y={goals.calories}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="5 5"
                    label={{ value: "Goal", position: "right", fontSize: 10 }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="hsl(142, 71%, 45%)"
                  fill="url(#calGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No data for this period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Macro Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Macro Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="protein" stackId="a" fill="hsl(221, 83%, 53%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="carbs" stackId="a" fill="hsl(45, 93%, 47%)" radius={[0, 0, 0, 0]} />
                <Bar dataKey="fat" stackId="a" fill="hsl(350, 89%, 60%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No data for this period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
