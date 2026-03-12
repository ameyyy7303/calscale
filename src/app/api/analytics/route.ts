import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
} from "date-fns";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const period = searchParams.get("period") || "week";
  const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const date = new Date(dateStr);

  let start: Date, end: Date;
  if (period === "month") {
    start = startOfMonth(date);
    end = endOfMonth(date);
  } else {
    start = startOfWeek(date, { weekStartsOn: 1 });
    end = endOfWeek(date, { weekStartsOn: 1 });
  }

  const meals = await db.mealLog.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
  });

  const days = eachDayOfInterval({ start, end });
  const data = days.map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayMeals = meals.filter(
      (m) => format(m.date, "yyyy-MM-dd") === dayStr
    );
    return {
      date: dayStr,
      calories: Math.round(dayMeals.reduce((s, m) => s + m.calories, 0)),
      protein: Math.round(dayMeals.reduce((s, m) => s + m.protein, 0) * 10) / 10,
      carbs: Math.round(dayMeals.reduce((s, m) => s + m.carbs, 0) * 10) / 10,
      fat: Math.round(dayMeals.reduce((s, m) => s + m.fat, 0) * 10) / 10,
      fiber: Math.round(dayMeals.reduce((s, m) => s + m.fiber, 0) * 10) / 10,
    };
  });

  const daysWithData = data.filter((d) => d.calories > 0);
  const count = daysWithData.length || 1;
  const averages = {
    calories: Math.round(daysWithData.reduce((s, d) => s + d.calories, 0) / count),
    protein: Math.round((daysWithData.reduce((s, d) => s + d.protein, 0) / count) * 10) / 10,
    carbs: Math.round((daysWithData.reduce((s, d) => s + d.carbs, 0) / count) * 10) / 10,
    fat: Math.round((daysWithData.reduce((s, d) => s + d.fat, 0) / count) * 10) / 10,
    fiber: Math.round((daysWithData.reduce((s, d) => s + d.fiber, 0) / count) * 10) / 10,
  };

  return NextResponse.json({ period, data, averages });
}
