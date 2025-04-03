import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookStats } from '@/lib/data-utils';

interface TopBooksTableProps {
  data: BookStats[];
  title: string;
  description?: string;
  scoreType: 'dignity_score' | 'christ_centered_score' | 'moral_score';
}

export function TopBooksTable({
  data,
  title,
  description,
  scoreType
}: TopBooksTableProps) {
  // Choose which score to highlight based on scoreType
  const getScoreValue = (book: BookStats) => {
    if (scoreType === 'dignity_score') return book.avgDignityScore;
    if (scoreType === 'christ_centered_score') return book.avgChristCenteredScore;
    return book.avgMoralScore;
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Top Books by {title} Score</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>Book</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead className="text-center">Chapters</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((book, index) => (
              <TableRow key={`${book.bookName}-${book.volume}`} className={index < 3 ? "bg-muted/30" : ""}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{book.bookName}</TableCell>
                <TableCell>{book.volume}</TableCell>
                <TableCell className="text-center">{book.chapterCount}</TableCell>
                <TableCell className="text-right font-medium">
                  {getScoreValue(book).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 