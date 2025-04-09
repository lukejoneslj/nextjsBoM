'use client';

import React, { useEffect, useState } from 'react';
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
import type { VolumeData, ScoreType } from '@/lib/data-types';
import { ScoreDistribution } from '@/lib/data-utils';

const COLORS = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ScoresPage() {
  const [scriptureData, setScriptureData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dignityDistribution, setDignityDistribution] = useState<ScoreDistribution[]>([]);
  const [christDistribution, setChristDistribution] = useState<ScoreDistribution[]>([]);
  const [moralDistribution, setMoralDistribution] = useState<ScoreDistribution[]>([]);
  const [volumeScores, setVolumeScores] = useState<any[]>([]);
  const [combinedStats, setCombinedStats] = useState<any>({});
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/scores');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const { 
          data, 
          dignityDistribution, 
          christDistribution, 
          moralDistribution,
          volumeScores,
          combinedStats,
          correlationData
        } = await response.json();
        
        setScriptureData(data);
        setDignityDistribution(dignityDistribution);
        setChristDistribution(christDistribution);
        setMoralDistribution(moralDistribution);
        setVolumeScores(volumeScores);
        setCombinedStats(combinedStats);
        setCorrelationData(correlationData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching scripture data:', err);
        setError('Could not load scripture data. Please check the server logs.');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Score Analysis</h1>
        <p className="text-center">Loading scripture data...</p>
      </div>
    );
  }

  if (error || !scriptureData || scriptureData.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Score Analysis</h1>
        <p className="text-center text-red-500">{error || 'Could not load scripture data. Please check the data directory and file formats.'}</p>
      </div>
    );
  }

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
                <dd>{combinedStats.avgDignity?.toFixed(2) || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Most Common Score:</dt>
                <dd>{combinedStats.modeDignity || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Highest Volume Avg:</dt>
                <dd>{volumeScores.length > 0 ? [...volumeScores].sort((a, b) => b.dignity - a.dignity)[0]?.name : 'N/A'}</dd>
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
                <dd>{combinedStats.avgChrist?.toFixed(2) || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Most Common Score:</dt>
                <dd>{combinedStats.modeChrist || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Highest Volume Avg:</dt>
                <dd>{volumeScores.length > 0 ? [...volumeScores].sort((a, b) => b.christ - a.christ)[0]?.name : 'N/A'}</dd>
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
                <dd>{combinedStats.avgMoral?.toFixed(2) || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Most Common Score:</dt>
                <dd>{combinedStats.modeMoral || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Highest Volume Avg:</dt>
                <dd>{volumeScores.length > 0 ? [...volumeScores].sort((a, b) => b.moral - a.moral)[0]?.name : 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {dignityDistribution.length > 0 && (
          <ScoreDistributionChart 
            data={dignityDistribution} 
            title="Dignity Score Distribution"
            scoreType="dignity_score"
          />
        )}
        
        {christDistribution.length > 0 && (
          <ScoreDistributionChart 
            data={christDistribution} 
            title="Christ-Centered Score Distribution"
            scoreType="christ_centered_score"
          />
        )}
        
        {moralDistribution.length > 0 && (
          <ScoreDistributionChart 
            data={moralDistribution} 
            title="Moral Score Distribution"
            scoreType="moral_score"
          />
        )}
      </div>
      
      {/* Volume Comparison */}
      {volumeScores.length > 0 && (
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
      )}
      
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
                      data={dignityDistribution.map(item => ({
                        name: `Score ${item.score}`,
                        value: Math.round((item.count / combinedStats.totalDignity) * 100),
                        score: item.score
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dignityDistribution.map((entry, index) => (
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
                      data={christDistribution.map(item => ({
                        name: `Score ${item.score}`,
                        value: Math.round((item.count / combinedStats.totalChrist) * 100),
                        score: item.score
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {christDistribution.map((entry, index) => (
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
                      data={moralDistribution.map(item => ({
                        name: `Score ${item.score}`,
                        value: Math.round((item.count / combinedStats.totalMoral) * 100),
                        score: item.score
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {moralDistribution.map((entry, index) => (
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