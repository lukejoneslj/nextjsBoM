'use client';

import React, { useEffect, useState } from 'react';
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
import type { VolumeData } from '@/lib/data-types';

export default function BooksPage() {
  const [scriptureData, setScriptureData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/scripture-data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setScriptureData(data);
      } catch (err) {
        console.error('Error fetching scripture data:', err);
        setError('Could not load scripture data. Please check the server logs.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Books Analysis</h1>
        <p className="text-center">Loading scripture data...</p>
      </div>
    );
  }

  if (error || !scriptureData || scriptureData.length === 0) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6 text-center">Books Analysis</h1>
        <p className="text-center text-red-500">{error || 'Could not load scripture data. Please check the data directory and file formats.'}</p>
      </div>
    );
  }

  // Extract all books across volumes
  const allBooks = scriptureData.flatMap(volume => 
    volume.books.map(book => ({
      book: book.book,
      volume: volume.volume,
      chapters: book.chapters.length,
      avgDignityScore: book.chapters.reduce((sum, ch) => sum + ch.dignity_score, 0) / book.chapters.length,
      avgChristCenteredScore: book.chapters.reduce((sum, ch) => sum + ch.christ_centered_score, 0) / book.chapters.length,
      avgMoralScore: book.chapters.reduce((sum, ch) => sum + ch.moral_score, 0) / book.chapters.length,
    }))
  );

  // Count books per volume
  const volumeBookCounts = scriptureData.map(volume => ({
    name: volume.volume,
    books: volume.books.length
  }));

  // Calculate overall stats
  const totalBooks = allBooks.length;
  const avgChaptersPerBook = allBooks.reduce((sum, book) => sum + book.chapters, 0) / totalBooks;
  
  // Sort books by average score (combined all three scores)
  const sortedBooks = [...allBooks].sort((a, b) => {
    const scoreA = (a.avgDignityScore + a.avgChristCenteredScore + a.avgMoralScore) / 3;
    const scoreB = (b.avgDignityScore + b.avgChristCenteredScore + b.avgMoralScore) / 3;
    return scoreB - scoreA;
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Books Analysis</h1>
        <p className="text-muted-foreground">Explore detailed information about scripture books across all volumes.</p>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Chapters Per Book</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgChaptersPerBook.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Book with Highest Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedBooks[0].book}</div>
            <p className="text-xs text-muted-foreground">{sortedBooks[0].volume}</p>
          </CardContent>
        </Card>
      </div>

      {/* Books per volume chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Books per Volume</CardTitle>
          <CardDescription>Distribution of books across different volumes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volumeBookCounts}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="books" name="Number of Books" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Complete books table */}
      <Card>
        <CardHeader>
          <CardTitle>All Books</CardTitle>
          <CardDescription>Detailed scores and information for all scripture books</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableCaption>List of all analyzed books across volumes</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead className="text-center">Chapters</TableHead>
                  <TableHead className="text-center">Dignity Score</TableHead>
                  <TableHead className="text-center">Christ Score</TableHead>
                  <TableHead className="text-center">Moral Score</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBooks.map((book) => (
                  <TableRow key={`${book.book}-${book.volume}`}>
                    <TableCell className="font-medium">{book.book}</TableCell>
                    <TableCell>{book.volume}</TableCell>
                    <TableCell className="text-center">{book.chapters}</TableCell>
                    <TableCell className="text-center">{book.avgDignityScore.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{book.avgChristCenteredScore.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{book.avgMoralScore.toFixed(2)}</TableCell>
                    <TableCell className="text-center font-medium">
                      {((book.avgDignityScore + book.avgChristCenteredScore + book.avgMoralScore) / 3).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 