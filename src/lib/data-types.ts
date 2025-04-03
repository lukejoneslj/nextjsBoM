export interface ChapterAnalysis {
  dignity_score: number;
  christ_centered_score: number;
  moral_score: number;
  invitation: string;
  rationalization: string;
  chapter: number;
}

export interface BookAnalysis {
  book: string;
  chapters: ChapterAnalysis[];
}

export interface VolumeData {
  volume: string;
  books: BookAnalysis[];
  totalChapters: number;
  totalDignityScore: number;
  totalChristCenteredScore: number;
  totalMoralScore: number;
  avgDignityScore: number;
  avgChristCenteredScore: number;
  avgMoralScore: number;
}

export interface ScoreDistribution {
  score: number;
  count: number;
}

export interface BookStats {
  bookName: string;
  volume: string;
  chapterCount: number;
  avgDignityScore: number;
  avgChristCenteredScore: number;
  avgMoralScore: number;
  maxDignityScore: number;
  maxChristCenteredScore: number;
  maxMoralScore: number;
  minDignityScore: number;
  minChristCenteredScore: number;
  minMoralScore: number;
}

export type ScoreType = 'dignity_score' | 'christ_centered_score' | 'moral_score'; 