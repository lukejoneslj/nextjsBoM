import {
  getScriptureData,
  getScoreDistribution,
  getTopBooksByScore,
  getVolumeComparison
} from "@/lib/data-utils";
import { ScoreDistributionChart } from "@/components/dashboard/score-distribution-chart";
import { VolumeComparisonChart } from "@/components/dashboard/volume-comparison-chart";
import { TopBooksTable } from "@/components/dashboard/top-books-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const scriptureData = await getScriptureData();

  if (!scriptureData || scriptureData.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Scripture Analysis</h1>
        <p className="text-center text-red-500">Could not load scripture data. Please check the data directory and file formats.</p>
      </div>
    );
  }

  // Calculate total stats across all volumes
  const totalBooks = scriptureData.reduce((sum, vol) => sum + vol.books.length, 0);
  const totalChapters = scriptureData.reduce((sum, vol) => sum + vol.totalChapters, 0);
  
  // Get distribution data for charts
  const dignityDistribution = getScoreDistribution(scriptureData, 'dignity_score');
  const christDistribution = getScoreDistribution(scriptureData, 'christ_centered_score');
  const moralDistribution = getScoreDistribution(scriptureData, 'moral_score');
  
  // Get top books by different score types
  const topDignityBooks = getTopBooksByScore(scriptureData, 'dignity_score', 5);
  const topChristBooks = getTopBooksByScore(scriptureData, 'christ_centered_score', 5);
  const topMoralBooks = getTopBooksByScore(scriptureData, 'moral_score', 5);
  
  // Debug: Check if Moroni is in the dataset and its scores
  scriptureData.forEach(volume => {
    volume.books.forEach(book => {
      if (book.book === 'Moroni') {
        console.log('Found Moroni book with chapters:', book.chapters.length);
        const christScores = book.chapters.map(ch => ch.christ_centered_score);
        console.log('Moroni Christ scores:', christScores);
        const avgChristScore = christScores.reduce((sum, score) => sum + score, 0) / christScores.length;
        console.log('Moroni average Christ score:', avgChristScore);
      }
    });
  });
  
  // Debug: Print all top Christ-centered books to see rankings
  console.log('Top Christ-centered books:');
  const allChristBooks = getTopBooksByScore(scriptureData, 'christ_centered_score', 15);
  allChristBooks.forEach((book, index) => {
    console.log(`${index + 1}. ${book.bookName} (${book.volume}): ${book.avgChristCenteredScore.toFixed(2)}`);
  });
  
  // Get comparison data for volumes
  const volumeComparison = getVolumeComparison(scriptureData);

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Scripture Analysis Dashboard</h1>
        <p className="text-muted-foreground">Explore insights and patterns across scripture volumes.</p>
      </div>
      
      {/* Top stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volumes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scriptureData.length}</div>
            <p className="text-xs text-muted-foreground">Old Testament, New Testament, Book of Mormon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks}</div>
            <p className="text-xs text-muted-foreground">Across all volumes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChapters}</div>
            <p className="text-xs text-muted-foreground">Analyzed for scores</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (scriptureData.reduce((sum, vol) => sum + vol.avgDignityScore, 0) +
                scriptureData.reduce((sum, vol) => sum + vol.avgChristCenteredScore, 0) +
                scriptureData.reduce((sum, vol) => sum + vol.avgMoralScore, 0)) / 
                (scriptureData.length * 3)
              ).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Combined dignity, christ-centeredness, and moral scores</p>
          </CardContent>
        </Card>
      </div>

      {/* Volume Comparison Chart */}
      <div className="mb-8">
        <VolumeComparisonChart 
          data={volumeComparison} 
          title="Volume Score Comparison" 
          description="Radar chart showing average scores by category across volumes"
        />
      </div>
      
      {/* Score Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <ScoreDistributionChart 
          data={dignityDistribution} 
          title="Dignity Score Distribution"
          scoreType="dignity_score"
        />
        <ScoreDistributionChart 
          data={christDistribution} 
          title="Christ-Centered Score Distribution"
          scoreType="christ_centered_score"
        />
        <ScoreDistributionChart 
          data={moralDistribution} 
          title="Moral Score Distribution"
          scoreType="moral_score"
        />
      </div>
      
      {/* Top Books Tabs */}
      <div className="mb-8">
        <Tabs defaultValue="dignity">
          <TabsList className="grid w-full md:w-[400px] grid-cols-3">
            <TabsTrigger value="dignity">Dignity</TabsTrigger>
            <TabsTrigger value="christ">Christ</TabsTrigger>
            <TabsTrigger value="moral">Moral</TabsTrigger>
          </TabsList>
          <TabsContent value="dignity">
            <TopBooksTable 
              data={topDignityBooks} 
              title="Dignity" 
              description="Books with highest average dignity scores"
              scoreType="dignity_score"
            />
          </TabsContent>
          <TabsContent value="christ">
            <TopBooksTable 
              data={topChristBooks} 
              title="Christ-Centered" 
              description="Books with highest average Christ-centered scores"
              scoreType="christ_centered_score"
            />
          </TabsContent>
          <TabsContent value="moral">
            <TopBooksTable 
              data={topMoralBooks} 
              title="Moral" 
              description="Books with highest average moral scores"
              scoreType="moral_score"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Volume Overview */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Volume Overview</h2>
        {scriptureData.map((volume) => (
          <Card key={volume.volume} className="overflow-hidden">
            <CardHeader>
              <CardTitle>{volume.volume}</CardTitle>
              <CardDescription>
                {volume.books.length} Books | {volume.totalChapters} Chapters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Avg Dignity Score</dt>
                  <dd className="text-2xl font-bold">{volume.avgDignityScore.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Avg Christ-Centered Score</dt>
                  <dd className="text-2xl font-bold">{volume.avgChristCenteredScore.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Avg Moral Score</dt>
                  <dd className="text-2xl font-bold">{volume.avgMoralScore.toFixed(2)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
