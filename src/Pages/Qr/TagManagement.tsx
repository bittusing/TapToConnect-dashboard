import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Select, Space, Table, Tag, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  DownloadOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
  getAdminTags,
  updateTagStatus,
} from "../../services/qrAdminService";
import { TagItem, TagListFilters, TagStatus } from "../../types/qr";
import ActivateTagModal from "../../components/Qr/ActivateTagModal";

const statusOptions: Array<{ label: string; value: TagStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Generated", value: "generated" },
  { label: "Assigned", value: "assigned" },
  { label: "Activated", value: "activated" },
  { label: "Archived", value: "archived" },
];

interface TagRow extends TagItem {
  key: string;
  role?: string;
}

const formatDate = (date?: string) =>
  date ? dayjs(date).format("DD MMM YYYY, HH:mm") : "—";

const TagManagement = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TagListFilters>({
    status: "all",
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [data, setData] = useState<TagRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [selectedTagForActivation, setSelectedTagForActivation] = useState<string | null>(null);

  const fetchTags = useCallback(
    async (activeFilters: TagListFilters) => {
      setLoading(true);
      try {
        const response = await getAdminTags(activeFilters);
        // console.log("TagManagement - Response received:", response);
        // console.log("TagManagement - Tags array:", response.tags);
        // console.log("TagManagement - Tags count:", response.tags?.length);
        
        const tags =
          response.tags?.map<TagRow>((tag) => ({
            ...tag,
            key: tag.tagId ?? tag.shortCode,
          })) ?? [];

        // console.log("TagManagement - Mapped tags:", tags);
        // console.log("TagManagement - Setting data with", tags.length, "items");
        
        setData(tags);
        setTotal(response.pagination?.total ?? tags.length);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load tags";
        toast.error(message);
        console.error("TagManagement - Error:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchTags(filters);
  }, [fetchTags, filters]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFilters((prev) => ({
          ...prev,
          search: value || undefined,
          page: 1,
        }));
      }, 400),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleStatusChange = (value: TagStatus | "all") => {
    setFilters((prev) => ({
      ...prev,
      status: value,
      page: 1,
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    debouncedSearch(value.trim());
  };

  const handleTableChange = (pagination: {
    current?: number;
    pageSize?: number;
  }) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current ?? prev.page ?? 1,
      limit: pagination.pageSize ?? prev.limit ?? 10,
    }));
  };

  const handleStatusUpdate = async (
    shortCode: string,
    status: TagStatus
  ) => {
    try {
      setLoading(true);
      await updateTagStatus(shortCode, { status });
      toast.success("Tag status updated");
      await fetchTags(filters);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unable to update tag status";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<TagRow> = [
    // {
    //   title: "Tag ID",
    //   dataIndex: "tagId",
    //   key: "tagId",
    //   width: 160,
    //   render: (value, record) => value ?? `— (${record.shortCode})`,
    // },
    {
      title: "Short Code",
      dataIndex: "shortCode",
      key: "shortCode",
      width: 140,
    },
    // {
    //   title: "Short URL",
    //   dataIndex: "shortUrl",
    //   key: "shortUrl",
    //   render: (url?: string) =>
    //     url ? (
    //       <a href={url} target="_blank" rel="noopener noreferrer">
    //         {url}
    //       </a>
    //     ) : (
    //       "—"
    //     ),
    // },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: TagStatus, record) => (
        <Select
          size="small"
          value={status}
          className="w-full"
          disabled={true}
          onChange={(nextStatus) =>
            void handleStatusUpdate(record.shortCode, nextStatus)
          }
          options={statusOptions
            .filter((option) => option.value !== "all")
            .map((option) => ({
              label: option.label,
              value: option.value,
            }))}
        />
      ),
    },
    {
      title: "Batch",
      dataIndex: "batchName",
      key: "batchName",
      width: 180,
      render: (value?: string) => value ?? "—",
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 240,
      render: (assigned: TagRow["assignedTo"]) => {
        if (!assigned) return "—";
        const lines = [
          assigned.name,
          assigned.phone,
          assigned.role ? `Role: ${assigned.role}` : "",
        ].filter(Boolean);
        return lines.length ? lines.join(" • ") : "—";
      },
    },
    {
      title: "Metadata",
      dataIndex: "metadata",
      key: "metadata",
      width: 180,
      render: (metadata: TagRow["metadata"]) => {
        if (!metadata || typeof metadata !== "object") return "—";
        const entries = Object.entries(metadata)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join(", ");
        return entries || "—";
      },
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200,
      render: (value?: string) => formatDate(value),
    },
    // {
    //   title: "Activated",
    //   dataIndex: "activatedAt",
    //   key: "activatedAt",
    //   width: 200,
    //   render: (value?: string) => formatDate(value),
    // },
    // {
    //   title: "QR Code",
    //   dataIndex: "qrUrl",
    //   key: "qrUrl",
    //   width: 120,
    //   render: (url?: string) =>
    //     url ? (
    //       <Tooltip title="Open QR image">
    //         <Button
    //           icon={<DownloadOutlined />}
    //           href={url}
    //           target="_blank"
    //           rel="noopener noreferrer"
    //           size="small"
    //         >
    //           View
    //         </Button>
    //       </Tooltip>
    //     ) : (
    //       <Tag color="orange">Pending</Tag>
    //     ),
    // },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_: any, record: TagRow) => (
        <Space>
          <Tooltip title="View Tag Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/qr/tags/${record.shortCode}/view`)}
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title="Edit Tag">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/qr/tags/${record.shortCode}/edit`)}
            >
              Edit
            </Button>
          </Tooltip>
          {record.status !== "activated" && (
            <Tooltip title="Activate Tag">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => {
                  setSelectedTagForActivation(record.shortCode);
                  setActivateModalOpen(true);
                }}
              >
                Activate
              </Button>
            </Tooltip>
          )}
          {record.status === "activated" && (
            <Tag color="green">Activated</Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Tag Inventory"
        className="shadow-1 dark:bg-gray-dark dark:text-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <Space wrap>
            <Select
              value={filters.status ?? "all"}
              options={statusOptions}
              onChange={handleStatusChange}
              className="min-w-[180px]"
            />
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search by short code, batch or owner"
              value={searchValue}
              onChange={handleSearchChange}
              className="min-w-[240px]"
            />
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void fetchTags(filters)}
          >
            Refresh
          </Button>
        </div>
        <Table<TagRow>
          rowKey="key"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 960 }}
          pagination={{
            current: filters.page ?? 1,
            pageSize: filters.limit ?? 10,
            total,
            showSizeChanger: true,
            showTotal: (subtotal) => `${subtotal} tags`,
            onChange: (page, pageSize) =>
              handleTableChange({ current: page, pageSize }),
          }}
          className="overflow-auto"
        />
      </Card>

      {selectedTagForActivation && (
        <ActivateTagModal
          open={activateModalOpen}
          onClose={() => {
            setActivateModalOpen(false);
            setSelectedTagForActivation(null);
          }}
          shortCode={selectedTagForActivation}
          onSuccess={() => {
            // Refresh tags after successful activation
            void fetchTags(filters);
          }}
        />
      )}
    </div>
  );
};

export default TagManagement;

