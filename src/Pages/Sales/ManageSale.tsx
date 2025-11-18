import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Select, Space, Table, Tag, Tooltip, DatePicker } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getTagSales,
  deleteTagSale,
} from "../../services/tagSaleService";
import {
  getAffiliatePartners,
} from "../../services/affiliatePartnerService";
import {
  TagSale,
  TagSaleFilters,
  SaleType,
  PaymentStatus,
  VerificationStatus,
  SalesPersonRole,
  AffiliatePartner,
} from "../../types/qr";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

const { RangePicker } = DatePicker;

const saleTypeOptions: Array<{ label: string; value: SaleType | "all" }> = [
  { label: "All types", value: "all" },
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
  { label: "Not Confirmed", value: "not-confirmed" },
];

const paymentStatusOptions: Array<{ label: string; value: PaymentStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const verificationStatusOptions: Array<{ label: string; value: VerificationStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const salesPersonRoleOptions: Array<{ label: string; value: SalesPersonRole | "all" }> = [
  { label: "All roles", value: "all" },
  { label: "Affiliate", value: "Affiliate" },
  { label: "Support Admin", value: "Support Admin" },
  { label: "Admin", value: "Admin" },
  { label: "Super Admin", value: "Super Admin" },
];

interface SaleRow extends TagSale {
  key: string;
}

const formatDate = (date?: string) =>
  date ? dayjs(date).format("DD MMM YYYY, HH:mm") : "—";

const ManageSale = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TagSaleFilters>({
    saleType: "all",
    paymentStatus: "all",
    varificationStatus: "all",
    salesPersonRole: "all",
    affiliatePartnerId: "all",
    page: 1,
    limit: 10,
  });
  const [searchValue, setSearchValue] = useState("");
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [data, setData] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [affiliatePartners, setAffiliatePartners] = useState<AffiliatePartner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  const fetchSales = useCallback(
    async (activeFilters: TagSaleFilters) => {
      setLoading(true);
      try {
        const response = await getTagSales(activeFilters);
        const sales =
          response.sales?.map<SaleRow>((sale) => ({
            ...sale,
            key: sale._id || "",
          })) ?? [];

        setData(sales);
        setTotal(response.pagination?.total ?? sales.length);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load sales";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchSales(filters);
  }, [fetchSales, filters]);

  // Fetch affiliate partners for filter dropdown
  useEffect(() => {
    const fetchPartners = async () => {
      setLoadingPartners(true);
      try {
        const response = await getAffiliatePartners({ status: "active" });
        setAffiliatePartners(response.partners || []);
      } catch (error: unknown) {
        console.error("Failed to load affiliate partners:", error);
        // Don't show error toast, just log it
      } finally {
        setLoadingPartners(false);
      }
    };
    void fetchPartners();
  }, []);

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

  const handleFilterChange = (key: keyof TagSaleFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    debouncedSearch(value.trim());
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
    setFilters((prev) => ({
      ...prev,
      startDate: dates?.[0]?.toISOString(),
      endDate: dates?.[1]?.toISOString(),
      page: 1,
    }));
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

  const handleDelete = async (saleId: string) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return;

    try {
      setLoading(true);
      await deleteTagSale(saleId);
      toast.success("Sale deleted successfully");
      await fetchSales(filters);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete sale";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getSaleTypeColor = (type?: SaleType) => {
    switch (type) {
      case "online":
        return "green";
      case "offline":
        return "blue";
      case "not-confirmed":
        return "orange";
      default:
        return "default";
    }
  };

  const getPaymentStatusColor = (status?: PaymentStatus) => {
    switch (status) {
      case "completed":
        return "green";
      case "pending":
        return "orange";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getVerificationStatusColor = (status?: VerificationStatus) => {
    switch (status) {
      case "completed":
        return "green";
      case "pending":
        return "orange";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<SaleRow> = [
    {
      title: "Tag Code",
      key: "tagCode",
      width: 120,
      render: (_: any, record: SaleRow) => {
        const tag = typeof record.tag === "object" ? record.tag : null;
        return (
          <span className="font-mono font-semibold">
            {tag?.shortCode || "—"}
          </span>
        );
      },
    },
    {
      title: "Sale Date",
      dataIndex: "saleDate",
      key: "saleDate",
      width: 150,
      render: (value?: string) => formatDate(value),
    },
    {
      title: "Sale Type",
      dataIndex: "saleType",
      key: "saleType",
      width: 120,
      render: (type?: SaleType) => (
        <Tag color={getSaleTypeColor(type)}>
          {(type || "not-confirmed").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Sales Person",
      key: "salesPerson",
      width: 180,
      render: (_: any, record: SaleRow) => {
        const person =
          typeof record.SalesPerson === "object" ? record.SalesPerson : null;
        return person?.name || "—";
      },
    },
    {
      title: "Role",
      dataIndex: "salesPersonRole",
      key: "salesPersonRole",
      width: 120,
      render: (role?: SalesPersonRole) => role || "—",
    },
    {
      title: "Owner",
      key: "owner",
      width: 180,
      render: (_: any, record: SaleRow) => {
        const owner = typeof record.owner === "object" ? record.owner : null;
        return owner?.fullName || "—";
      },
    },
    {
      title: "Total Amount",
      dataIndex: "totalSaleAmount",
      key: "totalSaleAmount",
      width: 140,
      render: (value?: number) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          ₹{value?.toLocaleString() ?? 0}
        </span>
      ),
    },
    {
      title: "Sales Person Commission",
      dataIndex: "commisionAmountOfSalesPerson",
      key: "commisionAmountOfSalesPerson",
      width: 180,
      render: (value?: number) => (
        <span className="font-semibold">₹{value?.toLocaleString() ?? 0}</span>
      ),
    },
    {
      title: "Owner Commission",
      dataIndex: "commisionAmountOfOwner",
      key: "commisionAmountOfOwner",
      width: 140,
      render: (value?: number) => (
        <span className="font-semibold">₹{value?.toLocaleString() ?? 0}</span>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 130,
      render: (status?: PaymentStatus) => (
        <Tag color={getPaymentStatusColor(status)}>
          {(status || "pending").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Verification Status",
      dataIndex: "varificationStatus",
      key: "varificationStatus",
      width: 150,
      render: (status?: VerificationStatus) => (
        <Tag color={getVerificationStatusColor(status)}>
          {(status || "pending").toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: any, record: SaleRow) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/sales/${record._id}/view`)}
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title="Edit Sale">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/sales/${record._id}/edit`)}
            >
              Edit
            </Button>
          </Tooltip>
          <Tooltip title="Delete Sale">
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record._id || "")}
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
        title="Manage Sales"
        className="shadow-1 dark:bg-gray-dark dark:text-white"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/sales/add")}
          >
            Add Sale
          </Button>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <Space wrap>
            <Select
              value={filters.saleType ?? "all"}
              options={saleTypeOptions}
              onChange={(value) => handleFilterChange("saleType", value)}
              className="min-w-[150px]"
            />
            <Select
              value={filters.paymentStatus ?? "all"}
              options={paymentStatusOptions}
              onChange={(value) => handleFilterChange("paymentStatus", value)}
              className="min-w-[150px]"
            />
            <Select
              value={filters.varificationStatus ?? "all"}
              options={verificationStatusOptions}
              onChange={(value) => handleFilterChange("varificationStatus", value)}
              className="min-w-[150px]"
            />
            <Select
              value={filters.salesPersonRole ?? "all"}
              options={salesPersonRoleOptions}
              onChange={(value) => handleFilterChange("salesPersonRole", value)}
              className="min-w-[150px]"
            />
            <Select
              value={filters.affiliatePartnerId ?? "all"}
              onChange={(value) => handleFilterChange("affiliatePartnerId", value)}
              className="min-w-[200px]"
              loading={loadingPartners}
              placeholder="Select Affiliate Partner"
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) => {
                const labelText =
                  option?.label !== undefined
                    ? option?.label?.toString().toLowerCase() ?? ""
                    : "";
                return labelText.includes(input.toLowerCase());
              }}
            >
              <Select.Option value="all" label="All Partners">
                All Partners
              </Select.Option>
              {affiliatePartners.map((partner) => (
                <Select.Option
                  key={partner._id}
                  value={partner._id || ""}
                  label={`${partner.name} (${partner.companyName || "N/A"})`}
                >
                  {partner.name} {partner.companyName && `(${partner.companyName})`}
                </Select.Option>
              ))}
            </Select>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              placeholder={["Start Date", "End Date"]}
              className="min-w-[240px]"
            />
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search by tag code, sales person, or owner"
              value={searchValue}
              onChange={handleSearchChange}
              className="min-w-[280px]"
            />
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void fetchSales(filters)}
          >
            Refresh
          </Button>
        </div>
        <Table<SaleRow>
          rowKey="key"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{
            current: filters.page ?? 1,
            pageSize: filters.limit ?? 10,
            total,
            showSizeChanger: true,
            showTotal: (subtotal) => `${subtotal} sales`,
            onChange: (page, pageSize) =>
              handleTableChange({ current: page, pageSize }),
          }}
          className="overflow-auto"
        />
      </Card>
    </div>
  );
};

export default ManageSale;

