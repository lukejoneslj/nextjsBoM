import React from 'react';
import { getScriptureData, getScoreDistribution } from "@/lib/data-utils";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ScoreDistributionChart } from "@/components/dashboard/score-distribution-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis
} from 'recharts';

const COLORS = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default async function ScoresPage() {
  const scriptureData = await getScriptureData();

  if (!scriptureData || scriptureData.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Score Analysis</h1>
        <p className="text-center text-red-500">Could not load scripture data. Please check the data directory and file formats.</p>
      </div>
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
  
  // Prepare data for pie charts showing distribution by percentage
  const dignityPieData = dignityDistribution.map(item => ({
    name: `Score ${item.score}`,
    value: Math.round((item.count / totalDignity) * 100),
    score: item.score
  }));
  
  const christPieData = christDistribution.map(item => ({
    name: `Score ${item.score}`,
    value: Math.round((item.count / totalChrist) * 100),
    score: item.score
  }));
  
  const moralPieData = moralDistribution.map(item => ({
    name: `Score ${item.score}`,
    value: Math.round((item.count / totalMoral) * 100),
    score: item.score
  }));
  
  // Calculate averages by volume
  const volumeScores = scriptureData.map(volume => ({
    name: volume.volume,
    dignity: parseFloat(volume.avgDignityScore.toFixed(2)),
    christ: parseFloat(volume.avgChristCenteredScore.toFixed(2)),
    moral: parseFloat(volume.avgMoralScore.toFixed(2)),
  }));
  
  // Calculate overall statistics
  const combinedStats = {
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

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Score Analysis</h1>
        <p className="text-muted-foreground">Explore detailed statistical analysis of dignity, Christ-centered, and moral scores.</p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Dignity Score Stats</CardTitle>
            <CardDescription>Key statistics for dignity scores</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Average:</dt>
                <dd>{combinedStats.avgDignity.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Most Common Score:</dt>
                <dd>{combinedStats.modeDignity}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Highest Volume Avg:</dt>
                <dd>{volumeScores.sort((a, b) => b.dignity - a.dignity)[0].name}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Christ-Centered Score Stats</CardTitle>
            <CardDescription>Key statistics for Christ-centered scores</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Average:</dt>
                <dd>{combinedStats.avgChrist.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Most Common Score:</dt>
                <dd>{combinedStats.modeChrist}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Highest Volume Avg:</dt>
                <dd>{volumeScores.sort((a, b) => b.christ - a.christ)[0].name}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Moral Score Stats</CardTitle>
            <CardDescription>Key statistics for moral scores</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Average:</dt>
                <dd>{combinedStats.avgMoral.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Most Common Score:</dt>
                <dd>{combinedStats.modeMoral}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Highest Volume Avg:</dt>
                <dd>{volumeScores.sort((a, b) => b.moral - a.moral)[0].name}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
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
      
      {/* Volume Comparison */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Volume Score Comparison</CardTitle>
          <CardDescription>Compare average scores across different volumes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeScores}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="dignity" name="Dignity Score" fill="#4f46e5" />
                <Bar dataKey="christ" name="Christ-Centered Score" fill="#ec4899" />
                <Bar dataKey="moral" name="Moral Score" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Pie Charts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Score Distribution Breakdown</CardTitle>
          <CardDescription>Percentage breakdown of scores by category</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dignity-pie">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              <TabsTrigger value="dignity-pie">Dignity</TabsTrigger>
              <TabsTrigger value="christ-pie">Christ</TabsTrigger>
              <TabsTrigger value="moral-pie">Moral</TabsTrigger>
            </TabsList>
            <TabsContent value="dignity-pie">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dignityPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dignityPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-center text-muted-foreground mt-2">
                Percentage distribution of dignity scores across all chapters
              </p>
            </TabsContent>
            <TabsContent value="christ-pie">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={christPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {christPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-center text-muted-foreground mt-2">
                Percentage distribution of Christ-centered scores across all chapters
              </p>
            </TabsContent>
            <TabsContent value="moral-pie">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={moralPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {moralPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-center text-muted-foreground mt-2">
                Percentage distribution of moral scores across all chapters
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* 3D Score Correlation */}
      <Card>
        <CardHeader>
          <CardTitle>Score Correlation Bubble Chart</CardTitle>
          <CardDescription>Visualize the relationship between dignity and Christ-centered scores, with moral score as bubble size</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Dignity Score" 
                  domain={[0, 10]}
                  label={{ value: 'Dignity Score', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Christ-Centered Score" 
                  domain={[0, 10]}
                  label={{ value: 'Christ-Centered Score', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis 
                  type="number" 
                  dataKey="z" 
                  range={[20, 200]} 
                  name="Moral Score"
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                  itemStyle={{ padding: 2 }}
                  labelFormatter={(value) => correlationData.find(d => d.x === value[0] && d.y === value[1])?.name || ''}
                />
                <Legend />
                <Scatter 
                  name="Scores" 
                  data={correlationData} 
                  fill="#8884d8"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-center text-muted-foreground mt-2">
            Bubble size represents moral score - larger bubbles indicate higher moral scores
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 