import React, { useState, useEffect } from "react";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import useScreenHook from "../../hooks/useScreenHook";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import Heading from "../../components/CommonUI/Heading";
import AntDateTimePicker from "../../components/FormElements/DatePicker/AntDateTimePicker";

interface EmployeeData {
  key: string;
  srNo: number;
  user: string;
  higstestNoOfCall: number;
  totalDuration: string;
  averageCallDuration: string;
}

interface EmployeeResponse {
  employeeId: string;
  userId: string;
  user: string;
  email: string;
  phone: string;
  role: string;
  highestCalls: number;
  totalDuration: string;
  averageCallDuration: string;
  callDetails: {
    incoming: number;
    outgoing: number;
    missed: number;
    rejected: number;
    unknown: number;
  };
}

const fromDateInitial = new Date(
  new Date().setMonth(new Date().getMonth() - 1)
);

const EmployeeList: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(
    fromDateInitial?.toISOString()
  );
  const [endDate, setEndDate] = useState<string>(new Date()?.toISOString());
  const [data, setData] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { deviceType } = useScreenHook();

  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "srNo",
      key: "srNo",
      align: "center" as const,
      minWidth: 80,
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      align: "center" as const,
    },
    {
      title:
        deviceType === "mobile" ? "Number of Calls" : "Highest No. of Calls",
      dataIndex: "higstestNoOfCall",
      key: "higstestNoOfCall",
      minWidth: 142,
      align: "center" as const,
    },
    {
      title: "Total Duration",
      dataIndex: "totalDuration",
      key: "totalDuration",
      minWidth: 127,
      align: "center" as const,
    },
    {
      title: "Average Call Duration",
      dataIndex: "averageCallDuration",
      key: "averageCallDuration",
      minWidth: 180,
      align: "center" as const,
    },
  ];

  useEffect(() => {
    fetchEmployeeData();
  }, []); // Initial fetch

  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true);
      const payload = {
        startDate,
        endDate,
      };

      const { data: response, error } = await API.postAuthAPI(
        payload,
        END_POINT.EMPLOYEE_REPORT,
        true
      );

      if (error) throw new Error(error);

      if (response?.employeeList) {
        const transformedData: EmployeeData[] = response.employeeList.map(
          (employee: EmployeeResponse, index: number) => ({
            key: employee.userId,
            srNo: index + 1,
            user: employee.user,
            higstestNoOfCall: employee.highestCalls,
            totalDuration: employee.totalDuration,
            averageCallDuration: employee.averageCallDuration,
          })
        );
        setData(transformedData);
      }
    } catch (error: any) {
      console.error(error.message || "Failed to fetch employee data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDateChange = (_selectedDates: Date[], dateStr: string) => {
    setStartDate(dateStr);
  };

  const handleEndDateChange = (_selectedDates: Date[], dateStr: string) => {
    setEndDate(dateStr);
  };

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (dayjs(endDate).isBefore(dayjs(startDate))) {
      toast.error("End date cannot be before start date");
      return;
    }
    fetchEmployeeData();
  };

  const handleRefresh = () => {
    fetchEmployeeData();
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <Heading title="Employee List" />

      <div className="mb-6 flex flex-col gap-4 items-center justify-between sm:flex-row">
        <div className="flex flex-col w-full items-center gap-4 sm:flex-row">
          <div className="w-full lg:w-1/4">
            <AntDateTimePicker
              label="From Date"
              onChange={handleStartDateChange}
              defaultValue={startDate}
              // enableTime
            />
          </div>
          <div className="w-full lg:w-1/4">
            <AntDateTimePicker
              label="To Date"
              onChange={handleEndDateChange}
              defaultValue={endDate}
              // enableTime
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ButtonDefault
            label={isLoading ? "Loading..." : "Submit"}
            onClick={handleSubmit}
            variant="primary"
            customClasses="bg-primary text-white"
            disabled={isLoading}
          />
          <ButtonDefault
            label="Refresh"
            onClick={handleRefresh}
            variant="secondary"
            customClasses="bg-green-500 text-white"
            disabled={isLoading}
          />
        </div>
      </div>

      <CustomAntdTable
        columns={columns}
        dataSource={data}
        pagination={false}
        className="w-full"
        isLoading={isLoading}
      />
    </div>
  );
};

export default EmployeeList;
