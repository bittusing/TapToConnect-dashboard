import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Select, Space, Table, Tag, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getAffiliatePartners,
  deleteAffiliatePartner,
} from "../../services/affiliatePartnerService";
import {
  AffiliatePartner,
  AffiliatePartnerFilters,
} from "../../types/qr";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

const statusOptions: Array<{
  label: string;
  value: "active" | "inactive" | "suspended" | "all";
}> = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

interface PartnerRow extends AffiliatePartner {
  key: string;
}

const formatDate = (date?: string) =>
  date ? dayjs(date).format("DD MMM YYYY, HH:mm") : "—";

const AllAffiliatePartners = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AffiliatePartnerFilters>({
    status: "all",
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [data, setData] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number>(0);

  const fetchPartners = useCallback(
    async (activeFilters: AffiliatePartnerFilters) => {
      setLoading(true);
      try {
        const response = await getAffiliatePartners(activeFilters);
        const partners =
          response.partners?.map<PartnerRow>((partner) => ({
            ...partner,
            key: partner._id || partner.partnerId || "",
          })) ?? [];

        setData(partners);
        setTotal(response.pagination?.total ?? partners.length);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load partners";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchPartners(filters);
  }, [fetchPartners, filters]);

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

  const handleStatusChange = (value: "active" | "inactive" | "suspended" | "all") => {
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

  const handleDelete = async (partnerId: string) => {
    if (!window.confirm("Are you sure you want to delete this partner?")) return;

    try {
      setLoading(true);
      await deleteAffiliatePartner(partnerId);
      toast.success("Partner deleted successfully");
      await fetchPartners(filters);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete partner";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "default";
      case "suspended":
        return "red";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<PartnerRow> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 140,
    },
    // {
    //   title: "Company",
    //   dataIndex: "company",
    //   key: "company",
    //   width: 180,
    //   render: (value?: string) => value || "—",
    // },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status?: string) => (
        <Tag color={getStatusColor(status)}>
          {(status || "inactive").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Cards Activated",
      dataIndex: "totalCardsActivated",
      key: "totalCardsActivated",
      width: 140,
      render: (_: any, record: PartnerRow) => (
        <span className="font-semibold">
          {record.cardsActivated ?? record.totalCardsActivated ?? 0}
        </span>
      ),
    },
    {
      title: "Sales Amount",
      dataIndex: "totalSales",
      key: "totalSales",
      width: 140,
      render: (_: any, record: PartnerRow) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ₹{(record.totalSalesAmount ?? record.totalSales ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Commission Earned",
      dataIndex: "totalCommissionEarned",
      key: "totalCommissionEarned",
      width: 150,
      render: (value?: number) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          ₹{value?.toLocaleString() ?? 0}
        </span>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value?: string) => formatDate(value),
    },
    {
      title: "Actions",
      key: "actions",
      width: 250,
      fixed: "right",
      render: (_: any, record: PartnerRow) => (
        <Space>
          <Tooltip title="View Assigned Tags">
            <Button
              icon={<QrcodeOutlined />}
              size="small"
              onClick={() =>
                navigate(`/affiliate-partners/${record._id || record.partnerId}/tags`)
              }
            >
              Tags
            </Button>
          </Tooltip>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() =>
                navigate(`/affiliate-partners/${record._id || record.partnerId}/view`)
              }
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title="Edit Partner">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() =>
                navigate(`/affiliate-partners/${record._id || record.partnerId}/edit`)
              }
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="Delete Partner">
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record._id || record.partnerId || "")}
            >
              Delete
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
        title="Affiliate Partners"
        className="shadow-1 dark:bg-gray-dark dark:text-white"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/affiliate-partners/add")}
          >
            Add Partner
          </Button>
        }
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
              placeholder="Search by name, email, phone, or company"
              value={searchValue}
              onChange={handleSearchChange}
              className="min-w-[280px]"
            />
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void fetchPartners(filters)}
          >
            Refresh
          </Button>
        </div>
        <Table<PartnerRow>
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
            showTotal: (subtotal) => `${subtotal} partners`,
            onChange: (page, pageSize) =>
              handleTableChange({ current: page, pageSize }),
          }}
          className="overflow-auto"
        />
      </Card>
    </div>
  );
};

export default AllAffiliatePartners;

