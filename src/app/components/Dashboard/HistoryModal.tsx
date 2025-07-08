import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Badge } from '@/app/components/Badge';
import { format } from 'date-fns';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {MemoryPieceStat, SubscriptionStatus} from './types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryPieceStat: MemoryPieceStat | null;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, memoryPieceStat }) => {
  if (!memoryPieceStat) return null;
  const testHistory = memoryPieceStat.results
    .sort((a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime());

  const chartData = testHistory
    .slice()
    .reverse()
    .map((result, index) => ({
      test: index + 1,
      score: Math.round((result.score / result.maxScore) * 100),
      date: format(new Date(result.testDate), 'MMM dd'),
    }));

  const avgScore = testHistory.length > 0 ? 
    testHistory.reduce((sum, result) => sum + (result.score / result.maxScore) * 100, 0) / testHistory.length : 0;
  
  const bestScore = testHistory.length > 0 ? 
    Math.max(...testHistory.map(result => (result.score / result.maxScore) * 100)) : 0;

  const getDifficultyColor = (difficulty: SubscriptionStatus) => {
    switch (difficulty) {
      case 'learned': return 'bg-green-100 text-green-800';
      case 'learning': return 'bg-yellow-100 text-yellow-800';
      case 'new': 
      case 'lapsed':
        return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{memoryPieceStat.memoryPiece.content}</DialogTitle>
          <p className="text-gray-600 mt-1">{memoryPieceStat.memoryPiece.description}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Memory Piece Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            {/* <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Subject:</span> {details?.subject?.name}</p>
                <p><span className="text-gray-600">Unit:</span> {details?.unit?.name}</p>
                <p><span className="text-gray-600">Lesson:</span> {details?.lesson?.name}</p>
              </div>
            </div> */}
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Tags & Difficulty</h4>
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge className={getDifficultyColor(memoryPieceStat.status)}>
                  {memoryPieceStat.status}
                </Badge>
                {memoryPieceStat.memoryPiece.labels.map(label => (
                  <Badge key={label} variant="outline" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{testHistory.length}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{avgScore.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{bestScore.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Best Score</div>
            </div>
          </div>

          {/* Progress Chart */}
          {testHistory.length > 0 && (
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-4">Score Progress</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="test" stroke="#666" />
                    <YAxis stroke="#666" domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Score']}
                      labelFormatter={(label) => `Test ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Test History */}
          <div className="bg-white rounded-lg border">
            <h4 className="font-semibold p-4 border-b">Test History</h4>
            <div className="divide-y max-h-64 overflow-y-auto">
              {testHistory.map((result) => (
                <div key={result.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(result.testDate), 'PPp')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          {result.score === result.maxScore ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                          )}
                          <span className="font-medium">
                            Score: {result.score}/{result.maxScore} ({Math.round((result.score / result.maxScore) * 100)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};