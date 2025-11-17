import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Space,
  Alert,
  Table,
  DatePicker,
  Select,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs, { Dayjs } from "dayjs";
import {
  getAffiliatePartnerById,
  getAffiliatePartnerStats,
} from "../../services/affiliatePartnerService";
import {
  AffiliatePartner,
  AffiliatePartnerStats,
} from "../../types/qr";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const { RangePicker } = DatePicker;

const ViewAffiliatePartner = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<AffiliatePartner | null>(null);
  const [stats, setStats] = useState<AffiliatePartnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);

  useEffect(() => {
    if (!id) {
      setError("Partner ID is required");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [partnerData, statsData] = await Promise.all([
          getAffiliatePartnerById(id),
          getAffiliatePartnerStats(id, {
            startDate: dateRange[0]?.toISOString(),
            endDate: dateRange[1]?.toISOString(),
          }),
        ]);
        setPartner(partnerData);
        setStats(statsData);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load partner";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [id]);

  const handleRefreshStats = async () => {
    if (!id) return;
    setStatsLoading(true);
    try {
      const statsData = await getAffiliatePartnerStats(id, {
        startDate: dateRange[0]?.toISOString(),
        endDate: dateRange[1]?.toISOString(),
      });
      setStats(statsData);
      toast.success("Stats refreshed");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to refresh stats";
      toast.error(message);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  useEffect(() => {
    if (id && dateRange[0] && dateRange[1]) {
      void handleRefreshStats();
    }
  }, [dateRange]);

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

  const monthlyStatsColumns = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
    },
    {
      title: "Cards Activated",
      dataIndex: "cardsActivated",
      key: "cardsActivated",
      render: (value?: number) => value ?? 0,
    },
    {
      title: "Sales",
      dataIndex: "sales",
      key: "sales",
      render: (value?: number) => value ?? 0,
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (value?: number) => `₹${(value ?? 0).toLocaleString()}`,
    },
  ];

  const recentActivationsColumns = [
    {
      title: "Date",
      dataIndex: "activatedAt",
      key: "activatedAt",
      render: (value?: string) =>
        value ? dayjs(value).format("DD MMM YYYY, HH:mm") : "—",
    },
    {
      title: "Tag Code",
      dataIndex: "shortCode",
      key: "shortCode",
      render: (value?: string) => (
        <span className="font-mono">{value || "—"}</span>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (value?: number) => `₹${(value ?? 0).toLocaleString()}`,
    },
  ];

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
      fontFamily: "Satoshi, sans-serif",
    },
    colors: ["#6366F1", "#10B981", "#F59E0B"],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.1,
      },
    },
    dataLabels: { enabled: false },
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
    xaxis: {
      categories: stats?.monthlyStats?.map((s) => s.month || "") || [],
    },
    yaxis: [
      {
        title: { text: "Count" },
      },
      {
        opposite: true,
        title: { text: "Revenue (₹)" },
      },
    ],
    tooltip: {
      theme: "dark",
    },
  };

  const chartSeries = [
    {
      name: "Cards Activated",
      data: stats?.monthlyStats?.map((s) => s.cardsActivated ?? 0) || [],
    },
    {
      name: "Sales",
      data: stats?.monthlyStats?.map((s) => s.sales ?? 0) || [],
    },
    {
      name: "Revenue",
      data: stats?.monthlyStats?.map((s) => s.revenue ?? 0) || [],
      type: "line",
    },
  ];

  if (loading) {
    return <MiniLoader />;
  }

  if (error || !partner) {
    return (
      <div className="space-y-6">
        <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
          <Alert
            message="Error"
            description={error || "Partner not found"}
            type="error"
            showIcon
            action={
              <Button onClick={() => navigate("/affiliate-partners")}>
                Back to Partners
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/affiliate-partners")}
            >
              Back
            </Button>
            <h1 className="text-2xl font-bold text-dark dark:text-white m-0">
              Partner Details: {partner.name}
            </h1>
          </div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/affiliate-partners/${id}/edit`)}
          >
            Edit Partner
          </Button>
        </div>

        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          className="dark:text-white"
        >
          <Descriptions.Item label="Partner ID">
            {partner.partnerId || partner._id || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Name">{partner.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{partner.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{partner.phone}</Descriptions.Item>
          <Descriptions.Item label="Company">
            {partner.company || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(partner.status)}>
              {(partner.status || "inactive").toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Commission Rate">
            {partner.commissionRate ?? 0}%
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {partner.address || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="City">{partner.city || "—"}</Descriptions.Item>
          <Descriptions.Item label="State">{partner.state || "—"}</Descriptions.Item>
          <Descriptions.Item label="Pincode">
            {partner.pincode || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {partner.createdAt
              ? dayjs(partner.createdAt).format("DD MMM YYYY, HH:mm:ss")
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {partner.updatedAt
              ? dayjs(partner.updatedAt).format("DD MMM YYYY, HH:mm:ss")
              : "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-1 dark:bg-gray-dark">
            <Statistic
              title="Total Cards Activated"
              value={stats?.totalCardsActivated ?? partner.totalCardsActivated ?? 0}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-1 dark:bg-gray-dark">
            <Statistic
              title="Total Sales"
              value={stats?.totalSales ?? partner.totalSales ?? 0}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-1 dark:bg-gray-dark">
            <Statistic
              title="Total Revenue"
              value={stats?.totalRevenue ?? partner.totalRevenue ?? 0}
              prefix="₹"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-1 dark:bg-gray-dark">
            <Statistic
              title="Commission Earned"
              value={
                partner.commissionRate
                  ? ((stats?.totalRevenue ?? partner.totalRevenue ?? 0) *
                      partner.commissionRate) /
                    100
                  : 0
              }
              prefix="₹"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Reports Section */}
      <Card
        title="Reports & Analytics"
        className="shadow-1 dark:bg-gray-dark dark:text-white"
        extra={
          <Space>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefreshStats}
              loading={statsLoading}
            >
              Refresh
            </Button>
            <Button icon={<DownloadOutlined />} disabled>
              Export Report
            </Button>
          </Space>
        }
      >
        {/* Monthly Stats Chart */}
        {stats?.monthlyStats && stats.monthlyStats.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">
              Monthly Performance
            </h3>
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="area"
              height={350}
            />
          </div>
        )}

        {/* Monthly Stats Table */}
        {stats?.monthlyStats && stats.monthlyStats.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">
              Monthly Statistics
            </h3>
            <Table
              columns={monthlyStatsColumns}
              dataSource={stats.monthlyStats.map((stat, index) => ({
                ...stat,
                key: index,
              }))}
              pagination={false}
              className="dark:text-white"
            />
          </div>
        )}

        {/* Recent Activations */}
        {stats?.recentActivations && stats.recentActivations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">
              Recent Activations
            </h3>
            <Table
              columns={recentActivationsColumns}
              dataSource={stats.recentActivations.map((activation, index) => ({
                ...activation,
                key: index,
              }))}
              pagination={{ pageSize: 10 }}
              className="dark:text-white"
            />
          </div>
        )}

        {(!stats?.monthlyStats || stats.monthlyStats.length === 0) &&
          (!stats?.recentActivations || stats.recentActivations.length === 0) && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No data available for the selected date range
            </div>
          )}
      </Card>
    </div>
  );
};

export default ViewAffiliatePartner;

