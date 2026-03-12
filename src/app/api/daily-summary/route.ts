import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DEFAULT_GOALS, MEAL_TYPES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const date = new Date(dateStr);

  const [meals, latestGoal] = await Promise.all([
    db.mealLog.findMany({
      where: { userId: session.user.id, date },
      orderBy: { createdAt: "asc" },
    }),
    db.dailyGoal.findFirst({
      where: { userId: session.user.id, startDate: { lte: date } },
      orderBy: { startDate: "desc" },
    }),
  ]);

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
      fiber: acc.fiber + meal.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  // Round totals
  Object.keys(totals).forEach((key) => {
    totals[key as keyof typeof totals] = Math.round(totals[key as keyof typeof totals] * 10) / 10;
  });

  const goals = latestGoal
    ? {
        calories: latestGoal.calories,
        protein: latestGoal.protein,
        carbs: latestGoal.carbs,
        fat: latestGoal.fat,
        fiber: latestGoal.fiber,
      }
    : DEFAULT_GOALS;

  const groupedMeals: Record<string, typeof meals> = {};
  for (const type of MEAL_TYPES) {
    groupedMeals[type] = meals.filter((m) => m.mealType === type);
  }

  return NextResponse.json({
    date: dateStr,
    totals,
    goals,
    meals: groupedMeals,
  });
}
