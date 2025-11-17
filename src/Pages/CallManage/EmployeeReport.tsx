import React, { useEffect, useMemo, useState, useCallback } from "react";
import CallDetails from "./components/CallDetails";
import AnalysisReport from "./components/AnalysisReport";
import Summary from "./components/Summary";
import TabPanel from "../../components/TabPanel/TabPanel";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import { getStoredAgents } from "../../api/commonAPI";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import AntDateTimePicker from "../../components/FormElements/DatePicker/AntDateTimePicker";
import SelectGroupAntd from "../../components/FormElements/SelectGroup/SelectGroupAntd";

interface CallListResponse {
  calls: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface CallReport {
  summary: {
    callType: Array<{
      calltype: string;
      calls: number;
      duration: string;
    }>;
    stats: {
      missCall: number;
      notConnectedCall: number;
      connectedCalls: number;
      rejected: number;
      workingHours: string;
    };
  };
  analysis: {
    mobileCallAnalysis: {
      topCaller: {
        number: string;
        totalCalls: number;
      };
    };
    totalCallDurationAnalysis: {
      longestDuration: {
        duration: string;
        callTo: string;
        callTime: string;
      };
    };
    averageCallDurationAnalysis: {
      perCall: string;
      totalCalls: number;
      perDay: string;
      totalDays: number;
    };
  };
}

const fromDateInitial = new Date(
  new Date().setMonth(new Date().getMonth() - 1)
);

const EmployeeReport: React.FC = () => {
  const [employee, setEmployee] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [fromDate, setFromDate] = useState(fromDateInitial);
  const [toDate, setToDate] = useState(new Date());
  const [reportData, setReportData] = useState<CallReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [callListData, setCallListData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [callListLoading, setCallListLoading] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState<{
    value: string;
    label: string;
  } | null>({ value: "", label: "" });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const employeeList = useMemo(() => getStoredAgents() || [], []);
  const [userRole, setUserRole] = useState<string | null>(null);
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const data = JSON.parse(userStr);
        setUserRole(data?.role);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);
  

  const fetchCallList = useCallback(
    async (
      page: number,
      pageSize: number,
      search: string,
      userId: string,
      startDate: Date,
      endDate: Date
    ) => {
      if (!userId) return;

      try {
        setCallListLoading(true);
        const payload = {
          userId,
          startDate: dayjs(startDate).format("YYYY-MM-DD"),
          endDate: dayjs(endDate).format("YYYY-MM-DD"),
        };
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
          ...(search && { search }),
        });

        const { data, error } = await API.postAuthAPI<CallListResponse>(
          payload,
          `${END_POINT.CALL_LIST}?${params.toString()}`,
          true
        );

        if (error) throw new Error(error);
        if (data) {
          setCallListData(data.calls);
          setPagination({
            current: data.pagination.page,
            pageSize: data.pagination.limit,
            total: data.pagination.total,
          });
        }
      } catch (error: any) {
        console.error(error.message || "Failed to fetch call list");
      } finally {
        setCallListLoading(false);
      }
    },
    []
  );

  const fetchReportData = async (
    initialRender = false,
    initialEmployee: { value: string; label: string }
  ) => {
    try {
      setIsLoading(true);
      const currentUser = initialRender ? initialEmployee : selectedEmployee;

      setActiveEmployee(currentUser);

      const payload = {
        userId: currentUser?.value,
        startDate: dayjs(fromDate).format("YYYY-MM-DD"),
        endDate: dayjs(toDate).format("YYYY-MM-DD"),
      };

      const { data, error } = await API.postAuthAPI(
        payload,
        END_POINT.EMPLOYEE_REPORT,
        true
      );

      if (error) throw new Error(error);

      setReportData(data);

      // Fetch call list with same parameters
      if (currentUser?.value) {
        fetchCallList(
          1,
          pagination.pageSize,
          searchText,
          currentUser?.value,
          fromDate,
          toDate
        );
      }
    } catch (error: any) {
      console.error(error.message || "Failed to fetch report data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!employeeList.length) return;
    const obj = employeeList.map((item) => ({
      value: item._id,
      label: item.name,
    }));
    setEmployee(obj);
    setSelectedEmployee(obj[0]);
    fetchReportData(true, obj[0]);
  }, [employeeList]);

  const handleEmployeeChange = (value: string) => {
    const obj = employee.find((item) => item.value === value);
    setSelectedEmployee(obj || null);
  };

  const handleFromDateChange = (_selectedDates: Date[], dateStr: string) => {
    setFromDate(new Date(dateStr));
  };

  const handleToDateChange = (_selectedDates: Date[], dateStr: string) => {
    setToDate(new Date(dateStr));
  };

  const handleApply = () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }
    fetchReportData(false, { value: "", label: "" });
  };

  const handleSearch = useCallback(
    (value: string) => {
      setSearchText(value);
      if (selectedEmployee) {
        fetchCallList(
          1,
          pagination.pageSize,
          value,
          selectedEmployee.value,
          fromDate,
          toDate
        );
      }
    },
    [selectedEmployee, fromDate, toDate, pagination.pageSize, fetchCallList]
  );

  const handleTableChange = useCallback(
    (newPagination: any, pageSize: any) => {
      if (selectedEmployee) {
        fetchCallList(
          newPagination,
          pageSize,
          searchText,
          selectedEmployee.value,
          fromDate,
          toDate
        );
      }
    },
    [selectedEmployee, searchText, fromDate, toDate, fetchCallList]
  );

  const memoizedCallDetails = useMemo(
    () => (
      <CallDetails
        data={callListData}
        loading={callListLoading}
        onSearch={handleSearch}
        pagination={pagination}
        onTableChange={handleTableChange}
        searchText={searchText}
      />
    ),
    [
      callListData,
      callListLoading,
      handleSearch,
      pagination,
      handleTableChange,
      searchText,
    ]
  );

  const tabsData = useMemo(
    () => {
      const allTabs = [
        {
          tabName: "Summary",
          component: <Summary data={reportData?.summary} isLoading={isLoading} />,
        },
        {
          tabName: "Analysis",
          component: (
            <AnalysisReport data={reportData?.analysis} isLoading={isLoading} />
          ),
        },
        {
          tabName: "Call Details",
          component: memoizedCallDetails,
        },
      ];

      // Filter out Analysis and Call Details tabs for Super Admin
      if (userRole !== "Super Admin") {
        return allTabs.filter(tab => tab.tabName === "Summary");
      }

      return allTabs;
    },
    [reportData, isLoading, memoizedCallDetails, userRole]
  );

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="text-xl text-center font-semibold text-dark dark:text-white sm:text-2xl">
        {activeEmployee?.label ? `${activeEmployee?.label}'s Report` : "Report"}
      </h2>
      <hr className="my-4" />
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="w-full lg:w-1/4">
          <SelectGroupAntd
            label="Select Employee"
            placeholder="Select Employee"
            options={employee}
            selectedOption={selectedEmployee?.value}
            setSelectedOption={handleEmployeeChange}
            showSearch
          />
        </div>
        <div className="w-full lg:w-1/4">
          <AntDateTimePicker
            label="From Date"
            onChange={handleFromDateChange}
            defaultValue={fromDate.toISOString()}
          />
        </div>
        <div className="w-full lg:w-1/4">
          <AntDateTimePicker
            label="To Date"
            onChange={handleToDateChange}
            defaultValue={toDate.toISOString()}
          />
        </div>
        <ButtonDefault
          label={isLoading ? "Loading..." : "Apply"}
          onClick={handleApply}
          customClasses="min-w-[130px]"
          disabled={isLoading || !selectedEmployee}
        />
      </div>

      <TabPanel
        tabsData={tabsData}
        type="line"
        tabPosition="top"
        defaultActiveKey="1"
      />
    </div>
  );
};

export default EmployeeReport;
