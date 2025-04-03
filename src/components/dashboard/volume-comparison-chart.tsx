'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface VolumeComparisonData {
  volume: string;
  avgDignity: number;
  avgChrist: number;
  avgMoral: number;
  bookCount: number;
  chapterCount: number;
}

interface VolumeComparisonChartProps {
  data: VolumeComparisonData[];
  title: string;
  description?: string;
}

// Define a type for radar chart data with index signature
interface RadarDataItem {
  subject: string;
  [volumeKey: string]: string | number;
}

export function VolumeComparisonChart({
  data,
  title,
  description
}: VolumeComparisonChartProps) {
  // Get unique volume names from data
  const volumeNames = data.map(item => item.volume.replace(/\s+/g, '_'));
  
  // Initialize radarData with empty structure
  const radarData: RadarDataItem[] = [
    { subject: 'Dignity' },
    { subject: 'Christ-Centered' },
    { subject: 'Moral' },
  ];
  
  // Initialize all volume keys with 0
  volumeNames.forEach(volumeKey => {
    radarData[0][volumeKey] = 0;
    radarData[1][volumeKey] = 0;
    radarData[2][volumeKey] = 0;
  });
  
  // Fill in data values
  data.forEach(item => {
    const volumeKey = item.volume.replace(/\s+/g, '_');
    
    // Make sure we have valid numbers with fallbacks to 0
    const dignityValue = typeof item.avgDignity === 'number' && !isNaN(item.avgDignity) 
      ? parseFloat(item.avgDignity.toFixed(2)) 
      : 0;
      
    const christValue = typeof item.avgChrist === 'number' && !isNaN(item.avgChrist)
      ? parseFloat(item.avgChrist.toFixed(2))
      : 0;
      
    const moralValue = typeof item.avgMoral === 'number' && !isNaN(item.avgMoral)
      ? parseFloat(item.avgMoral.toFixed(2))
      : 0;
    
    radarData[0][volumeKey] = dignityValue;
    radarData[1][volumeKey] = christValue;
    radarData[2][volumeKey] = moralValue;
  });
  
  // Generate colors for each volume
  const colors: {[key: string]: string} = {
    Old_Testament: '#4f46e5',   // Indigo
    New_Testament: '#ec4899',   // Pink
    Book_of_Mormon: '#10b981',  // Emerald
  };
  
  // Ensure all volumes have colors
  volumeNames.forEach((volumeKey, index) => {
    if (!colors[volumeKey]) {
      // Fallback colors if needed
      const fallbackColors = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];
      colors[volumeKey] = fallbackColors[index % fallbackColors.length];
    }
  });

  // Custom tooltip to avoid NaN issues
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: {isNaN(entry.value) ? '0' : entry.value}
            </p>
          ))}
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
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              
              {Object.entries(colors).filter(([key]) => volumeNames.includes(key)).map(([key, color]) => (
                <Radar
                  key={key}
                  name={key.replace(/_/g, ' ')}
                  dataKey={key}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.2}
                />
              ))}
              
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 