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

  const resultMap = filteredResults.reduce((res: Record<string, TestResult[]>, testResult) => {
    if (res[testResult.memoryPieceId] == null) {
      res[testResult.memoryPieceId]= [];
    }
    res[testResult.memoryPieceId].push(testResult);
    return res;
  }, {});

  let numRegressed = 0;
  let numProgressed = 0;

  for (const memoryPieceId of Object.keys(resultMap)) {
    if (resultMap[memoryPieceId].length < 2) continue;
    const sortedChecks = resultMap[memoryPieceId].sort((a: TestResult, b: TestResult) => (new Date(a.testDate)).getTime() - (new Date(b.testDate)).getTime())
    if (sortedChecks[0].score > sortedChecks[sortedChecks.length - 1].score) numRegressed++;
    if (sortedChecks[0].score < sortedChecks[sortedChecks.length - 1].score) numProgressed++;
  }

  const getTimeLabel = () => {
    switch (timeFilter) {
      case 'today': return 'today';
      case 'week': return 'this week';
      case 'month': return 'this month';
      default: return timeFilter;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <SummaryCard title="Memory Checks" content={totalTests.toString()} supplement={`tests ${getTimeLabel()}`} />
      <SummaryCard title="Memory Pieces" content={Object.keys(resultMap).length.toString()} supplement={`memory pieces ${getTimeLabel()}`} />
      <SummaryCard title="Average Score" content={`${avgScore.toFixed(1)}%`} supplement={`across all tests`} />
      <SummaryCard title="Progresses" content={numProgressed.toString()} supplement={`memory pieces that have made progress`} />
      <SummaryCard title="Regresses" content={numRegressed.toString()} supplement={`memory pieces that have regressed`} />
    </div>
  );
};