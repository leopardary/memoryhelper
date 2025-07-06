import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/card';
import { TestResult } from './mockData';


interface SummaryCardProps {
  title: string;
  content: string;
  supplement: string;
}

const SummaryCard = ({title, content, supplement}: SummaryCardProps) => (<Card className="bg-muted backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{content}</div>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">{supplement}</p>
        </CardContent>
      </Card>)

interface StatsOverviewProps {
  filteredResults: TestResult[];
  timeFilter: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ filteredResults, timeFilter }) => {
  const totalTests = filteredResults.length;
  const avgScore: number = totalTests > 0 ? 
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
      <SummaryCard title="Tests Completed" content={totalTests.toString()} supplement={`tests ${getTimeLabel()}`} />
      <SummaryCard title="Average Score" content={`${avgScore.toFixed(1)}%`} supplement={`across all tests`} />
      <SummaryCard title="Perfect Scores" content={perfectScores.toString()} supplement={`${totalTests > 0 ? ((perfectScores / totalTests) * 100).toFixed(1) : 0}% of tests}`} />
      <SummaryCard title="Avg Time" content={formatTime(Math.round(avgTimeSpent))} supplement={`per test`} />
    </div>
  );
};