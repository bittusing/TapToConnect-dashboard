import { useEffect, useMemo, useState, useCallback } from "react";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import CallDetails from "../CallManage/components/CallDetails";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { toast } from "react-toastify";
import { getStoredAgents } from "../../api/commonAPI";
import dayjs from "dayjs";
import Heading from "../../components/CommonUI/Heading";
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

const fromDateInitial = new Date(
  new Date().setMonth(new Date().getMonth() - 1)
);

export default function CallReport() {
  // State for employee selection
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    value: string;
    label: string;
  } | null>(null);

  // State for dates
  const [fromDate, setFromDate] = useState(fromDateInitial);
  const [toDate, setToDate] = useState(new Date());

  // State for call list
  const [callListData, setCallListData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [callListLoading, setCallListLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch and set employee list on component mount
  useEffect(() => {
    const agents = getStoredAgents() || [];
    const formattedAgents = agents.map((agent: any) => ({
      value: agent._id,
      label: agent.name,
    }));
    setEmployeeList(formattedAgents);

    if (formattedAgents.length > 0) {
      setSelectedEmployee(formattedAgents[0]);
      fetchCallList(
        1,
        pagination.pageSize,
        "",
        formattedAgents[0].value,
        fromDate,
        toDate
      );
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

        const { data: response, error } =
          await API.postAuthAPI<CallListResponse>(
            payload,
            `${END_POINT.CALL_LIST}?${params.toString()}`,
            true
          );

        if (error) throw new Error(error);

        if (response) {
          setCallListData(response.calls);
          setPagination({
            current: response.pagination.page,
            pageSize: response.pagination.limit,
            total: response.pagination.total,
          });
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch call list");
      } finally {
        setCallListLoading(false);
      }
    },
    []
  );

  const handleEmployeeChange = useCallback(
    (value: string) => {
      const selectedEmp = employeeList.find((emp) => emp.value === value);
      setSelectedEmployee(selectedEmp || null);
    },
    [employeeList]
  );

  const handleFromDateChange = useCallback(
    (_selectedDates: Date[], dateStr: string) => {
      setFromDate(new Date(dateStr));
    },
    []
  );

  const handleToDateChange = useCallback(
    (_selectedDates: Date[], dateStr: string) => {
      setToDate(new Date(dateStr));
    },
    []
  );

  const handleApply = useCallback(() => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }
    // Reset pagination to first page when applying new filters
    fetchCallList(
      1,
      pagination.pageSize,
      searchText,
      selectedEmployee.value,
      fromDate,
      toDate
    );
  }, [
    selectedEmployee,
    fromDate,
    toDate,
    searchText,
    pagination.pageSize,
    fetchCallList,
  ]);

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
    (newPagination: number, pageSize: number) => {
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

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <Heading title="Call Report" />
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="w-full lg:w-1/4">
          <SelectGroupAntd
            label="Select Employee"
            options={employeeList}
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
          label={callListLoading ? "Loading..." : "Apply"}
          onClick={handleApply}
          customClasses="min-w-[130px]"
          disabled={callListLoading || !selectedEmployee}
        />
      </div>
      {memoizedCallDetails}
    </div>
  );
}
