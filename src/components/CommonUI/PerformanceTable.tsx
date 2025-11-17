import React from 'react';

export interface PerformanceRowData {
  name: string;
  thisMonthValue: string;
  thisYearValue: string;
}

interface PerformanceTableProps {
  title: string;
  data: PerformanceRowData[];
}

const PerformanceTable: React.FC<PerformanceTableProps> = ({ title, data }) => (
  <div className="rounded-lg bg-white px-5 pb-5 pt-5 shadow-1 dark:bg-gray-dark dark:shadow-card h-full">
    <div className="mb-5">
      <h4 className="text-xl font-bold text-dark dark:text-white">
        {title}
      </h4>
    </div>
    
    <div className="grid grid-cols-3 border-b border-gray-200 pb-3">
      <div className="px-2">
        <h5 className="text-sm font-medium uppercase text-gray-500">
          Name
        </h5>
      </div>
      <div className="px-2 text-center">
        <h5 className="text-sm font-medium uppercase text-gray-500">
          This Month
        </h5>
      </div>
      <div className="px-2 text-center">
        <h5 className="text-sm font-medium uppercase text-gray-500">
          This Year
        </h5>
      </div>
    </div>

    {data.map((row, key) => (
      <div
        className={`grid grid-cols-3 ${
          key === data.length - 1
            ? ""
            : "border-b border-gray-200"
        }`}
        key={key}
      >
        <div className="flex items-center px-2 py-4">
          <p className="font-medium text-gray-800 dark:text-white">
            {row.name}
          </p>
        </div>
        <div className="flex items-center justify-center px-2 py-4">
          <p className="font-medium text-gray-800 dark:text-white">
            {row.thisMonthValue}
          </p>
        </div>
        <div className="flex items-center justify-center px-2 py-4">
          <p className="font-medium text-gray-800 dark:text-white">
            {row.thisYearValue}
          </p>
        </div>
      </div>
    ))}
  </div>
);

export default PerformanceTable; 