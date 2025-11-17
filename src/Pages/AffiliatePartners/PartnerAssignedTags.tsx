import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Select, Space, Table, Tag, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPartnerAssignedTags,
  getAffiliatePartnerById,
} from "../../services/affiliatePartnerService";
import { TagItem, TagListFilters, TagStatus } from "../../types/qr";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

const statusOptions: Array<{ label: string; value: TagStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Generated", value: "generated" },
  { label: "Assigned", value: "assigned" },
  { label: "Activated", value: "activated" },
  { label: "Archived", value: "archived" },
];

interface TagRow extends TagItem {
  key: string;
}

const formatDate = (date?: string) =>
  date ? dayjs(date).format("DD MMM YYYY, HH:mm") : "—";

const PartnerAssignedTags = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [filters, setFilters] = useState<TagListFilters>({
    status: "all",
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [data, setData] = useState<TagRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [partnerName, setPartnerName] = useState<string>("");

  const fetchPartnerInfo = useCallback(async () => {
    if (!id) return;
    try {
      const partner = await getAffiliatePartnerById(id);
      setPartnerName(partner.name || "Partner");
    } catch (error) {
      console.error("Failed to load partner info:", error);
    }
  }, [id]);

  const fetchTags = useCallback(
    async (activeFilters: TagListFilters) => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await getPartnerAssignedTags(id, activeFilters);
        const tags =
          response.tags?.map<TagRow>((tag) => ({
            ...tag,
            key: tag.tagId ?? tag.shortCode,
          })) ?? [];

        setData(tags);
        setTotal(response.pagination?.total ?? tags.length);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load tags";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    void fetchPartnerInfo();
  }, [fetchPartnerInfo]);

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

  const getStatusColor = (status?: TagStatus) => {
    switch (status) {
      case "activated":
        return "green";
      case "assigned":
        return "blue";
      case "generated":
        return "default";
      case "archived":
        return "red";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<TagRow> = [
    {
      title: "Tag Code",
      dataIndex: "shortCode",
      key: "shortCode",
      width: 120,
      render: (value?: string) => (
        <span className="font-mono font-semibold">{value || "—"}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status?: TagStatus) => (
        <Tag color={getStatusColor(status)}>
          {(status || "generated").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Batch",
      dataIndex: "batchName",
      key: "batchName",
      width: 150,
      render: (value?: string) => value || "—",
    },
    {
      title: "Assigned To",
      dataIndex: ["ownerAssignedTo", "fullName"],
      key: "assignedTo",
      width: 180,
      render: (_: any, record: TagRow) =>
        record.ownerAssignedTo?.fullName || "—",
    },
    {
      title: "Phone",
      dataIndex: ["ownerAssignedTo", "phone"],
      key: "phone",
      width: 140,
      render: (_: any, record: TagRow) =>
        record.ownerAssignedTo?.phone || "—",
    },
    {
      title: "Vehicle",
      key: "vehicle",
      width: 180,
      render: (_: any, record: TagRow) => {
        const vehicle = record.ownerAssignedTo?.vehicle;
        if (!vehicle?.number) return "—";
        return `${vehicle.number} (${vehicle.type || "N/A"})`;
      },
    },
    {
      title: "City",
      dataIndex: ["ownerAssignedTo", "city"],
      key: "city",
      width: 120,
      render: (_: any, record: TagRow) =>
        record.ownerAssignedTo?.city || "—",
    },
    {
      title: "Assigned At",
      dataIndex: ["ownerAssignedTo", "createdAt"],
      key: "assignedAt",
      width: 180,
      render: (_: any, record: TagRow) =>
        formatDate(record.ownerAssignedTo?.createdAt),
    },
    {
      title: "Activated At",
      dataIndex: "activatedAt",
      key: "activatedAt",
      width: 180,
      render: (value?: string) => formatDate(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
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
        </Space>
      ),
    },
  ];

  if (loading && data.length === 0) return <MiniLoader />;

  return (
    <div className="space-y-6">
      <Card
        title={
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/affiliate-partners")}
              type="text"
            />
            <span>Assigned QR Tags - {partnerName}</span>
          </div>
        }
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
              placeholder="Search by tag code, name, phone, or vehicle"
              value={searchValue}
              onChange={handleSearchChange}
              className="min-w-[280px]"
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
          scroll={{ x: 1400 }}
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
    </div>
  );
};

export default PartnerAssignedTags;

