import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TestResult, getMemoryPieceDetails } from './mockData';
import { format } from 'date-fns';

interface ProgressChartProps {
  data: TestResult[];
  type: 'line' | 'area' | 'bar';
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data, type }) => {
  const chartData = data
    .sort((a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime())
    .map(result => {
      const details = getMemoryPieceDetails(result.memoryPieceId);
      return {
        date: format(new Date(result.testDate), 'MMM dd'),
        score: Math.round((result.score / result.maxScore) * 100),
        title: details?.memoryPiece.title || 'Unknown',
        subject: details?.subject?.name || 'Unknown',
        timeSpent: result.timeSpent,
      };
    });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-blue-600">{`Score: ${data.score}%`}</p>
          <p className="text-sm text-gray-500">{`${data.title}`}</p>
          <p className="text-sm text-gray-500">{`Subject: ${data.subject}`}</p>
          {data.timeSpent && (
            <p className="text-sm text-gray-500">{`Time: ${Math.floor(data.timeSpent / 60)}m ${data.timeSpent % 60}s`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#3B82F6" 
              fill="#3B82F6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      
      default:
        return null;
    }
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No test data available for the selected time period
      </div>
    );
  }

  const renderedChart = renderChart();
  return (
    <div className="h-64">
      {renderedChart && (<ResponsiveContainer width="100%" height="100%">
        {renderedChart}
      </ResponsiveContainer>)}
    </div>
  );
};