import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface AverageScoreData {
  date: string,
  score: number,
}

interface AverageScoreChartProps {
  data: AverageScoreData[];
  type: 'line' | 'area' | 'bar';
}

export const AverageScoreChart: React.FC<AverageScoreChartProps> = ({ data, type }) => {

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-blue-600 dark:text-blue-400">{`Average Score: ${data.score}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 5]} />
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
            <YAxis stroke="#666" domain={[0, 5]} />
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
            <YAxis stroke="#666" domain={[0, 5]} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      
      default:
        return null;
    }
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
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