import { getScriptureData, getVolumeComparison, getTopBooksByScore } from "@/lib/server/data-utils";
import { NextResponse } from "next/server";
import { ScoreType } from "@/lib/data-types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scoreType = searchParams.get('scoreType') as ScoreType || 'dignity_score';
    const limit = parseInt(searchParams.get('limit') || '10');

    const data = await getScriptureData();
    const volumeComparison = getVolumeComparison(data);
    const topBooks = getTopBooksByScore(data, scoreType, limit);
    
    return NextResponse.json({
      data,
      volumeComparison,
      topBooks
    });
  } catch (error) {
    console.error("Error fetching comparison data:", error);
    return NextResponse.json(
      { error: "Failed to fetch comparison data" },
      { status: 500 }
    );
  }
} 