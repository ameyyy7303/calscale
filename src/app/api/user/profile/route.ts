import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    user: {
      id: "anonymous",
      name: "User",
      email: "",
      image: null,
      height: null,
      weight: null,
      age: null,
      sex: null,
      activityLevel: null,
      onboarded: true,
    },
  });
}

export async function PUT() {
  return NextResponse.json({ user: { id: "anonymous" } });
}
