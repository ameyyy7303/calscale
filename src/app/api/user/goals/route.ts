import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { goalSchema } from "@/lib/validators";
import { DEFAULT_GOALS } from "@/lib/constants";
import { z } from "zod/v4";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goal = await db.dailyGoal.findFirst({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({ goal: goal || DEFAULT_GOALS });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = goalSchema.parse(body);

    const goal = await db.dailyGoal.create({
      data: {
        userId: session.user.id,
        ...data,
        startDate: new Date(),
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: z.prettifyError(error) }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update goals" }, { status: 500 });
  }
}
