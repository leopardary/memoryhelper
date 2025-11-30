'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/tabs';
import { Button } from '@/app/components/button';
import { ClockIcon, CalendarIcon, CalendarDaysIcon, CalendarDateRangeIcon, GlobeAltIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { AverageScoreChart, AverageScoreData } from '@/app/components/Dashboard/AverageScoreChart';
import { NumberOfChecksChart, NumberOfChecksData } from '@/app/components/Dashboard/NumberOfChecksChart';
import { MemoryPieceGrid } from './MemoryPieceGrid';
import { StatsOverview } from './StatsOverview';
import { HistoryModal } from './HistoryModal';
import { MemoryPiece } from './mockData';
import {MemoryCheckObj, SubscriptionOverallRecord, TestResult, MemoryPieceStat} from './types';
import { EmptyState } from '@/app/components/EmptyState';

type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';

const convertDateToDay = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
}

function calculateAverage(arr: number[]) {
  const sum = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  return sum / arr.length;
}

const constructTestResults = (filteredMemoryChecks: MemoryCheckObj[], record: Record<string, SubscriptionOverallRecord>): TestResult[] => {
  return filteredMemoryChecks.map(check => {
    return {
      id: check.id,
      memoryPieceId: record[check.subscriptionId].memoryPiece.id,
      score: check.score,
      maxScore: 5,
      testDate: convertDateToDay(check.updatedAt)
    }
  })
}

const Dashboard = ({record} : {record: Record<string, SubscriptionOverallRecord>}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [selectedMemoryPiece, setSelectedMemoryPiece] = useState<MemoryPiece | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const filterDataByTime = (timeFilter: TimeFilter) => {
    const now = new Date();
    
    let filterDate: Date;
    switch (timeFilter) {
      case 'today':
        filterDate = new Date(now);
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        filterDate = new Date(now);
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        filterDate = new Date(now);
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        filterDate = new Date(0); // Unix epoch start
        break;
      default:
        throw new Error(`Unsupported time filter: ${timeFilter}`);
    }

    return Object.keys(record).reduce((memoryChecks: MemoryCheckObj[], subscriptionId) => {
      record[subscriptionId]['memoryChecks'].filter(check => new Date(check.createdAt) >= filterDate).forEach(check => memoryChecks.push(check));
      return memoryChecks;
    }, []);
  };

  const filteredResults = filterDataByTime(timeFilter);

  const filteredTestResults = constructTestResults(filteredResults, record);

  const filteredTestResultsByDate = filteredTestResults.reduce((res: any, testResult: TestResult) => {
    if (res[testResult.testDate] == null) {
      res[testResult.testDate] = [];
    }
    res[testResult.testDate].push(testResult);
    return res;
  }, {})

  const averageScoreData: AverageScoreData[] = Object.keys(filteredTestResultsByDate).reduce((arry: AverageScoreData[], date: string) => {
    arry.push({score: Math.round(calculateAverage(filteredTestResultsByDate[date].map((testResult: TestResult) => testResult.score)) * 10) / 10, date: date});
    return arry;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const checkNumData: NumberOfChecksData[] = Object.keys(filteredTestResultsByDate).reduce((arry: NumberOfChecksData[], date: string) => {
    arry.push({count: filteredTestResultsByDate[date].length, date: date});
    return arry;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleMemoryPieceClick = (memoryPiece: MemoryPiece) => {
    setSelectedMemoryPiece(memoryPiece);
    setIsHistoryModalOpen(true);
  };

  const getTimeFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case 'today': return 'Today';
      case 'week': return 'Past Week';
      case 'month': return 'Past Month';
      case 'year': return 'Past Year';
      case 'all': return 'From Beginning';
    }
  };

  const memoryPieceIdToSubscriptionId: Record<string, string> = Object.keys(record).reduce((obj: Record<string, string>, subscriptionId: string) => {
    obj[record[subscriptionId].memoryPiece.id] = subscriptionId;
    return obj;
  }, {});

  const memoryPieceStats = filteredTestResults.reduce((acc, result: TestResult) => {
    const subscriptionId = memoryPieceIdToSubscriptionId[result.memoryPieceId];
    const memoryPieceObj = record[subscriptionId].memoryPiece;
    const status = record[subscriptionId].subscription.status;
    if (!acc[result.memoryPieceId]) {
      acc[result.memoryPieceId] = {
        memoryPiece: memoryPieceObj,
        status: status,
        results: [],
        avgScore: 0,
        lastScore: 0,
        trend: 'stable' as 'up' | 'down' | 'stable',
        totalTests: 0,
      };
    }
  
    acc[result.memoryPieceId].results.push(result);
    return acc;
  }, {} as Record<string, MemoryPieceStat>);

  const filterIcon = (filter: TimeFilter) => {
    if (filter === 'today') {
      return <ClockIcon className="w-4 h-4" />;
    } else if (filter === 'week') {
      return <CalendarDateRangeIcon className="w-4 h-4" />;
    } else if (filter === 'month') {
      return <CalendarDaysIcon className="w-4 h-4" />;
    } else if (filter === 'year') {
      return <CalendarIcon className="w-4 h-4" />;
    } else if (filter === 'all') {
      return <GlobeAltIcon className="w-4 h-4" />;
    }
  }

  return (
    <div className="min-h-screen w-full p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Performance</h1>
            <p className="mt-1">Track your memory piece performance and practice history</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 ">
            {(['today', 'week', 'month', 'year', 'all'] as TimeFilter[]).map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? 'default' : 'outline'}
                onClick={() => setTimeFilter(filter)}
                className="flex items-center gap-2"
              >
                {filterIcon(filter)}
                {getTimeFilterLabel(filter)}
              </Button>
            ))}
          </div>
        </div>

        {filteredTestResults.length === 0 ? (
          <EmptyState
            icon={ChartBarIcon}
            title={`No practice data ${timeFilter === 'all' ? 'yet' : 'for ' + getTimeFilterLabel(timeFilter).toLowerCase()}`}
            description="Start practicing your subscribed memory pieces to see your performance statistics and progress here. Your practice history will help track your learning journey."
            action={{
              label: "Start Practicing",
              href: "/practice"
            }}
          />
        ) : (
          <>
            {/* Stats Overview */}
            <StatsOverview filteredResults={filteredTestResults} timeFilter={timeFilter} />

            {/* Main Content */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="memory-pieces">Memory Pieces</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Average Score Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AverageScoreChart data={averageScoreData} type="line" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Number of Checks Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <NumberOfChecksChart data={checkNumData} type="bar" />
                    </CardContent>
                  </Card>
                </div>

                <MemoryPieceGrid
                  memoryPieceStats={memoryPieceStats}
                  onMemoryPieceClick={handleMemoryPieceClick}
                  limit={8}
                />
              </TabsContent>

              <TabsContent value="progress" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Average Score Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AverageScoreChart data={averageScoreData} type="line" />
                  </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                      <CardTitle>Number of Checks Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <NumberOfChecksChart data={checkNumData} type="bar" />
                    </CardContent>
                  </Card>
              </TabsContent>

              <TabsContent value="memory-pieces" className="space-y-6">
                <MemoryPieceGrid
                  memoryPieceStats={memoryPieceStats}
                  onMemoryPieceClick={handleMemoryPieceClick}
                />
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* History Modal */}
        <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          memoryPieceStat={selectedMemoryPiece?.id != null && selectedMemoryPiece?.id != '' ? memoryPieceStats?.[selectedMemoryPiece.id] : null}
        />
      </div>
    </div>
  );
};

export default Dashboard;