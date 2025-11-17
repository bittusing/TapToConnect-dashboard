import React from 'react';
import { Card } from "antd";

interface BookingSummaryCardProps {
  title: string;
  value: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({ 
  title, 
  value,
  count,
  color,
  icon
}) => (
  <Card className="bg-white shadow-md dark:bg-gray-700 h-full p-0 overflow-hidden">
    <div className="px-5 py-6">
      <p className="text-sm font-medium uppercase text-gray-500 dark:text-gray-400 mb-4">
        {title}
      </p>
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-4xl font-bold text-gray-800 dark:text-white mb-1">
            {count}
          </p>
          <p className="text-base font-medium text-gray-600 dark:text-gray-300">
            ({value})
          </p>
        </div>
        <div 
          className={`flex h-14 w-14 items-center justify-center rounded-full text-white text-xl`} 
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
      </div>
    </div>
  </Card>
);

export default BookingSummaryCard; 