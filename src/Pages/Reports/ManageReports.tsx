import React, { useState, useEffect } from "react";
import { Card, DatePicker } from "antd";
import dayjs from "dayjs";
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
import SelectGroupAntd from "../../components/FormElements/SelectGroup/SelectGroupAntd";

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
    won: number;
    amount: number;
    ratio: string;
  };
  leads: Array<{
    srNo: number;
    clientName: string;
    leadPrice: number;
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

const ManageReports: React.FC = () => {
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
      title: "Employee Name",
      dataIndex: "clientName",
      key: "clientName",
      minWidth: 115,
    },
    {
      title: "Lead Price",
      dataIndex: "leadPrice",
      key: "leadPrice",
      minWidth: 113,
    },
  ];

  const handleDateRangeChange = (
    _dates: any,
    dateStrings: [string, string]
  ) => {
    setDateRange(dateStrings);
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
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch report data");
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
      <Heading title="CRM Report" />
      <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <div className="col-span-1">
          <SelectGroupAntd
            options={serviceList || []}
            setSelectedOption={setSelectedProduct}
            placeholder="Select Product"
            selectedOption={selectedProduct}
            allowClear
            showSearch
          />
        </div>
        <div className="col-span-1">
          <SelectGroupAntd
            options={sourceList || []}
            setSelectedOption={setSelectedSource}
            placeholder="Select Source"
            selectedOption={selectedSource}
            allowClear
            showSearch
          />
        </div>
        <div className="col-span-1">
          <SelectGroupAntd
            options={statusList || []}
            setSelectedOption={setSelectedStatus}
            placeholder="Select Status"
            selectedOption={selectedStatus}
            allowClear
            showSearch
          />
        </div>
        <div className="col-span-1">
          <SelectGroupAntd
            options={agentList || []}
            setSelectedOption={setSelectedAgent}
            placeholder="Select User"
            selectedOption={selectedAgent}
            allowClear
            showSearch
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
          <SummaryCard title="Total" value={reportData?.summary.total || 0} />
        </div>
        <div className="col-span-1">
          <SummaryCard title="Won" value={reportData?.summary.won || 0} />
        </div>
        <div className="col-span-1">
          <SummaryCard
            title="Ratio"
            value={`${reportData?.summary.ratio || 0}%`}
          />
        </div>
        <div className="col-span-1">
          <SummaryCard title="Amount" value={reportData?.summary.amount || 0} />
        </div>
      </div>

      <CustomAntdTable
        columns={columns}
        dataSource={reportData?.leads || []}
        loading={isLoading}
        pagination={{
          total: reportData?.leads?.length || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: any) =>
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

export default ManageReports;
