import { getScriptureData } from "@/lib/server/data-utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getScriptureData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching scripture data:", error);
    return NextResponse.json(
      { error: "Failed to fetch scripture data" },
      { status: 500 }
    );
  }
} 