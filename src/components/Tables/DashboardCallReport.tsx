import { useState, useEffect } from "react";
import { API } from "../../api";

interface CallDetails {
  incoming: number;
  outgoing: number;
  missed: number;
  rejected: number;
  unknown: number;
}

interface EmployeeCallData {
  employeeId: string;
  userId: string;
  user: string;
  email: string;
  phone: string;
  role: string;
  highestCalls: number;
  totalDuration: string;
  averageCallDuration: string;
  callDetails: CallDetails;
}

interface CallReportProps {
  startDate: string;
  endDate: string;
}

const CallReport: React.FC<CallReportProps> = ({ startDate, endDate }) => {
  const [callData, setCallData] = useState<EmployeeCallData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCallReport = async () => {
      try {
        const response = await API.postAuthAPI(
          {
            startDate,
            endDate,
          },
          "call-report",
          true
        );

        if (response.error) throw new Error(response.error);
        setCallData(response.data.employeeList);
      } catch (error) {
        console.error("Failed to fetch call report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCallReport();
  }, [startDate, endDate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="rounded-lg bg-white px-4 pb-4 pt-5 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-7.5 sm:pt-7.5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h4 className="text-xl font-bold text-dark dark:text-white sm:text-body-2xlg">
          Call Report
        </h4>
      </div>

      {/* Mobile View */}
      <div className="block sm:hidden">
        {callData.map((employee, key) => (
          <div
            key={key}
            className={`p-4 ${
              key === callData.length - 1
                ? ""
                : "border-b border-stroke dark:border-dark-3"
            }`}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 text-lg">
                    {employee.user[0]}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-medium text-dark dark:text-white">
                  {employee.user}
                </p>
                <p className="text-sm text-gray-500">{employee.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">
                  Total Duration
                </span>
                <span className="font-medium text-dark dark:text-white">
                  {employee.totalDuration}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">
                  Average Duration
                </span>
                <span className="font-medium text-dark dark:text-white">
                  {employee.averageCallDuration}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">
                  Incoming
                </span>
                <span className="font-medium text-green">
                  {employee.callDetails.incoming}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">
                  Outgoing
                </span>
                <span className="font-medium text-blue-500">
                  {employee.callDetails.outgoing}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">Missed</span>
                <span className="font-medium text-red">
                  {employee.callDetails.missed}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase text-gray-500">
                  Total Calls
                </span>
                <span className="font-medium text-dark dark:text-white">
                  {employee.highestCalls}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-9">
          <div className="col-span-2 px-2 pb-3.5 pl-4">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Employee
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Total Duration
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Avg Duration
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Incoming
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Outgoing
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Missed
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Total Calls
            </h5>
          </div>
          <div className="px-2 pb-3.5 text-center">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Role
            </h5>
          </div>
        </div>

        {callData.map((employee, key) => (
          <div
            className={`grid grid-cols-9 ${
              key === callData.length - 1
                ? ""
                : "border-b border-stroke dark:border-dark-3"
            }`}
            key={key}
          >
            <div className="col-span-2 flex items-center gap-3.5 px-2 py-4 pl-4">
              <div className="relative flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 text-lg">
                    {employee.user[0]}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-medium text-dark dark:text-white">
                  {employee.user}
                </p>
                <p className="text-sm text-gray-500 w-[127px] truncate">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {employee.totalDuration}
              </p>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {employee.averageCallDuration}
              </p>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-green">
                {employee.callDetails.incoming}
              </p>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-blue-500">
                {employee.callDetails.outgoing}
              </p>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-red">
                {employee.callDetails.missed}
              </p>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <p className="font-medium text-dark dark:text-white">
                {employee.highestCalls}
              </p>
            </div>
            <div className="flex items-center justify-center px-2 py-4">
              <div className="rounded-full bg-green/10 px-4 py-1 text-sm font-medium text-green flex">
                <span className="w-max">{employee.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallReport;
