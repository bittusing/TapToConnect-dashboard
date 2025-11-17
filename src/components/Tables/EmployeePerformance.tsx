import { useState } from "react";
import DefaultSelectOption from "../SelectOption/DefaultSelectOption";

interface EmployeeData {
  assignedLeads: number;
  totalRevenue: number;
  agent: string;
  closed: number;
  open: number;
  failed: number;
  conversion: string;
  isOnline: boolean;
  revenue: string;
}

interface EmployeePerformanceProps {
  data: EmployeeData[];
}

const EmployeePerformance: React.FC<EmployeePerformanceProps> = ({ data = [] }) => {
  const getConversionColor = (conversionRate: string): string => {
    const rate = parseFloat(conversionRate);
    if (rate < 30) {
      return "text-red";
    } else if (rate >= 30 && rate < 65) {
      return "text-orange";
    } else {
      return "text-green";
    }
  };  

  return (
    <div className="rounded-lg bg-white px-4 pb-4 pt-5 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-7.5 sm:pt-7.5">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-xl font-bold text-dark dark:text-white sm:text-body-2xlg">
          Employee Performance
        </h4>
        {/* <div className="flex items-center gap-2.5">
          <p className="text-sm font-medium uppercase text-dark dark:text-dark-6 sm:text-base">
            Short by:
          </p>
          <DefaultSelectOption options={["Monthly", "Yearly"]} />
        </div> */}
      </div>

      {/* Employee Cards - Mobile View */}
      <div className="block sm:hidden">
        {data.map((employee, key) => (
          <div
            key={key}
            className={`p-4 ${
              key === data.length - 1
                ? ""
                : "border-b border-stroke dark:border-dark-3"
            }`}
          >
            {/* Employee Header */}
            <div className="mb-3 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 text-lg">{employee.agent[0]}</span>
                </div>
                <span
                  className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-dark-2 ${
                    employee.isOnline ? "bg-green" : "bg-red-light"
                  }`}
                ></span>
              </div>
              <p className="font-medium text-dark dark:text-white">
                {employee.agent}
              </p>
            </div>

            {/* Employee Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">
                  Assigned leads
                </span>
                <span className="font-medium text-dark dark:text-white">
                  {employee.assignedLeads}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">Closed</span>
                <span className="font-medium text-dark dark:text-white">
                  {employee.closed}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">Open</span>
                <span className="font-medium text-dark dark:text-white">
                  {employee.open}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">Failed</span>
                <span className="font-medium text-dark dark:text-white">
                  {employee.failed}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">Revenue</span>
                <span className="font-medium text-green-light-1">
                  ₹{parseInt(employee.revenue).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">
                  Conversion
                </span>
                <span className={`font-medium ${getConversionColor(employee.conversion)}`}>
                  {employee.conversion}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-8">
          <div className="col-span-2 px-2 pb-3.5 pl-4">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Employee
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Assigned leads
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Closed
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Open
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Failed
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Revenue
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Conversion
            </h5>
          </div>
        </div>

        {data.map((employee, key) => (
          <div
            className={`grid grid-cols-8 ${
              key === data.length - 1
                ? ""
                : "border-b border-stroke dark:border-dark-3"
            }`}
            key={key}
          >
            <div className="col-span-2 flex items-center gap-3.5 px-2 py-4 pl-4">
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 text-lg">{employee.agent[0]}</span>
                </div>
                <span
                  className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-dark-2 ${
                    employee.isOnline ? "bg-green" : "bg-red-light"
                  }`}
                ></span>
              </div>
              <p className="font-medium text-dark dark:text-white">
                {employee.agent}
              </p>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {employee.assignedLeads}
              </p>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {employee.closed}
              </p>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {employee.open}
              </p>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {employee.failed}
              </p>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-green-light-1">
                ₹{parseInt(employee.revenue).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <p className={`font-medium ${getConversionColor(employee.conversion)}`}>
                {employee.conversion}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeePerformance;