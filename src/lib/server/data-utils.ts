import fs from "fs";
import path from "path";
import { VolumeData, BookAnalysis, ScoreDistribution, BookStats, ChapterAnalysis, ScoreType } from "../data-types";

// Helper function to read and process data
export async function getScriptureData(): Promise<VolumeData[]> {
  const dataDir = path.join(process.cwd(), "data");
  // Define the order of volumes explicitly
  const volumes = ["old_testament", "new_testament", "book_of_mormon"];
  const allData: VolumeData[] = [];

  try {
    for (const volume of volumes) {
      const volumeDir = path.join(dataDir, volume);
      if (!fs.existsSync(volumeDir)) {
        console.warn(`Directory not found: ${volumeDir}`);
        continue; // Skip if volume directory doesn't exist
      }

      const bookFiles = fs.readdirSync(volumeDir).filter(f => f.endsWith('_analysis.json'));
      console.log(`Found ${bookFiles.length} books in ${volume}`);

      let volumeBooks: BookAnalysis[] = [];
      let totalChapters = 0;
      let totalDignity = 0;
      let totalChristCentered = 0;
      let totalMoral = 0;

      for (const file of bookFiles) {
        const filePath = path.join(volumeDir, file);
        try {
          const fileContent = fs.readFileSync(filePath, "utf-8");
          const bookData: BookAnalysis = JSON.parse(fileContent);
          
          // Debug: Log book name and chapter count
          console.log(`Processing ${bookData.book} with ${bookData.chapters.length} chapters`);
          
          // Ensure chapters are sorted by chapter number before processing
          bookData.chapters.sort((a, b) => a.chapter - b.chapter);
          
          volumeBooks.push(bookData);

          totalChapters += bookData.chapters.length;
          
          // Use default value of 0 when a score is undefined or NaN
          const dignitySum = bookData.chapters.reduce((sum, ch) => {
            const score = typeof ch.dignity_score === 'number' && !isNaN(ch.dignity_score) ? ch.dignity_score : 0;
            return sum + score;
          }, 0);
          
          const christSum = bookData.chapters.reduce((sum, ch) => {
            const score = typeof ch.christ_centered_score === 'number' && !isNaN(ch.christ_centered_score) ? ch.christ_centered_score : 0;
            return sum + score;
          }, 0);
          
          const moralSum = bookData.chapters.reduce((sum, ch) => {
            const score = typeof ch.moral_score === 'number' && !isNaN(ch.moral_score) ? ch.moral_score : 0;
            return sum + score;
          }, 0);
          
          totalDignity += dignitySum;
          totalChristCentered += christSum;
          totalMoral += moralSum;
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error);
        }
      }

      // Sort books within the volume alphabetically
      volumeBooks.sort((a, b) => a.book.localeCompare(b.book));

      allData.push({
        volume: volume.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Format volume name
        books: volumeBooks,
        totalChapters: totalChapters,
        totalDignityScore: totalDignity,
        totalChristCenteredScore: totalChristCentered,
        totalMoralScore: totalMoral,
        avgDignityScore: totalChapters > 0 ? totalDignity / totalChapters : 0,
        avgChristCenteredScore: totalChapters > 0 ? totalChristCentered / totalChapters : 0,
        avgMoralScore: totalChapters > 0 ? totalMoral / totalChapters : 0,
      });
    }
  } catch (error) {
    console.error("Error reading scripture data:", error);
    return [];
  }

  return allData;
}

// Get distribution of a specific score type across all volumes
export function getScoreDistribution(data: VolumeData[], scoreType: ScoreType): ScoreDistribution[] {
  const distribution: { [score: number]: number } = {};
  
  // Initialize counts for scores 1-10
  for (let i = 1; i <= 10; i++) {
    distribution[i] = 0;
  }
  
  // Count occurrences of each score
  data.forEach(volume => {
    volume.books.forEach(book => {
      book.chapters.forEach(chapter => {
        const score = chapter[scoreType];
        if (score >= 1 && score <= 10) {
          distribution[score]++;
        }
      });
    });
  });
  
  // Convert to array format for charts
  return Object.entries(distribution).map(([score, count]) => ({
    score: parseInt(score),
    count
  })).sort((a, b) => a.score - b.score);
}

// Get top N books by a specific score type 
export function getTopBooksByScore(data: VolumeData[], scoreType: ScoreType, limit: number = 10): BookStats[] {
  const bookStats: BookStats[] = [];
  
  data.forEach(volume => {
    volume.books.forEach(book => {
      if (book.chapters.length === 0) return;
      
      // Get valid scores only (filter out NaN and undefined)
      const getValidScores = (chapters: ChapterAnalysis[], scoreKey: keyof ChapterAnalysis) => {
        return chapters
          .map(chapter => chapter[scoreKey])
          .filter(score => typeof score === 'number' && !isNaN(score)) as number[];
      };
      
      const dignityScores = getValidScores(book.chapters, 'dignity_score');
      const christScores = getValidScores(book.chapters, 'christ_centered_score');
      const moralScores = getValidScores(book.chapters, 'moral_score');
      
      // Skip if no valid scores for the requested type
      const scores = getValidScores(book.chapters, scoreType);
      if (scores.length === 0) return;
      
      // Calculate averages safely
      const getAverage = (scores: number[]) => scores.length > 0 ? 
        scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
      
      const avgDignityScore = getAverage(dignityScores);
      const avgChristCenteredScore = getAverage(christScores);
      const avgMoralScore = getAverage(moralScores);
      
      // Safely calculate min/max
      const getMax = (scores: number[]) => scores.length > 0 ? Math.max(...scores) : 0;
      const getMin = (scores: number[]) => scores.length > 0 ? Math.min(...scores) : 0;
      
      bookStats.push({
        bookName: book.book,
        volume: volume.volume,
        chapterCount: book.chapters.length,
        avgDignityScore,
        avgChristCenteredScore,
        avgMoralScore,
        maxDignityScore: getMax(dignityScores),
        maxChristCenteredScore: getMax(christScores),
        maxMoralScore: getMax(moralScores),
        minDignityScore: getMin(dignityScores),
        minChristCenteredScore: getMin(christScores),
        minMoralScore: getMin(moralScores),
      });
    });
  });
  
  // Sort by the specified score type and take top N
  return bookStats
    .sort((a, b) => {
      if (scoreType === 'dignity_score') {
        return b.avgDignityScore - a.avgDignityScore;
      }
      if (scoreType === 'christ_centered_score') {
        return b.avgChristCenteredScore - a.avgChristCenteredScore;
      }
      return b.avgMoralScore - a.avgMoralScore;
    })
    .slice(0, limit);
}

// Get chapters with highest scores
export function getAllChaptersByScore(
  data: VolumeData[],
  scoreType: ScoreType,
  limit: number = 20
): { book: string; volume: string; chapter: number; score: number; invitation: string }[] {
  const allChapters: { book: string; volume: string; chapter: number; score: number; invitation: string }[] = [];
  
  data.forEach(volume => {
    volume.books.forEach(book => {
      book.chapters.forEach(chapter => {
        allChapters.push({
          book: book.book,
          volume: volume.volume,
          chapter: chapter.chapter,
          score: chapter[scoreType],
          invitation: chapter.invitation || ''
        });
      });
    });
  });
  
  return allChapters
    .filter(ch => typeof ch.score === 'number' && !isNaN(ch.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Get comparison data for volumes
export function getVolumeComparison(data: VolumeData[]) {
  return data.map(volume => {
    // Count total chapters across all books
    const totalChapters = volume.books.reduce((sum, book) => sum + book.chapters.length, 0);
    
    // Calculate average scores
    const getAverageScores = (scoreType: ScoreType) => {
      let total = 0;
      let count = 0;
      
      volume.books.forEach(book => {
        book.chapters.forEach(chapter => {
          const score = chapter[scoreType];
          if (typeof score === 'number' && !isNaN(score)) {
            total += score;
            count++;
          }
        });
      });
      
      return count > 0 ? total / count : 0;
    };
    
    const avgDignity = getAverageScores('dignity_score');
    const avgChrist = getAverageScores('christ_centered_score');
    const avgMoral = getAverageScores('moral_score');
    
    return {
      volume: volume.volume,
      avgDignity,
      avgChrist,
      avgMoral,
      bookCount: volume.books.length,
      chapterCount: totalChapters
    };
  });
} 