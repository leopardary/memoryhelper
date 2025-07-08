'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/tabs';
import { Button } from '@/app/components/button';
import { ClockIcon, CalendarIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { AverageScoreChart, AverageScoreData } from '@/app/components/AverageScoreChart';
import { NumberOfChecksChart, NumberOfChecksData } from '@/app/components/NumberOfChecksChart';
import { MemoryPieceGrid } from './MemoryPieceGrid';
import { StatsOverview } from './StatsOverview';
import { HistoryModal } from './HistoryModal';
import { MemoryPiece } from './mockData';
import {MemoryCheckObj, SubscriptionOverallRecord} from './types';



type TimeFilter = 'today' | 'week' | 'month';

interface TestResult {
  id: string;
  memoryPieceId: string;
  score: number;
  maxScore: number;
  testDate: string;
}

const convertDateToDay = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
}

function calculateAverage(arr) {
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

const Dashboard = ({record} : {record: any}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [selectedMemoryPiece, setSelectedMemoryPiece] = useState<MemoryPiece | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const filterDataByTime = (timeFilter: TimeFilter) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filterDate: Date;
    switch (timeFilter) {
      case 'today':
        filterDate = startOfDay;
        break;
      case 'week':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return Object.keys(record).reduce((memoryChecks, subscriptionId) => {
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
  }, []);

  const checkNumData: NumberOfChecksData[] = Object.keys(filteredTestResultsByDate).reduce((arry: NumberOfChecksData[], date: string) => {
    arry.push({count: filteredTestResultsByDate[date].length, date: date});
    return arry;
  }, []);

  const handleMemoryPieceClick = (memoryPiece: MemoryPiece) => {
    setSelectedMemoryPiece(memoryPiece);
    setIsHistoryModalOpen(true);
  };

  const getTimeFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case 'today': return 'Today';
      case 'week': return 'Past Week';
      case 'month': return 'Past Month';
    }
  };

  return (
    <div className="min-h-screen w-full p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Performance</h1>
            <p className="mt-1">Track your memory piece performance and practice history</p>
          </div>
          
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as TimeFilter[]).map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? 'default' : 'outline'}
                onClick={() => setTimeFilter(filter)}
                className="flex items-center gap-2"
              >
                {filter === 'today' ? <ClockIcon className="w-4 h-4" /> : filter === 'week' ? <CalendarIcon className="w-4 h-4" /> : <CalendarDaysIcon className="w-4 h-4" />}
                {getTimeFilterLabel(filter)}
              </Button>
            ))}
          </div>
        </div>

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
              filteredResults={filteredTestResults}
              subscriptionData={record}
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
              filteredResults={filteredTestResults}
              subscriptionData={record}
              onMemoryPieceClick={handleMemoryPieceClick}
            />
          </TabsContent>
        </Tabs>

        {/* History Modal */}
        <HistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          memoryPiece={selectedMemoryPiece}
        />
      </div>
    </div>
  );
};

export default Dashboard;