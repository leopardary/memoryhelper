import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/card';
import { Badge } from '@/app/components/Badge';
import { TestResult, MemoryPiece } from './mockData';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {MemoryPieceStat} from './types';

interface MemoryPieceGridProps {
  memoryPieceStats: Record<string, MemoryPieceStat>;
  onMemoryPieceClick: (memoryPiece: MemoryPiece) => void;
  limit?: number;
}

export const MemoryPieceGrid: React.FC<MemoryPieceGridProps> = ({ 
  memoryPieceStats,
  onMemoryPieceClick,
  limit 
}) => {

  // Calculate stats for each memory piece
  Object.values(memoryPieceStats).forEach((stats: any) => {
    stats.results.sort((a: TestResult, b: TestResult) => 
      new Date(a.testDate).getTime() - new Date(b.testDate).getTime()
    );

    stats.totalTests = stats.results.length;
    stats.avgScore = stats.results.reduce((sum: number, r: TestResult) => 
      sum + (r.score / r.maxScore) * 100, 0) / stats.totalTests;
    stats.lastScore = (stats.results[stats.results.length - 1].score / 
                      stats.results[stats.results.length - 1].maxScore) * 100;

    // Calculate trend
    if (stats.results.length >= 2) {
      const firstHalf = stats.results.slice(0, Math.ceil(stats.results.length / 2));
      const secondHalf = stats.results.slice(Math.floor(stats.results.length / 2));
      
      const firstAvg = firstHalf.reduce((sum: number, r: TestResult) => 
        sum + (r.score / r.maxScore) * 100, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum: number, r: TestResult) => 
        sum + (r.score / r.maxScore) * 100, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg) stats.trend = 'up';
      else if (secondAvg < firstAvg) stats.trend = 'down';
      else stats.trend = 'stable';
    }
  });

  const sortedStats = Object.values(memoryPieceStats)
    .sort((a: any, b: any) => b.totalTests - a.totalTests);

  const displayStats = limit ? sortedStats.slice(0, limit) : sortedStats;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'learned': 
        return 'bg-green-100 text-green-800';
      case 'learning': 
        return 'bg-yellow-100 text-yellow-800';
      case 'new': 
      case 'lapsed':
        return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  if (displayStats.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No memory pieces tested in the selected time period</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {limit ? 'Recent Memory Pieces' : 'All Memory Pieces'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{displayStats.length} memory pieces</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayStats.map((stats: any) => (
          <Card 
            key={stats.memoryPiece.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white/80 dark:bg-muted backdrop-blur-sm border-0"
            onClick={() => onMemoryPieceClick(stats.memoryPiece)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium line-clamp-2 flex-1">
                  {stats.memoryPiece.content}
                </CardTitle>
                {getTrendIcon(stats.trend)}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge 
                  variant="outline" 
                  className={getDifficultyColor(stats.status)}
                >
                  {stats.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Avg Score:</span>
                  <span className="font-medium">{stats.avgScore.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Last Score:</span>
                  <span className="font-medium">{stats.lastScore.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Tests:</span>
                  <span className="font-medium">{stats.totalTests}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};