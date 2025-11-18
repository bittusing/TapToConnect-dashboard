import { useCallback, useEffect, useState } from "react";
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
  Select,
  Space,
  Alert,
  Empty,
  message,
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
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  getUserWallet,
  updateTransactionStatus,
  createManualCredit,
} from "../../services/walletService";
import {
  getAffiliatePartners,
} from "../../services/affiliatePartnerService";
import {
  WalletTransaction,
  WalletSummary,
  WalletTransactionType,
  WalletTransactionStatus,
  AffiliatePartner,
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

const WalletManagement = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [walletData, setWalletData] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [affiliatePartners, setAffiliatePartners] = useState<AffiliatePartner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  
  // Modals
  const [creditModalVisible, setCreditModalVisible] = useState(false);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRow | null>(null);
  
  const [creditForm] = Form.useForm();
  const [transactionForm] = Form.useForm();

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

  const fetchWallet = useCallback(async () => {
    if (!selectedUserId) {
      setWalletData(null);
      setTransactions([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const response = await getUserWallet(selectedUserId, page, limit);
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
  }, [selectedUserId, page, limit]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleCreateCredit = async (values: {
    amount: number;
    description?: string;
    notes?: string;
  }) => {
    if (!selectedUserId) {
      toast.error("Please select a user first");
      return;
    }

    try {
      await createManualCredit({
        userId: selectedUserId,
        amount: values.amount,
        description: values.description,
        notes: values.notes,
      });
      toast.success("Manual credit created successfully");
      setCreditModalVisible(false);
      creditForm.resetFields();
      fetchWallet();
    } catch (error: any) {
      console.error("Error creating credit:", error);
      toast.error(error?.message || "Failed to create manual credit");
    }
  };

  const handleUpdateTransaction = async (values: {
    status: WalletTransactionStatus;
    notes?: string;
  }) => {
    if (!selectedTransaction?._id) {
      toast.error("Transaction not selected");
      return;
    }

    try {
      await updateTransactionStatus(selectedTransaction._id, {
        status: values.status,
        notes: values.notes,
      });
      toast.success("Transaction updated successfully");
      setTransactionModalVisible(false);
      setSelectedTransaction(null);
      transactionForm.resetFields();
      fetchWallet();
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      toast.error(error?.message || "Failed to update transaction");
    }
  };

  const openTransactionModal = (transaction: TransactionRow) => {
    setSelectedTransaction(transaction);
    transactionForm.setFieldsValue({
      status: transaction.status,
      notes: transaction.notes || "",
    });
    setTransactionModalVisible(true);
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => openTransactionModal(record)}
          disabled={record.status === "completed"}
        >
          {record.status === "pending" ? "Update Status" : "View"}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">
            Wallet Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage affiliate wallets and transactions
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchWallet} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreditModalVisible(true)}
            disabled={!selectedUserId}
          >
            Add Manual Credit
          </Button>
        </Space>
      </div>

      {/* User Selection */}
      <Card className="mb-6 shadow-1 dark:bg-gray-dark dark:text-white">
        <Space direction="vertical" size="middle" className="w-full">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Affiliate Partner
            </label>
            <Select
              value={selectedUserId}
              onChange={setSelectedUserId}
              className="w-full"
              loading={loadingPartners}
              placeholder="Select an affiliate partner"
              showSearch
              optionFilterProp="label"
              options={[
                ...affiliatePartners.map((partner) => ({
                  label: `${partner.name} (${partner.companyName || partner.company || ""}) - ${partner.email}`,
                  value: partner._id || "",
                })),
              ]}
            />
          </div>
        </Space>
      </Card>

      {selectedUserId ? (
        <>
          {/* Summary Cards */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
                <Statistic
                  title="Available Balance"
                  value={walletData?.availableBalance || 0}
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
        </>
      ) : (
        <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
          <Empty description="Please select an affiliate partner to view wallet details" />
        </Card>
      )}

      {/* Manual Credit Modal */}
      <Modal
        title="Add Manual Credit"
        open={creditModalVisible}
        onCancel={() => {
          setCreditModalVisible(false);
          creditForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={creditForm}
          layout="vertical"
          onFinish={handleCreateCredit}
          initialValues={{ amount: undefined, description: "", notes: "" }}
        >
          <Form.Item
            label="Amount"
            name="amount"
            rules={[
              { required: true, message: "Please enter amount" },
              {
                type: "number",
                min: 1,
                message: "Amount must be greater than zero",
              },
            ]}
          >
            <InputNumber
              prefix="₹"
              className="w-full"
              placeholder="Enter amount"
              min={1}
              precision={2}
            />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input placeholder="e.g., Bonus payment" maxLength={200} />
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
              <Button type="primary" htmlType="submit">
                Create Credit
              </Button>
              <Button
                onClick={() => {
                  setCreditModalVisible(false);
                  creditForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Transaction Modal */}
      <Modal
        title="Update Transaction Status"
        open={transactionModalVisible}
        onCancel={() => {
          setTransactionModalVisible(false);
          setSelectedTransaction(null);
          transactionForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        {selectedTransaction && (
          <Form
            form={transactionForm}
            layout="vertical"
            onFinish={handleUpdateTransaction}
          >
            <Alert
              message="Transaction Details"
              description={
                <div className="mt-2">
                  <p>
                    <strong>Type:</strong> {selectedTransaction.type.toUpperCase()}
                  </p>
                  <p>
                    <strong>Amount:</strong> {formatCurrency(selectedTransaction.amount)}
                  </p>
                  <p>
                    <strong>Current Status:</strong> {selectedTransaction.status.toUpperCase()}
                  </p>
                </div>
              }
              type="info"
              showIcon
              className="mb-4"
            />
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                options={[
                  { label: "Pending", value: "pending" },
                  { label: "Completed", value: "completed" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
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
                <Button type="primary" htmlType="submit">
                  Update Status
                </Button>
                <Button
                  onClick={() => {
                    setTransactionModalVisible(false);
                    setSelectedTransaction(null);
                    transactionForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default WalletManagement;

