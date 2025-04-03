'use client';

import React, { useEffect, useState } from 'react';
import { getAllChaptersByScore } from "@/lib/data-utils";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis
} from 'recharts';
import type { VolumeData } from '@/lib/data-types';

export default function ChaptersPage() {
  const [scriptureData, setScriptureData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topDignityChapters, setTopDignityChapters] = useState([]);
  const [topChristChapters, setTopChristChapters] = useState([]);
  const [topMoralChapters, setTopMoralChapters] = useState([]);
  const [allChapters, setAllChapters] = useState([]);
  const [dignityVsChristData, setDignityVsChristData] = useState([]);
  const [christVsMoralData, setChristVsMoralData] = useState([]);
  const [dignityVsMoralData, setDignityVsMoralData] = useState([]);
  const [chaptersWithCombinedScore, setChaptersWithCombinedScore] = useState([]);
  const [stats, setStats] = useState({
    totalChapters: 0,
    highestChapter: null,
    avgDignity: 0,
    avgChrist: 0,
    avgMoral: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/chapters');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const { data, topChapters } = await response.json();
        setScriptureData(data);
        setTopDignityChapters(topChapters.dignity);
        setTopChristChapters(topChapters.christ);
        setTopMoralChapters(topChapters.moral);
        processData(data);
      } catch (err) {
        console.error('Error fetching scripture data:', err);
        setError('Could not load scripture data. Please check the server logs.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function processData(data: VolumeData[]) {
    if (!data || data.length === 0) return;
    
    // Extract all chapters for scatter plot
    const chapters = data.flatMap(volume => 
      volume.books.flatMap(book => 
        book.chapters.map(chapter => ({
          id: `${book.book}-${chapter.chapter}`,
          bookName: book.book,
          chapter: chapter.chapter,
          volume: volume.volume,
          dignityScore: chapter.dignity_score,
          christScore: chapter.christ_centered_score,
          moralScore: chapter.moral_score,
          // Add color property based on volume for visualization
          color: volume.volume.includes('Old Testament') ? '#4f46e5' : 
                volume.volume.includes('New Testament') ? '#ec4899' : '#10b981'
        }))
      )
    );
    
    setAllChapters(chapters);
    
    // Create data for scatter plot comparing two score types
    const dignityVsChrist = chapters.map(ch => ({ 
      x: ch.dignityScore, 
      y: ch.christScore, 
      z: 1,
      name: `${ch.bookName} ${ch.chapter}`,
      volume: ch.volume,
      color: ch.color
    }));
    
    const christVsMoral = chapters.map(ch => ({ 
      x: ch.christScore, 
      y: ch.moralScore, 
      z: 1,
      name: `${ch.bookName} ${ch.chapter}`,
      volume: ch.volume,
      color: ch.color
    }));
    
    const dignityVsMoral = chapters.map(ch => ({ 
      x: ch.dignityScore, 
      y: ch.moralScore, 
      z: 1,
      name: `${ch.bookName} ${ch.chapter}`,
      volume: ch.volume,
      color: ch.color
    }));
    
    setDignityVsChristData(dignityVsChrist);
    setChristVsMoralData(christVsMoral);
    setDignityVsMoralData(dignityVsMoral);

    // Calculate stats
    const totalChapters = chapters.length;
    
    // Find chapters with highest combined score
    const withCombinedScore = chapters.map(ch => ({
      ...ch,
      combinedScore: (ch.dignityScore + ch.christScore + ch.moralScore) / 3
    })).sort((a, b) => b.combinedScore - a.combinedScore);
    
    setChaptersWithCombinedScore(withCombinedScore);
    
    const highestChapter = withCombinedScore[0];
    
    // Calculate average scores
    const avgDignity = chapters.reduce((sum, ch) => sum + ch.dignityScore, 0) / totalChapters;
    const avgChrist = chapters.reduce((sum, ch) => sum + ch.christScore, 0) / totalChapters;
    const avgMoral = chapters.reduce((sum, ch) => sum + ch.moralScore, 0) / totalChapters;

    setStats({
      totalChapters,
      highestChapter,
      avgDignity,
      avgChrist,
      avgMoral
    });
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Chapter Analysis</h1>
        <p className="text-center">Loading scripture data...</p>
      </div>
    );
  }

  if (error || !scriptureData || scriptureData.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Chapter Analysis</h1>
        <p className="text-center text-red-500">{error || 'Could not load scripture data. Please check the data directory and file formats.'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Chapter Analysis</h1>
        <p className="text-muted-foreground">Explore detailed information about individual chapters across all scripture volumes.</p>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChapters}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Rated Chapter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highestChapter.bookName} {stats.highestChapter.chapter}</div>
            <p className="text-xs text-muted-foreground">{stats.highestChapter.volume} (Score: {stats.highestChapter.combinedScore.toFixed(2)})</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base font-medium">Dignity: {stats.avgDignity.toFixed(2)}</div>
            <div className="text-base font-medium">Christ: {stats.avgChrist.toFixed(2)}</div>
            <div className="text-base font-medium">Moral: {stats.avgMoral.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combined Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((stats.avgDignity + stats.avgChrist + stats.avgMoral) / 3).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average of all three scores</p>
          </CardContent>
        </Card>
      </div>

      {/* Score Correlation Charts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Score Correlation Analysis</CardTitle>
          <CardDescription>Visualize how different scores relate to each other across chapters</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dignity-christ">
            <TabsList className="grid w-full md:w-[500px] grid-cols-3">
              <TabsTrigger value="dignity-christ">Dignity vs Christ</TabsTrigger>
              <TabsTrigger value="christ-moral">Christ vs Moral</TabsTrigger>
              <TabsTrigger value="dignity-moral">Dignity vs Moral</TabsTrigger>
            </TabsList>
            <TabsContent value="dignity-christ">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
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
                    <ZAxis type="number" dataKey="z" range={[50, 50]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => dignityVsChristData.find(d => 
                        d.x === label[0] && d.y === label[1]
                      )?.name || ''}
                    />
                    <Legend />
                    {/* Create one scatter series per volume for different colors */}
                    {['Old Testament', 'New Testament', 'Book of Mormon'].map(volumeName => (
                      <Scatter
                        key={volumeName}
                        name={volumeName}
                        data={dignityVsChristData.filter(d => d.volume === volumeName)}
                        fill={dignityVsChristData.find(d => d.volume === volumeName)?.color || '#000'}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="christ-moral">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Christ-Centered Score" 
                      domain={[0, 10]}
                      label={{ value: 'Christ-Centered Score', position: 'insideBottomRight', offset: -5 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Moral Score" 
                      domain={[0, 10]}
                      label={{ value: 'Moral Score', angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis type="number" dataKey="z" range={[50, 50]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => christVsMoralData.find(d => 
                        d.x === label[0] && d.y === label[1]
                      )?.name || ''}
                    />
                    <Legend />
                    {['Old Testament', 'New Testament', 'Book of Mormon'].map(volumeName => (
                      <Scatter
                        key={volumeName}
                        name={volumeName}
                        data={christVsMoralData.filter(d => d.volume === volumeName)}
                        fill={christVsMoralData.find(d => d.volume === volumeName)?.color || '#000'}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="dignity-moral">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
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
                      name="Moral Score" 
                      domain={[0, 10]}
                      label={{ value: 'Moral Score', angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis type="number" dataKey="z" range={[50, 50]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => dignityVsMoralData.find(d => 
                        d.x === label[0] && d.y === label[1]
                      )?.name || ''}
                    />
                    <Legend />
                    {['Old Testament', 'New Testament', 'Book of Mormon'].map(volumeName => (
                      <Scatter
                        key={volumeName}
                        name={volumeName}
                        data={dignityVsMoralData.filter(d => d.volume === volumeName)}
                        fill={dignityVsMoralData.find(d => d.volume === volumeName)?.color || '#000'}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Top Chapters by Score Type */}
      <Card>
        <CardHeader>
          <CardTitle>Top Chapters by Score Type</CardTitle>
          <CardDescription>View the highest scoring chapters for each metric</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="dignity">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              <TabsTrigger value="dignity">Dignity</TabsTrigger>
              <TabsTrigger value="christ">Christ</TabsTrigger>
              <TabsTrigger value="moral">Moral</TabsTrigger>
            </TabsList>
            <TabsContent value="dignity">
              <div className="border rounded-md">
                <Table>
                  <TableCaption>Top 20 Chapters by Dignity Score</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Chapter</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topDignityChapters.map((chapter, i) => (
                      <TableRow key={`${chapter.book}-${chapter.chapter}-dignity`}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>{chapter.book}</TableCell>
                        <TableCell>{chapter.chapter}</TableCell>
                        <TableCell>{chapter.volume}</TableCell>
                        <TableCell className="text-right">{chapter.score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="christ">
              <div className="border rounded-md">
                <Table>
                  <TableCaption>Top 20 Chapters by Christ-Centered Score</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Chapter</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topChristChapters.map((chapter, i) => (
                      <TableRow key={`${chapter.book}-${chapter.chapter}-christ`}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>{chapter.book}</TableCell>
                        <TableCell>{chapter.chapter}</TableCell>
                        <TableCell>{chapter.volume}</TableCell>
                        <TableCell className="text-right">{chapter.score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="moral">
              <div className="border rounded-md">
                <Table>
                  <TableCaption>Top 20 Chapters by Moral Score</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Chapter</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topMoralChapters.map((chapter, i) => (
                      <TableRow key={`${chapter.book}-${chapter.chapter}-moral`}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>{chapter.book}</TableCell>
                        <TableCell>{chapter.chapter}</TableCell>
                        <TableCell>{chapter.volume}</TableCell>
                        <TableCell className="text-right">{chapter.score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 