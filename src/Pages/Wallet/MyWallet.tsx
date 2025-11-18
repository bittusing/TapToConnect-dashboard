import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Table,
  Tag,
  Statistic,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  Input,
  Space,
  Alert,
  Empty,
} from "antd";
import { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  WalletOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  getMyWallet,
  requestWithdrawal,
} from "../../services/walletService";
import {
  WalletTransaction,
  WalletSummary,
  WalletTransactionType,
  WalletTransactionStatus,
} from "../../types/qr";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

const { TextArea } = Input;

interface TransactionRow extends WalletTransaction {
  key: string;
}

const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return "₹0";
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (date?: string) =>
  date ? dayjs(date).format("DD MMM YYYY, HH:mm") : "—";

const MyWallet = () => {
  const [walletData, setWalletData] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMyWallet(page, limit);
      setWalletData(response.summary || null);
      const txns =
        response.transactions?.map<TransactionRow>((txn) => ({
          ...txn,
          key: txn._id || "",
        })) ?? [];
      setTransactions(txns);
      setTotal(response.pagination?.total ?? txns.length);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      toast.error("Failed to fetch wallet details");
      setWalletData(null);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleWithdraw = async (values: { amount: number; notes?: string }) => {
    if (!walletData?.availableBalance || values.amount > walletData.availableBalance) {
      toast.error("Insufficient wallet balance");
      return;
    }

    setWithdrawLoading(true);
    try {
      await requestWithdrawal({
        amount: values.amount,
        notes: values.notes,
      });
      toast.success("Withdrawal request submitted successfully");
      setWithdrawModalVisible(false);
      form.resetFields();
      fetchWallet();
    } catch (error: any) {
      console.error("Error requesting withdrawal:", error);
      toast.error(error?.message || "Failed to request withdrawal");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const columns: ColumnsType<TransactionRow> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => formatDate(date),
      sorter: (a, b) => {
        const dateA = a.createdAt ? dayjs(a.createdAt).unix() : 0;
        const dateB = b.createdAt ? dayjs(b.createdAt).unix() : 0;
        return dateA - dateB;
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: WalletTransactionType) => {
        const isCredit = type === "credit";
        return (
          <Tag
            icon={isCredit ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            color={isCredit ? "green" : "orange"}
          >
            {isCredit ? "Credit" : "Debit"}
          </Tag>
        );
      },
      filters: [
        { text: "Credit", value: "credit" },
        { text: "Debit", value: "debit" },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record) => (
        <span className={record.type === "credit" ? "text-green-600" : "text-orange-600"}>
          {record.type === "credit" ? "+" : "-"}
          {formatCurrency(amount)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: WalletTransactionStatus) => {
        const statusConfig: Record<
          WalletTransactionStatus,
          { color: string; icon: React.ReactNode; label: string }
        > = {
          pending: {
            color: "orange",
            icon: <ClockCircleOutlined />,
            label: "Pending",
          },
          completed: {
            color: "green",
            icon: <CheckCircleOutlined />,
            label: "Completed",
          },
          cancelled: {
            color: "red",
            icon: <CloseCircleOutlined />,
            label: "Cancelled",
          },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        );
      },
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Completed", value: "completed" },
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => desc || "—",
    },
    {
      title: "Balance",
      dataIndex: "balanceSnapshot",
      key: "balanceSnapshot",
      render: (balance: number) => formatCurrency(balance),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => notes || "—",
      ellipsis: true,
    },
  ];

  const availableBalance = walletData?.availableBalance || 0;
  const canWithdraw = availableBalance > 0;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">My Wallet</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your earnings and withdrawals
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchWallet} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<WalletOutlined />}
            onClick={() => setWithdrawModalVisible(true)}
            disabled={!canWithdraw}
          >
            Request Withdrawal
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Available Balance"
              value={availableBalance}
              prefix="₹"
              precision={2}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Total Commission (Completed)"
              value={walletData?.completedSales?.totalCommission || 0}
              prefix="₹"
              precision={2}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Pending Commission"
              value={walletData?.pendingSales?.pendingCommission || 0}
              prefix="₹"
              precision={2}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Total Withdrawn"
              value={walletData?.totalWithdrawn || 0}
              prefix="₹"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Completed Sales"
              value={walletData?.completedSales?.cardsActivated || 0}
              suffix="cards"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Pending Sales"
              value={walletData?.pendingSales?.pendingCards || 0}
              suffix="cards"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Pending Withdrawals"
              value={walletData?.pendingWithdrawals || 0}
              prefix="₹"
              precision={2}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
            <Statistic
              title="Total Sales Amount"
              value={walletData?.completedSales?.totalSalesAmount || 0}
              prefix="₹"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Transaction History */}
      <Card
        title="Transaction History"
        className="shadow-1 dark:bg-gray-dark dark:text-white"
      >
        {loading ? (
          <MiniLoader />
        ) : (
          <Table<TransactionRow>
            rowKey="key"
            columns={columns}
            dataSource={transactions}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} transactions`,
              onChange: (newPage, newLimit) => {
                setPage(newPage);
                setLimit(newLimit || 20);
              },
            }}
            locale={{
              emptyText: <Empty description="No transactions yet" />,
            }}
          />
        )}
      </Card>

      {/* Withdrawal Modal */}
      <Modal
        title="Request Withdrawal"
        open={withdrawModalVisible}
        onCancel={() => {
          setWithdrawModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleWithdraw}
          initialValues={{ amount: undefined, notes: "" }}
        >
          <Alert
            message="Available Balance"
            description={formatCurrency(availableBalance)}
            type="info"
            showIcon
            className="mb-4"
          />
          <Form.Item
            label="Withdrawal Amount"
            name="amount"
            rules={[
              { required: true, message: "Please enter withdrawal amount" },
              {
                type: "number",
                min: 1,
                message: "Amount must be greater than zero",
              },
              {
                validator: (_, value) => {
                  if (value && value > availableBalance) {
                    return Promise.reject(
                      new Error("Amount cannot exceed available balance")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              prefix="₹"
              className="w-full"
              placeholder="Enter amount"
              min={1}
              max={availableBalance}
              precision={2}
            />
          </Form.Item>
          <Form.Item label="Notes (Optional)" name="notes">
            <TextArea
              rows={4}
              placeholder="Add any notes or comments"
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={withdrawLoading}
              >
                Submit Request
              </Button>
              <Button
                onClick={() => {
                  setWithdrawModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyWallet;

