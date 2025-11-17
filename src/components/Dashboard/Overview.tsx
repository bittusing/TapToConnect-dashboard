import { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Space,
  Table,
  Tag,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { FaQrcode, FaUserShield, FaUsers } from "react-icons/fa";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { RiShoppingBag3Line, RiArrowUpCircleLine } from "react-icons/ri";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import dayjs from "dayjs";

import { useQrDashboard } from "../../hooks/useQrDashboard";
import MiniLoader from "../CommonUI/Loader/MiniLoader";
import {
  AdminDashboardSummary,
  DashboardActivityItem,
  DashboardAffiliateLeader,
  DashboardSaleRecord,
  DashboardTrendPoint,
  PaymentStatus,
  SaleType,
} from "../../types/qr";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor: string;
}

interface ActivityTableItem extends DashboardActivityItem {
  key: string;
}

const formatCount = (value?: number) => (value ?? 0).toLocaleString();
const formatCurrency = (value?: number) =>
  typeof value === "number" ? `₹${value.toLocaleString()}` : "₹0";

const buildActivityRows = (
  items?: DashboardActivityItem[]
): ActivityTableItem[] =>
  items?.map((item, index) => ({
    ...item,
    key: `${item.shortCode ?? "activity"}-${item.occurredAt ?? index}`,
  })) ?? [];

const formatDateTime = (value?: string) =>
  value ? dayjs(value).format("DD MMM YYYY, HH:mm") : "—";

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

interface AffiliateTableItem extends DashboardAffiliateLeader {
  key: string;
}

interface SaleTableItem extends DashboardSaleRecord {
  key: string;
}

const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState<boolean>(
    () => document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
};

const TrendChart = ({ data }: { data?: DashboardTrendPoint[] }) => {
  const isDark = useIsDarkMode();

  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Empty description="No trend data yet" />
      </div>
    );
  }

  const categories = data.map((point) => point.label);
  const series = [
    {
      name: "Tags Generated",
      data: data.map((point) => point.tagsGenerated ?? 0),
    },
    {
      name: "Tags Activated",
      data: data.map((point) => point.tagsActivated ?? 0),
    },
  ];

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 320,
      type: "area",
      toolbar: { show: false },
      background: "transparent",
      foreColor: isDark ? "#CBD5F5" : "#374151",
    },
    colors: ["#6366F1", "#10B981"],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      gradient: {
        opacityFrom: isDark ? 0.4 : 0.7,
        opacityTo: 0.1,
      },
    },
    dataLabels: { enabled: false },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: {
        colors: isDark ? "#E5E7EB" : undefined,
      },
    },
    grid: {
      borderColor: isDark ? "#2D3748" : "#E5E7EB",
      strokeDashArray: 4,
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: isDark ? "#CBD5F5" : "#6B7280",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#CBD5F5" : "#6B7280",
        },
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="area"
      height={320}
    />
  );
};

const SalesChannelChart = ({
  channels,
}: {
  channels?: AdminDashboardSummary["salesChannels"];
}) => {
  const isDark = useIsDarkMode();

  if (!channels?.length) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Empty description="No sales channel data yet" />
      </div>
    );
  }

  const labels = channels.map((channel) => channel.label);
  const series = channels.map(
    (channel) => channel.amount ?? channel.value ?? 0
  );

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Satoshi, sans-serif",
    },
    labels,
    legend: {
      position: "bottom",
      labels: { colors: isDark ? "#E5E7EB" : undefined },
    },
    colors: ["#6366F1", "#0EA5E9", "#F97316"],
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrency(value as number),
      },
      theme: isDark ? "dark" : "light",
    },
    stroke: {
      colors: [isDark ? "#1F2937" : "#fff"],
    },
  };

  return (
    <div>
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={300}
      />
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {channels.map((channel) => (
          <div
            key={channel.label}
            className="rounded border border-gray-100 p-3 dark:border-gray-700"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {channel.label}
            </p>
            <p className="text-lg font-semibold text-dark dark:text-white">
              {formatCurrency(channel.amount)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatCount(channel.value)} sales
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  accentColor,
}: StatCardProps) => {
  return (
    <Card className="h-full shadow-1 dark:bg-gray-dark dark:text-white">
      <Space align="start" size="large">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full text-xl text-white"
          style={{ background: accentColor }}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-semibold text-dark dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </Space>
    </Card>
  );
};

const activityColumns: ColumnsType<ActivityTableItem> = [
  {
    title: "When",
    dataIndex: "occurredAt",
    key: "occurredAt",
    width: 200,
    render: (value?: string) =>
      value ? dayjs(value).format("DD MMM YYYY, HH:mm") : "—",
  },
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
    render: (value?: string) => value ?? "—",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    render: (value?: string) => value ?? "—",
  },
  {
    title: "Tag",
    dataIndex: "shortCode",
    key: "shortCode",
    width: 120,
    render: (value?: string) =>
      value ? <Tag color="blue">{value}</Tag> : "—",
  },
];

const affiliateColumns: ColumnsType<AffiliateTableItem> = [
  {
    title: "Affiliate Partner",
    dataIndex: "name",
    key: "name",
    render: (value: string, record) => (
      <div>
        <p className="font-semibold text-dark dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tags: {formatCount(record.activatedTags)} /{" "}
          {formatCount(record.totalTags)}
        </p>
      </div>
    ),
  },
  {
    title: "Conversion",
    dataIndex: "conversionRate",
    key: "conversionRate",
    width: 120,
    render: (value?: number) => (value !== undefined ? `${value}%` : "—"),
  },
  {
    title: "Sales Amount",
    dataIndex: "salesAmount",
    key: "salesAmount",
    width: 150,
    render: (value?: number) => (
      <span className="font-semibold">{formatCurrency(value)}</span>
    ),
  },
  {
    title: "Commission",
    dataIndex: "commissionAmount",
    key: "commissionAmount",
    width: 150,
    render: (value?: number) => formatCurrency(value),
  },
];

const recentSalesColumns: ColumnsType<SaleTableItem> = [
  {
    title: "Sale ID",
    dataIndex: "saleId",
    key: "saleId",
    width: 130,
    render: (value?: string) => value ?? "—",
  },
  {
    title: "Tag",
    dataIndex: "shortCode",
    key: "shortCode",
    width: 120,
    render: (value?: string) =>
      value ? <Tag color="blue">{value}</Tag> : "—",
  },
  {
    title: "Buyer",
    dataIndex: "buyerName",
    key: "buyerName",
  },
  {
    title: "Affiliate",
    dataIndex: "affiliateName",
    key: "affiliateName",
  },
  {
    title: "Type",
    dataIndex: "saleType",
    key: "saleType",
    width: 120,
    render: (value?: SaleType) =>
      value ? (
        <Tag color={value === "online" ? "green" : "purple"}>
          {value.toUpperCase()}
        </Tag>
      ) : (
        "—"
      ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    width: 140,
    render: (value?: number) => (
      <span className="font-semibold text-dark dark:text-white">
        {formatCurrency(value)}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 130,
    render: (value?: PaymentStatus) =>
      value ? <Tag color={getPaymentStatusColor(value)}>{value.toUpperCase()}</Tag> : "—",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    width: 180,
    render: (value?: string) => formatDateTime(value),
  },
];

const Overview = () => {
  const { summary, loading, error, refresh } = useQrDashboard();

  const cards = useMemo(() => {
    const totals = summary?.totals;
    const sales = totals?.sales;

    return [
      {
        title: "Total Tags",
        value: formatCount(totals?.tags?.total),
        subtitle: "Across all states",
        icon: <FaQrcode />,
        accentColor: "#6366F1",
      },
      {
        title: "Activated Tags",
        value: formatCount(totals?.tags?.activated),
        subtitle: `${formatCount(totals?.tags?.assigned)} assigned`,
        icon: <FaUsers />,
        accentColor: "#10B981",
      },
      {
        title: "Pending Activations",
        value: formatCount(totals?.activations?.pending),
        subtitle: `${formatCount(
          totals?.activations?.completed
        )} completed`,
        icon: <RiArrowUpCircleLine />,
        accentColor: "#EAB308",
      },
      {
        title: "Revenue Today",
        value: formatCurrency(sales?.revenueToday),
        subtitle: `Yesterday ${formatCurrency(sales?.revenueYesterday)}`,
        icon: <HiOutlineCurrencyRupee />,
        accentColor: "#F59E0B",
      },
      {
        title: "Total Sales",
        value: formatCount(sales?.totalSales),
        subtitle: `${formatCurrency(sales?.totalRevenue)} revenue`,
        icon: <RiShoppingBag3Line />,
        accentColor: "#D946EF",
      },
      {
        title: "Pending Payments",
        value: formatCount(sales?.pendingPayments),
        subtitle: `${formatCount(sales?.affiliateSales)} affiliate sales`,
        icon: <FaUserShield />,
        accentColor: "#0EA5E9",
      },
    ];
  }, [summary]);

  const activationsRows = useMemo(
    () => buildActivityRows(summary?.recentActivations),
    [summary?.recentActivations]
  );
  const affiliateRows = useMemo(
    () =>
      summary?.affiliateLeaders?.map((leader, index) => ({
        ...leader,
        key: leader.partnerId ?? `affiliate-${index}`,
      })) ?? [],
    [summary?.affiliateLeaders]
  );
  const salesRows = useMemo(
    () =>
      summary?.recentSales?.map((sale, index) => ({
        ...sale,
        key: sale.saleId ?? `${sale.shortCode ?? "sale"}-${index}`,
      })) ?? [],
    [summary?.recentSales]
  );
  const tagHealth = summary?.tagHealth;
  const salesTotals = summary?.totals?.sales;
  const totalSalesCount = salesTotals?.totalSales ?? 0;
  const onlineShare = totalSalesCount
    ? Math.round(((salesTotals?.onlineSales ?? 0) / totalSalesCount) * 100)
    : 0;
  const offlineShare = totalSalesCount
    ? Math.round(((salesTotals?.offlineSales ?? 0) / totalSalesCount) * 100)
    : 0;
  const affiliateShare = totalSalesCount
    ? Math.round(((salesTotals?.affiliateSales ?? 0) / totalSalesCount) * 100)
    : 0;
  const activationBase =
    (tagHealth?.activatedToday ?? 0) + (tagHealth?.pendingActivation ?? 0);
  const activationPercent = activationBase
    ? Math.round(((tagHealth?.activatedToday ?? 0) / activationBase) * 100)
    : 100;

  if (loading) {
    return <MiniLoader />;
  }

  return (
    <Space direction="vertical" size="large" className="w-full">
      {error && (
        <Alert
          type="error"
          showIcon
          message="Unable to load dashboard data"
          description={error}
          action={
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => void refresh()}
            >
              Retry
            </Button>
          }
        />
      )}

      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col key={card.title} xs={24} sm={12} xl={6}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Tag Health Snapshot"
            className="shadow-1 dark:bg-gray-dark dark:text-white"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generated Today
                </p>
                <p className="text-2xl font-semibold text-dark dark:text-white">
                  {formatCount(tagHealth?.generatedToday)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Assigned Today
                </p>
                <p className="text-2xl font-semibold text-dark dark:text-white">
                  {formatCount(tagHealth?.assignedToday)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Activated Today
                </p>
                <p className="text-2xl font-semibold text-dark dark:text-white">
                  {formatCount(tagHealth?.activatedToday)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pending Activation
                </p>
                <p className="text-2xl font-semibold text-dark dark:text-white">
                  {formatCount(tagHealth?.pendingActivation)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Activation completion today
              </p>
              <Progress
                percent={activationPercent}
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Sales Performance"
            className="shadow-1 dark:bg-gray-dark dark:text-white"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-semibold text-dark dark:text-white">
                  {formatCurrency(salesTotals?.totalRevenue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Average Order
                </p>
                <p className="text-2xl font-semibold text-dark dark:text-white">
                  {formatCurrency(salesTotals?.averageOrderValue)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Revenue Today
                </p>
                <p className="text-2xl font-semibold text-dark dark:text-white">
                  {formatCurrency(salesTotals?.revenueToday)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Yesterday {formatCurrency(salesTotals?.revenueYesterday)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Online Sales
                </p>
                <p className="text-2xl font-semibold text-dark dark:text-white">
                  {formatCount(salesTotals?.onlineSales)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Offline Sales
                </p>
                <p className="text-2xl font-semibold text-dark dark:text-white">
                  {formatCount(salesTotals?.offlineSales)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sales Yesterday
                </p>
                <p className="text-2xl font-semibold text-dark dark:text-white">
                  {formatCount(salesTotals?.salesYesterday)}
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Online</span>
                  <span>{onlineShare}%</span>
                </div>
                <Progress percent={onlineShare} showInfo={false} />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Offline</span>
                  <span>{offlineShare}%</span>
                </div>
                <Progress percent={offlineShare} showInfo={false} strokeColor="#0EA5E9" />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Affiliate</span>
                  <span>{affiliateShare}%</span>
                </div>
                <Progress percent={affiliateShare} showInfo={false} strokeColor="#F97316" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="Activation Trends"
        className="shadow-1 dark:bg-gray-dark dark:text-white"
      >
        <TrendChart data={summary?.trends} />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card
            title="Sales Channels"
            className="shadow-1 dark:bg-gray-dark dark:text-white"
          >
            <SalesChannelChart channels={summary?.salesChannels} />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            title="Top Affiliate Partners"
            className="shadow-1 dark:bg-gray-dark dark:text-white"
          >
            <Table<AffiliateTableItem>
              rowKey="key"
              columns={affiliateColumns}
              dataSource={affiliateRows}
              pagination={false}
              locale={{
                emptyText: <Empty description="No affiliate data yet" />,
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card
            title="Recent Activations"
            className="shadow-1 dark:bg-gray-dark dark:text-white"
          >
            <Table<ActivityTableItem>
              rowKey="key"
              columns={activityColumns}
              dataSource={activationsRows}
              pagination={false}
              locale={{ emptyText: <Empty description="No activations yet" /> }}
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card
            title="Recent Sales"
            className="shadow-1 dark:bg-gray-dark dark:text-white"
          >
            <Table<SaleTableItem>
              rowKey="key"
              columns={recentSalesColumns}
              dataSource={salesRows}
              pagination={false}
              scroll={{ x: 600 }}
              locale={{ emptyText: <Empty description="No sales recorded yet" /> }}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default Overview;

