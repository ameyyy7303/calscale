import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goalSchema } from "@/lib/validators";
import { DEFAULT_GOALS } from "@/lib/constants";
import { ANON_USER_ID } from "@/lib/user";
import { z } from "zod";

export async function GET() {
  const goal = await db.dailyGoal.findFirst({
    where: { userId: ANON_USER_ID },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({ goal: goal || DEFAULT_GOALS });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = goalSchema.parse(body);

    const goal = await db.dailyGoal.create({
      data: {
        userId: ANON_USER_ID,
        ...data,
        startDate: new Date(),
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update goals" }, { status: 500 });
  }
}
