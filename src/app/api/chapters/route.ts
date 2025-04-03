import { getScriptureData, getAllChaptersByScore } from "@/lib/server/data-utils";
import { NextResponse } from "next/server";
import { ScoreType } from "@/lib/data-types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scoreType = searchParams.get('scoreType') as ScoreType || 'dignity_score';
    const limit = parseInt(searchParams.get('limit') || '20');

    const data = await getScriptureData();
    const topChapters = getAllChaptersByScore(data, scoreType, limit);
    
    return NextResponse.json({
      data,
      topChapters: {
        dignity: getAllChaptersByScore(data, 'dignity_score', limit),
        christ: getAllChaptersByScore(data, 'christ_centered_score', limit),
        moral: getAllChaptersByScore(data, 'moral_score', limit)
      }
    });
  } catch (error) {
    console.error("Error fetching chapter data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapter data" },
      { status: 500 }
    );
  }
} 