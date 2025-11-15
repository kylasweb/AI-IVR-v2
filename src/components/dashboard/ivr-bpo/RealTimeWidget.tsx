'use client';

import React, { useEffect, useState } from 'react';
import { useRealTimeWorkflowData } from '@/hooks/use-realtime-workflows';

interface RealTimeWidgetProps {
  title: string;
  dataKey: string;
  className?: string;
}

export default function RealTimeWidget({
  title,
  dataKey,
  className = ''
}: RealTimeWidgetProps) {
  const [currentValue, setCurrentValue] = useState<number | string>(0);
  const { data, isConnected } = useRealTimeWorkflowData();

  useEffect(() => {
    if (data && data[dataKey] !== undefined) {
      setCurrentValue(data[dataKey]);
    }
  }, [data, dataKey]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{currentValue}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {isConnected ? 'Live' : 'Disconnected'}
      </p>
    </div>
  );
}