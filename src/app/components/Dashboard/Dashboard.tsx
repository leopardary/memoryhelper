'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Button } from '../button';
import { Calendar, Clock } from 'lucide-react';
import { ProgressChart } from './ProgressChart';
import { MemoryPieceGrid } from './MemoryPieceGrid';
import { StatsOverview } from './StatsOverview';
import { HistoryModal } from './HistoryModal';
import { mockData, MemoryPiece } from './mockData';

type TimeFilter = 'today' | 'week' | 'month';

const Dashboard = () => {
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

    return mockData.testResults.filter(result => 
      new Date(result.testDate) >= filterDate
    );
  };

  const filteredResults = filterDataByTime(timeFilter);

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
            <h1 className="text-3xl font-bold text-gray-900">Performance</h1>
            <p className="text-gray-600 mt-1">Track your memory piece performance and practice history</p>
          </div>
          
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as TimeFilter[]).map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? 'default' : 'outline'}
                onClick={() => setTimeFilter(filter)}
                className="flex items-center gap-2"
              >
                {filter === 'today' ? <Clock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                {getTimeFilterLabel(filter)}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview filteredResults={filteredResults} timeFilter={timeFilter} />

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
                  <CardTitle>Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart data={filteredResults} type="line" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart data={filteredResults} type="bar" />
                </CardContent>
              </Card>
            </div>
            
            <MemoryPieceGrid 
              filteredResults={filteredResults}
              onMemoryPieceClick={handleMemoryPieceClick}
              limit={8}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Progress Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressChart data={filteredResults} type="area" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memory-pieces" className="space-y-6">
            <MemoryPieceGrid 
              filteredResults={filteredResults}
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