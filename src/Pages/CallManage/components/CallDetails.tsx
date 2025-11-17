import React, { memo } from "react";
import { Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import CustomAntdTable from "../../../components/Tables/CustomAntdTable";

const { Search } = Input;

interface CallDetailsProps {
  data: any[];
  loading: boolean;
  onSearch: (value: string) => void;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onTableChange: (pagination: any, pageSize: any) => void;
  searchText: string;
}

const CallDetails: React.FC<CallDetailsProps> = ({
  data,
  loading,
  onSearch,
  pagination,
  onTableChange,
  searchText,
}) => {
  const columns: ColumnsType<any> = [
    {
      title: <span className="min-w-[80px]">Sr. No.</span>,
      key: "srNo",
      minWidth: 80,
      render: (_text, _record, index) => (
        <span>
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "Client Name",
      dataIndex: "clientName",
      key: "clientName",
    },
    {
      title: "Mobile No.",
      dataIndex: "mobileNo",
      key: "mobileNo",
    },
    {
      title: <span className="min-w-[144px]">Call Date Time</span>,
      dataIndex: "callDateTime",
      key: "callDateTime",
      minWidth: 144,
    },
    {
      title: <span className="min-w-[103px]">Duration</span>,
      dataIndex: "duration",
      key: "duration",
      minWidth: 103,
    },
    {
      title: "Call Type",
      dataIndex: "callType",
      key: "callType",
      render: (text: string) => (
        <span
          style={{
            color:
              text === "INCOMING"
                ? "#10b981"
                : text === "MISSED"
                ? "red"
                : "#3b82f6",
          }}
        >
          {text}
        </span>
      ),
    },
  ];

  return (
    <div className="dark:bg-gray-800">
      <div className="mb-4 flex justify-end">
        <Search
          placeholder="Search here"
          onSearch={onSearch}
          value={searchText}
          onChange={(e) => onSearch(e.target.value)}
          style={{ width: 200 }}
          className="h-[51px] dark:text-white"
        />
      </div>
      <CustomAntdTable
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: onTableChange,
          showTotal: (total: number, range: any) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
      <style>{`
        .dark .ant-select-selector {
          background-color: #374151 !important;
          color: #fff !important;
        }
        .dark .ant-select-arrow {
          color: #fff;
        }
        .dark .ant-input-search {
          background-color: #374151;
        }
        .dark .ant-input-search input {
          background-color: #374151;
          color: #fff;
        }
        .ant-input-search input {
          height: 51px;
        }
        .ant-input-search .ant-input-search-button {
          height: 51px;
        }
        .dark
          .ant-input-search
          > .ant-input-group
          > .ant-input-group-addon:last-child
          .ant-input-search-button:not(.ant-btn-primary) {
          color: white;
        }
        .dark .ant-input::placeholder {
          color: white;
        }
      `}</style>
    </div>
  );
};

export default memo(CallDetails);
