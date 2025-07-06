import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/card';
import { Badge } from '@/app/components/Badge';
import { TestResult, getMemoryPieceDetails, MemoryPiece } from './mockData';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MemoryPieceGridProps {
  filteredResults: TestResult[];
  onMemoryPieceClick: (memoryPiece: MemoryPiece) => void;
  limit?: number;
}

export const MemoryPieceGrid: React.FC<MemoryPieceGridProps> = ({ 
  filteredResults, 
  onMemoryPieceClick,
  limit 
}) => {
  // Group results by memory piece and calculate stats
  const memoryPieceStats = filteredResults.reduce((acc, result) => {
    const details = getMemoryPieceDetails(result.memoryPieceId);
    if (!details) return acc;

    if (!acc[result.memoryPieceId]) {
      acc[result.memoryPieceId] = {
        memoryPiece: details.memoryPiece,
        subject: details.subject,
        unit: details.unit,
        lesson: details.lesson,
        results: [],
        avgScore: 0,
        lastScore: 0,
        trend: 'stable' as 'up' | 'down' | 'stable',
        totalTests: 0,
        totalTime: 0,
      };
    }

    acc[result.memoryPieceId].results.push(result);
    return acc;
  }, {} as Record<string, any>);

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
    stats.totalTime = stats.results.reduce((sum: number, r: TestResult) => sum + r.timeSpent, 0);

    // Calculate trend
    if (stats.results.length >= 2) {
      const firstHalf = stats.results.slice(0, Math.ceil(stats.results.length / 2));
      const secondHalf = stats.results.slice(Math.floor(stats.results.length / 2));
      
      const firstAvg = firstHalf.reduce((sum: number, r: TestResult) => 
        sum + (r.score / r.maxScore) * 100, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum: number, r: TestResult) => 
        sum + (r.score / r.maxScore) * 100, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 5) stats.trend = 'up';
      else if (secondAvg < firstAvg - 5) stats.trend = 'down';
      else stats.trend = 'stable';
    }
  });

  const sortedStats = Object.values(memoryPieceStats)
    .sort((a: any, b: any) => b.totalTests - a.totalTests);

  const displayStats = limit ? sortedStats.slice(0, limit) : sortedStats;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
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
        <p className="text-sm text-gray-500 dark:text-gray-400">{displayStats.length} pieces</p>
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
                  {stats.memoryPiece.title}
                </CardTitle>
                {getTrendIcon(stats.trend)}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge 
                  variant="outline" 
                  className={getDifficultyColor(stats.memoryPiece.difficulty)}
                >
                  {stats.memoryPiece.difficulty}
                </Badge>
                {stats.subject && (
                  <Badge variant="outline" style={{ backgroundColor: `${stats.subject.color}20`, color: stats.subject.color }}>
                    {stats.subject.name}
                  </Badge>
                )}
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
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total Time:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(stats.totalTime)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};