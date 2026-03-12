import { NextRequest, NextResponse } from "next/server";
import { searchFoods } from "@/lib/usda";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ foods: [], totalHits: 0, currentPage: 1 });
  }

  try {
    const result = await searchFoods(q, page, pageSize);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate" },
    });
  } catch (error) {
    console.error("Food search error:", error);
    return NextResponse.json(
      { error: "Failed to search foods" },
      { status: 500 }
    );
  }
}
