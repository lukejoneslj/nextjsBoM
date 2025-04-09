'use client';

import React, { useEffect, useState } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts';
import { VolumeComparisonChart } from '@/components/dashboard/volume-comparison-chart';
import type { VolumeData } from '@/lib/data-types';

interface VolumeComparison {
  volume: string;
  avgDignity: number;
  avgChrist: number;
  avgMoral: number;
  bookCount: number;
  chapterCount: number;
}

interface TopBook {
  bookName: string;
  volume: string;
  avgChristCenteredScore: number;
}

export default function ComparePage() {
  const [scriptureData, setScriptureData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volumeComparison, setVolumeComparison] = useState<VolumeComparison[]>([]);
  const [scoreComparisonData, setScoreComparisonData] = useState([]);
  const [countComparisonData, setCountComparisonData] = useState([]);
  const [topBookData, setTopBookData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/compare');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const { data, volumeComparison, topBooks } = await response.json();
        setScriptureData(data);
        setVolumeComparison(volumeComparison);
        processData(volumeComparison, topBooks);
      } catch (err) {
        console.error('Error fetching scripture data:', err);
        setError('Could not load scripture data. Please check the server logs.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function processData(comparison: VolumeComparison[], topBooks: TopBook[]) {
    if (!comparison || comparison.length === 0) return;
    
    // Prepare data for score comparison chart
    const scoreData = comparison.map(vol => ({
      name: vol.volume,
      dignity: parseFloat(vol.avgDignity.toFixed(2)),
      christ: parseFloat(vol.avgChrist.toFixed(2)),
      moral: parseFloat(vol.avgMoral.toFixed(2)),
    }));
    setScoreComparisonData(scoreData);
    
    // Prepare data for book and chapter counts
    const countData = comparison.map(vol => ({
      name: vol.volume,
      books: vol.bookCount,
      chapters: vol.chapterCount,
      chaptersPerBook: parseFloat((vol.chapterCount / vol.bookCount).toFixed(2))
    }));
    setCountComparisonData(countData);
    
    // Prepare data for top books comparison
    const bookData = topBooks.map(book => ({
      name: book.bookName,
      volume: book.volume,
      score: book.avgChristCenteredScore,
      // Add color property based on volume for visualization
      fill: book.volume.includes('Old Testament') ? '#4f46e5' : 
            book.volume.includes('New Testament') ? '#ec4899' : '#10b981'
    }));
    setTopBookData(bookData);
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Volume Comparison</h1>
        <p className="text-center">Loading scripture data...</p>
      </div>
    );
  }

  if (error || !scriptureData || scriptureData.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Volume Comparison</h1>
        <p className="text-center text-red-500">{error || 'Could not load scripture data. Please check the data directory and file formats.'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Volume Comparison</h1>
        <p className="text-muted-foreground">Compare scores and statistics across different scripture volumes and books.</p>
      </div>

      {/* Radar Chart Comparison */}
      <div className="mb-8">
        <VolumeComparisonChart 
          data={volumeComparison} 
          title="Volume Score Comparison" 
          description="Radar chart showing average scores by category across volumes"
        />
      </div>
      
      {/* Bar Chart Comparison - Scores */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Average Scores Comparison</CardTitle>
          <CardDescription>Compare average dignity, Christ-centered, and moral scores across volumes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={scoreComparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} label={{ value: 'Average Score', angle: -90, position: 'insideLeft' }} />
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
      
      {/* Composed Chart - Books and Chapters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Content Size Comparison</CardTitle>
          <CardDescription>Compare number of books, chapters, and chapters per book ratio across volumes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={countComparisonData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="books" name="Number of Books" fill="#4f46e5" />
                <Bar yAxisId="left" dataKey="chapters" name="Number of Chapters" fill="#ec4899" />
                <Line yAxisId="right" type="monotone" dataKey="chaptersPerBook" name="Chapters per Book" stroke="#10b981" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Top Books by Volume */}
      <Card>
        <CardHeader>
          <CardTitle>Top Books Comparison</CardTitle>
          <CardDescription>The highest-scoring books from each volume by average score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topBookData}
                margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 10]} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={-3}
                          y={0}
                          dy={4}
                          textAnchor="end"
                          fill="#666"
                          fontSize={12}
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <Tooltip 
                  formatter={(value) => [value, 'Average Score']}
                  labelFormatter={(value) => `${value} (${topBookData.find(b => b.name === value)?.volume})`}
                />
                <Legend />
                <Bar 
                  dataKey="score" 
                  name="Average Score"
                  fillOpacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 