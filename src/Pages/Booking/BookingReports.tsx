import React, { useState, useEffect } from "react";
import { Card, DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import SelectGroupOne from "../../components/FormElements/SelectGroup/SelectGroupOne";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { toast } from "react-toastify";
import {
  getStoredAgents,
  getStoredProductsServices,
  getStoredSources,
  getStoredStatus,
} from "../../api/commonAPI";
import Heading from "../../components/CommonUI/Heading";

const { RangePicker } = DatePicker;

interface SummaryCardProps {
  title: string;
  value: string | number;
}

interface ReportPayload {
  assignedAgent?: string;
  ProductService?: string;
  leadSource?: string;
  leadStatus?: string;
  startDate: string;
  endDate: string;
}

interface ReportResponse {
  summary: {
    total: number;
    completed: number;
    amount: number;
    ratio: string;
  };
  bookings: Array<{
    srNo: number;
    clientName: string;
    bookingAmount: number;
    status: string;
    date: string;
  }>;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value }) => (
  <Card className="bg-white text-center shadow-md dark:bg-gray-700">
    <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
      {title}
    </p>
    <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
  </Card>
);

const BookingReports: React.FC = () => {
  // Get stored data for dropdowns
  const agentList = getStoredAgents(true);
  const serviceList = getStoredProductsServices(true);
  const sourceList = getStoredSources(true);
  const statusList = getStoredStatus(true);

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    dayjs().format("YYYY-MM-DD"),
  ]);

  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "srNo",
      key: "srNo",
      minWidth: 80,
    },
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
      minWidth: 115,
    },
    {
      title: "Booking Amount",
      dataIndex: "bookingAmount",
      key: "bookingAmount",
      minWidth: 113,
      render: (amount: number) => `₹${amount.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      minWidth: 100,
      render: (status: string) => {
        let color = "text-green-500";
        if (status === "Pending") color = "text-yellow-500";
        if (status === "Cancelled") color = "text-red-500";
        return <span className={color}>{status}</span>;
      },
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      minWidth: 100,
    },
  ];

  const handleDateRangeChange = (
    dates: null | [Dayjs | null, Dayjs | null],
    dateStrings: [string, string]
  ) => {
    if (dates) {
      setDateRange(dateStrings);
    }
  };

  const fetchReportData = async () => {
    try {
      setIsLoading(true);

      const payload: ReportPayload = {
        assignedAgent: selectedAgent,
        ProductService: selectedProduct,
        leadSource: selectedSource,
        leadStatus: selectedStatus,
        startDate: dateRange[0],
        endDate: dateRange[1],
      };

      const { data: response, error } = await API.postAuthAPI<ReportResponse>(
        payload,
        END_POINT.PRODUCT_SALE_REPORT,
        true
      );

      if (error) throw new Error(error);

      if (response) {
        setReportData(response);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch report data";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    fetchReportData();
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  return (
    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <Heading title="Booking Reports" />
      <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <div className="col-span-1">
          <SelectGroupOne
            options={serviceList || []}
            setSelectedOption={setSelectedProduct}
            placeholder="Select Product"
            selectedOption={selectedProduct}
            allowClear
          />
        </div>
        <div className="col-span-1">
          <SelectGroupOne
            options={sourceList || []}
            setSelectedOption={setSelectedSource}
            placeholder="Select Source"
            selectedOption={selectedSource}
            allowClear
          />
        </div>
        <div className="col-span-1">
          <SelectGroupOne
            options={statusList || []}
            setSelectedOption={setSelectedStatus}
            placeholder="Select Status"
            selectedOption={selectedStatus}
            allowClear
          />
        </div>
        <div className="col-span-1">
          <SelectGroupOne
            options={agentList || []}
            setSelectedOption={setSelectedAgent}
            placeholder="Select User"
            selectedOption={selectedAgent}
            allowClear
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <RangePicker
            value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
            onChange={handleDateRangeChange}
            className="h-[50px] w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white lg:max-w-none"
          />
        </div>
      </div>
      <div className="mb-2 flex justify-center">
        <ButtonDefault
          label={isLoading ? "Loading..." : "Submit"}
          customClasses="w-full md:w-auto"
          onClick={handleSubmit}
          disabled={isLoading}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="col-span-1">
          <SummaryCard title="Total Bookings" value={reportData?.summary.total || 0} />
        </div>
        <div className="col-span-1">
          <SummaryCard title="Completed" value={reportData?.summary.completed || 0} />
        </div>
        <div className="col-span-1">
          <SummaryCard
            title="Completion Rate"
            value={`${reportData?.summary.ratio || 0}%`}
          />
        </div>
        <div className="col-span-1">
          <SummaryCard title="Total Amount" value={`₹${reportData?.summary.amount.toLocaleString() || 0}`} />
        </div>
      </div>

      <CustomAntdTable
        columns={columns}
        dataSource={reportData?.bookings || []}
        loading={isLoading}
        pagination={{
          total: reportData?.bookings?.length || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        className="dark:bg-gray-700 dark:text-white"
      />

      <style>{`
        .ant-select-selector,
        .ant-input,
        .ant-picker {
          border-radius: 4px !important;
        }
        .dark .ant-select-selector,
        .dark .ant-input,
        .dark .ant-picker,
        .dark .ant-picker-panel-container {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
          color: white !important;
        }
        .dark .ant-select-arrow,
        .dark .ant-picker-suffix,
        .dark .ant-picker-icon {
          color: white !important;
        }
        .dark .ant-picker-header,
        .dark .ant-picker-content th {
          color: white !important;
        }
        .dark .ant-picker-cell {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        .dark .ant-picker-cell-in-view {
          color: white !important;
        }
        .dark .ant-picker-cell:hover .ant-picker-cell-inner {
          background-color: #4b5563 !important;
        }
        .dark .ant-picker-cell-selected .ant-picker-cell-inner {
          background-color: #1890ff !important;
        }
        .dark .ant-picker-footer,
        .dark .ant-picker-today-btn {
          color: white !important;
        }
        .dark .ant-card-bordered {
          border: 1px solid grey;
        }
      `}</style>
    </div>
  );
};

export default BookingReports; 