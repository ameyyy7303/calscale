import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { mealLogSchema } from "@/lib/validators";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let where: Record<string, unknown> = { userId: session.user.id };

  if (date) {
    where.date = new Date(date);
  } else if (from && to) {
    where.date = { gte: new Date(from), lte: new Date(to) };
  } else {
    where.date = new Date().toISOString().split("T")[0];
  }

  const meals = await db.mealLog.findMany({
    where,
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ meals });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = mealLogSchema.parse(body);

    const meal = await db.mealLog.create({
      data: {
        userId: session.user.id,
        date: new Date(data.date),
        mealType: data.mealType,
        fdcId: data.fdcId,
        foodName: data.foodName,
        brandName: data.brandName,
        servingSize: data.servingSize,
        servingUnit: data.servingUnit,
        quantity: data.quantity,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        fiber: data.fiber,
        weighedWithScale: data.weighedWithScale,
      },
    });

    return NextResponse.json({ meal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Meal log error:", error);
    return NextResponse.json({ error: "Failed to log meal" }, { status: 500 });
  }
}
