import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { TestResult } from './mockData';

interface StatsOverviewProps {
  filteredResults: TestResult[];
  timeFilter: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ filteredResults, timeFilter }) => {
  const totalTests = filteredResults.length;
  const avgScore = totalTests > 0 ? 
    filteredResults.reduce((sum, result) => sum + (result.score / result.maxScore) * 100, 0) / totalTests : 0;
  const perfectScores = filteredResults.filter(result => result.score === result.maxScore).length;
  const avgTimeSpent = totalTests > 0 ?
    filteredResults.reduce((sum, result) => sum + result.timeSpent, 0) / totalTests : 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getTimeLabel = () => {
    switch (timeFilter) {
      case 'today': return 'today';
      case 'week': return 'this week';
      case 'month': return 'this month';
      default: return timeFilter;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Tests Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
          <p className="text-xs text-gray-500 mt-1">tests {getTimeLabel()}</p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{avgScore.toFixed(1)}%</div>
          <p className="text-xs text-gray-500 mt-1">across all tests</p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Perfect Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{perfectScores}</div>
          <p className="text-xs text-gray-500 mt-1">{totalTests > 0 ? ((perfectScores / totalTests) * 100).toFixed(1) : 0}% of tests</p>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Avg Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{formatTime(Math.round(avgTimeSpent))}</div>
          <p className="text-xs text-gray-500 mt-1">per test</p>
        </CardContent>
      </Card>
    </div>
  );
};