import { getScriptureData, getScoreDistribution } from "@/lib/server/data-utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const scriptureData = await getScriptureData();

    if (!scriptureData || scriptureData.length === 0) {
      return NextResponse.json(
        { error: "No scripture data available" },
        { status: 404 }
      );
    }

    // Get score distributions
    const dignityDistribution = getScoreDistribution(scriptureData, 'dignity_score');
    const christDistribution = getScoreDistribution(scriptureData, 'christ_centered_score');
    const moralDistribution = getScoreDistribution(scriptureData, 'moral_score');
   
    // Calculate total occurrences for each score type
    const totalDignity = dignityDistribution.reduce((sum, item) => sum + item.count, 0);
    const totalChrist = christDistribution.reduce((sum, item) => sum + item.count, 0);
    const totalMoral = moralDistribution.reduce((sum, item) => sum + item.count, 0);
   
    // Calculate averages by volume
    const volumeScores = scriptureData.map(volume => ({
      name: volume.volume,
      dignity: parseFloat(volume.avgDignityScore.toFixed(2)),
      christ: parseFloat(volume.avgChristCenteredScore.toFixed(2)),
      moral: parseFloat(volume.avgMoralScore.toFixed(2)),
    }));
   
    // Calculate overall statistics
    const combinedStats = {
      totalDignity,
      totalChrist,
      totalMoral,
      avgDignity: scriptureData.reduce((sum, vol) => sum + vol.avgDignityScore, 0) / scriptureData.length,
      avgChrist: scriptureData.reduce((sum, vol) => sum + vol.avgChristCenteredScore, 0) / scriptureData.length,
      avgMoral: scriptureData.reduce((sum, vol) => sum + vol.avgMoralScore, 0) / scriptureData.length,
      maxDignity: Math.max(...dignityDistribution.map(d => d.score)),
      maxChrist: Math.max(...christDistribution.map(d => d.score)),
      maxMoral: Math.max(...moralDistribution.map(d => d.score)),
      modeDignity: dignityDistribution.reduce((prev, current) => (prev.count > current.count) ? prev : current).score,
      modeChrist: christDistribution.reduce((prev, current) => (prev.count > current.count) ? prev : current).score,
      modeMoral: moralDistribution.reduce((prev, current) => (prev.count > current.count) ? prev : current).score
    };
   
    // Prepare data for correlation scatter plot
    const correlationData = [];
    scriptureData.forEach(volume => {
      volume.books.forEach(book => {
        book.chapters.forEach(chapter => {
          correlationData.push({
            x: chapter.dignity_score,
            y: chapter.christ_centered_score,
            z: chapter.moral_score,
            name: `${book.book} ${chapter.chapter}`,
            volume: volume.volume
          });
        });
      });
    });

    return NextResponse.json({
      data: scriptureData,
      dignityDistribution,
      christDistribution,
      moralDistribution,
      volumeScores,
      combinedStats,
      correlationData
    });
  } catch (error) {
    console.error("Error fetching score data:", error);
    return NextResponse.json(
      { error: "Failed to fetch score data" },
      { status: 500 }
    );
  }
} 