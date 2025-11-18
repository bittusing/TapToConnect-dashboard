import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Card, DatePicker, Select, Space, Table, Tag, Statistic, Row, Col } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  DownloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  getTagSales,
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

type DateFilterType = "daily" | "yesterday" | "monthly" | "yearly" | "all" | "custom";

interface SaleRow extends TagSale {
  key: string;
}

const formatDate = (date?: string) =>
  date ? dayjs(date).format("DD MMM YYYY, HH:mm") : "—";

const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return "₹0";
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const SalesReport = () => {
  const navigate = useNavigate();
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("all");
  const [customDateRange, setCustomDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>("all");
  const [data, setData] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [affiliatePartners, setAffiliatePartners] = useState<AffiliatePartner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  // Calculate date range based on filter type
  const getDateRange = useCallback((filterType: DateFilterType): [string | undefined, string | undefined] => {
    const now = dayjs();
    let startDate: Dayjs | undefined;
    let endDate: Dayjs | undefined;

    switch (filterType) {
      case "daily":
        startDate = now.startOf("day");
        endDate = now.endOf("day");
        break;
      case "yesterday":
        const yesterday = now.subtract(1, "day");
        startDate = yesterday.startOf("day");
        endDate = yesterday.endOf("day");
        break;
      case "monthly":
        startDate = now.startOf("month");
        endDate = now.endOf("month");
        break;
      case "yearly":
        startDate = now.startOf("year");
        endDate = now.endOf("year");
        break;
      case "custom":
        if (customDateRange && customDateRange[0] && customDateRange[1]) {
          startDate = customDateRange[0].startOf("day");
          endDate = customDateRange[1].endOf("day");
        }
        break;
      case "all":
      default:
        return [undefined, undefined];
    }

    return [
      startDate ? startDate.toISOString() : undefined,
      endDate ? endDate.toISOString() : undefined,
    ];
  }, [customDateRange]);

  const fetchSales = useCallback(
    async () => {
      setLoading(true);
      try {
        const [startDate, endDate] = getDateRange(dateFilterType);
        
        const filters: TagSaleFilters = {
          affiliatePartnerId: selectedAffiliate !== "all" ? selectedAffiliate : undefined,
          startDate,
          endDate,
          page: 1,
          limit: 1000, // Get all records for report
        };

        const response = await getTagSales(filters);
        const sales =
          response.sales?.map<SaleRow>((sale) => ({
            ...sale,
            key: sale._id || "",
          })) ?? [];
        
        setData(sales);
        setTotal(response.pagination?.total ?? sales.length);
      } catch (error) {
        console.error("Error fetching sales:", error);
        toast.error("Failed to fetch sales report");
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [dateFilterType, selectedAffiliate, getDateRange]
  );

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Fetch affiliate partners
  useEffect(() => {
    const fetchPartners = async () => {
      setLoadingPartners(true);
      try {
        const response = await getAffiliatePartners({ page: 1, limit: 1000 });
        setAffiliatePartners(response.partners || []);
      } catch (error) {
        console.error("Error fetching partners:", error);
        toast.error("Failed to fetch affiliate partners");
      } finally {
        setLoadingPartners(false);
      }
    };
    fetchPartners();
  }, []);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const stats = {
      totalSales: data.length,
      totalRevenue: 0,
      totalCommissionSalesPerson: 0,
      totalCommissionOwner: 0,
      totalCost: 0,
      onlineSales: 0,
      offlineSales: 0,
      pendingPayments: 0,
      completedPayments: 0,
    };

    data.forEach((sale) => {
      stats.totalRevenue += sale.totalSaleAmount || 0;
      stats.totalCommissionSalesPerson += sale.commisionAmountOfSalesPerson || 0;
      stats.totalCommissionOwner += sale.commisionAmountOfOwner || 0;
      stats.totalCost += sale.castAmountOfProductAndServices || 0;
      
      if (sale.saleType === "online") stats.onlineSales++;
      if (sale.saleType === "offline") stats.offlineSales++;
      
      if (sale.paymentStatus === "pending") stats.pendingPayments++;
      if (sale.paymentStatus === "completed") stats.completedPayments++;
    });

    return stats;
  }, [data]);

  const columns: ColumnsType<SaleRow> = [
    {
      title: "Date",
      dataIndex: "saleDate",
      key: "saleDate",
      render: (date: string) => formatDate(date),
      sorter: (a, b) => {
        const dateA = a.saleDate ? dayjs(a.saleDate).unix() : 0;
        const dateB = b.saleDate ? dayjs(b.saleDate).unix() : 0;
        return dateA - dateB;
      },
    },
    {
      title: "Tag Code",
      key: "tagCode",
      render: (_, record) => {
        const tag = record.tag;
        if (typeof tag === "object" && tag?.shortCode) {
          return <span className="font-mono">{tag.shortCode}</span>;
        }
        return "—";
      },
    },
    {
      title: "Owner",
      key: "owner",
      render: (_, record) => {
        const owner = record.owner;
        if (typeof owner === "object" && owner) {
          return (
            <div>
              <div className="font-medium">{owner.fullName || "—"}</div>
              <div className="text-xs text-gray-500">{owner.phone || ""}</div>
            </div>
          );
        }
        return "—";
      },
    },
    {
      title: "Sales Person",
      key: "salesPerson",
      render: (_, record) => {
        const salesPerson = record.SalesPerson;
        if (typeof salesPerson === "object" && salesPerson) {
          return (
            <div>
              <div className="font-medium">{salesPerson.name || "—"}</div>
              <div className="text-xs text-gray-500">{salesPerson.email || ""}</div>
            </div>
          );
        }
        return "—";
      },
    },
    {
      title: "Sale Type",
      dataIndex: "saleType",
      key: "saleType",
      render: (type: SaleType) => {
        const colorMap: Record<SaleType, string> = {
          online: "blue",
          offline: "green",
          "not-confirmed": "orange",
        };
        return (
          <Tag color={colorMap[type] || "default"}>
            {type?.toUpperCase() || "—"}
          </Tag>
        );
      },
      filters: [
        { text: "Online", value: "online" },
        { text: "Offline", value: "offline" },
        { text: "Not Confirmed", value: "not-confirmed" },
      ],
      onFilter: (value, record) => record.saleType === value,
    },
    {
      title: "Amount",
      dataIndex: "totalSaleAmount",
      key: "totalSaleAmount",
      render: (amount: number) => formatCurrency(amount),
      sorter: (a, b) => (a.totalSaleAmount || 0) - (b.totalSaleAmount || 0),
    },
    {
      title: "Sales Person Commission",
      dataIndex: "commisionAmountOfSalesPerson",
      key: "commisionAmountOfSalesPerson",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Owner Commission",
      dataIndex: "commisionAmountOfOwner",
      key: "commisionAmountOfOwner",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: PaymentStatus) => {
        const colorMap: Record<PaymentStatus, string> = {
          pending: "orange",
          completed: "green",
          cancelled: "red",
        };
        return (
          <Tag color={colorMap[status] || "default"}>
            {status?.toUpperCase() || "—"}
          </Tag>
        );
      },
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Completed", value: "completed" },
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/sales/${record._id}/view`)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  const dateFilterOptions = [
    { label: "All Time", value: "all" },
    { label: "Today", value: "daily" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This Month", value: "monthly" },
    { label: "This Year", value: "yearly" },
    { label: "Custom Range", value: "custom" },
  ];

  const handleDateFilterChange = (value: DateFilterType) => {
    setDateFilterType(value);
    if (value !== "custom") {
      setCustomDateRange(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Sales Report
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comprehensive sales analytics and reporting
          </p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchSales}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            icon={<DownloadOutlined />}
            type="primary"
            onClick={() => {
              // TODO: Implement export functionality
              toast.info("Export functionality coming soon");
            }}
          >
            Export
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-1 dark:bg-gray-dark dark:text-white">
        <Space direction="vertical" size="middle" className="w-full">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date Filter
                </label>
                <Select
                  value={dateFilterType}
                  onChange={handleDateFilterChange}
                  className="w-full"
                  options={dateFilterOptions}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              {dateFilterType === "custom" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Custom Date Range
                  </label>
                  <RangePicker
                    value={customDateRange}
                    onChange={(dates) => setCustomDateRange(dates)}
                    className="w-full"
                    format="DD/MM/YYYY"
                  />
                </div>
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Affiliate Partner
                </label>
                <Select
                  value={selectedAffiliate}
                  onChange={setSelectedAffiliate}
                  className="w-full"
                  loading={loadingPartners}
                  placeholder="All Partners"
                  showSearch
                  optionFilterProp="label"
                  options={[
                    { label: "All Partners", value: "all" },
                    ...affiliatePartners.map((partner) => ({
                      label: `${partner.name} (${partner.companyName || partner.company || ""})`,
                      value: partner._id || "",
                    })),
                  ]}
                />
              </div>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Total Sales"
              value={summaryStats.totalSales}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Total Revenue"
              value={summaryStats.totalRevenue}
              prefix="₹"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Sales Person Commission"
              value={summaryStats.totalCommissionSalesPerson}
              prefix="₹"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Owner Commission"
              value={summaryStats.totalCommissionOwner}
              prefix="₹"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Online Sales"
              value={summaryStats.onlineSales}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Offline Sales"
              value={summaryStats.offlineSales}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Pending Payments"
              value={summaryStats.pendingPayments}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Completed Payments"
              value={summaryStats.completedPayments}
            />
          </Card>
        </Col>
      </Row>

      {/* Sales Table */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <span>Sales Details</span>
            <span className="text-sm font-normal text-gray-500">
              {total} {total === 1 ? "sale" : "sales"} found
            </span>
          </div>
        }
        className="shadow-1 dark:bg-gray-dark dark:text-white"
      >
        {loading ? (
          <MiniLoader />
        ) : (
          <Table<SaleRow>
            rowKey="key"
            columns={columns}
            dataSource={data}
            pagination={{
              total,
              pageSize: 50,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} sales`,
            }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>
    </div>
  );
};

export default SalesReport;

