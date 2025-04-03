'use client';

import React, { useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreDistribution } from '@/lib/data-utils';

const SCORE_COLORS = {
  dignity_score: '#4f46e5', // Indigo
  christ_centered_score: '#ec4899', // Pink
  moral_score: '#10b981', // Emerald
};

interface ScoreDistributionChartProps {
  data: ScoreDistribution[];
  title: string;
  description?: string;
  scoreType: 'dignity_score' | 'christ_centered_score' | 'moral_score';
}

export function ScoreDistributionChart({ 
  data, 
  title, 
  description, 
  scoreType 
}: ScoreDistributionChartProps) {
  const color = SCORE_COLORS[scoreType];
  
  // Debug: Log the score distribution data
  useEffect(() => {
    console.log(`Score distribution for ${title}:`, data);
  }, [data, title]);
  
  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Format tooltip to show count and percentage
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const count = payload[0].value;
      const percentage = ((count / total) * 100).toFixed(1);
      return (
        <div className="bg-background border p-2 shadow-md rounded-md">
          <p className="font-medium">Score: {label}</p>
          <p>Count: {count}</p>
          <p>Percentage: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="score" 
                label={{ value: 'Score', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="count" 
                name={title} 
                fill={color} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 