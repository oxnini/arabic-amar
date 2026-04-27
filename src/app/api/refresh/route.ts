import { NextResponse } from "next/server";
import { refreshContent } from "@/lib/content-cache";

export async function POST() {
  try {
    const content = await refreshContent();
    return NextResponse.json({
      success: true,
      lastFetched: content.lastFetched,
      lessonCount: content.lessons.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to refresh content" },
      { status: 500 }
    );
  }
}
