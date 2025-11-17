import { useMemo, useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import {
  CopyOutlined,
  ReloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import { toast } from "react-toastify";

import { generateBulkTags, getUserListForAssignment } from "../../services/qrAdminService";
import {
  GenerateBulkRequest,
  GenerateBulkResponse,
  TagItem,
  TagStatus,
  UserListItem,
} from "../../types/qr";

interface GeneratedTagRow extends TagItem {
  key: string;
}

const BulkGenerator = () => {
  const [form] = Form.useForm<GenerateBulkRequest>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateBulkResponse | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await getUserListForAssignment();
        setUsers(response.users || []);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to load users";
        toast.error(message);
      } finally {
        setLoadingUsers(false);
      }
    };

    void fetchUsers();
  }, []);

  const handleCopy = (value: string) => {
    void navigator.clipboard.writeText(value).then(
      () => toast.success("Copied to clipboard"),
      () => toast.error("Failed to copy")
    );
  };

  const columns: ColumnsType<GeneratedTagRow> = useMemo(
    () => [
      {
        title: "Short Code",
        dataIndex: "shortCode",
        key: "shortCode",
        width: 160,
        render: (value: string) => (
          <Space>
            <span>{value}</span>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(value)}
            />
          </Space>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (status: TagStatus) => (
          <Tag
            color={
              status === "activated"
                ? "green"
                : status === "assigned"
                ? "blue"
                : status === "archived"
                ? "volcano"
                : "gold"
            }
          >
            {status.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: "Landing URL",
        dataIndex: "shortUrl",
        key: "shortUrl",
        render: (value?: string) =>
          value ? (
            <a href={value} target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          ) : (
            "—"
          ),
      },
      {
        title: "QR Code",
        dataIndex: "qrUrl",
        key: "qrUrl",
        render: (value?: string) =>
          value ? (
            <a href={value} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          ) : (
            "Pending"
          ),
      },
    ],
    []
  );

  const handleSubmit = async (values: GenerateBulkRequest) => {
    setLoading(true);
    setResult(null); // Clear previous result
    try {
      // Build metadata object - if campaign is provided, include it
      const metadata: Record<string, unknown> = {};
      if (values.metadata?.campaign) {
        metadata.campaign = values.metadata.campaign;
      }
      // Include any other metadata fields
      if (values.metadata) {
        Object.assign(metadata, values.metadata);
      }

      const payload: GenerateBulkRequest = {
        count: values.count,
        batchName: values.batchName?.trim() || undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        assignedTo: values.assignedTo || undefined,
        // qrConfig: values.qrConfig,
      };

      console.log("Submitting payload:", payload);
      const response = await generateBulkTags(payload);
      console.log("Received response:", response);
      
      if (!response || !response.tags || !Array.isArray(response.tags)) {
        throw new Error("Invalid response format from server");
      }

      setResult(response);
      toast.success(
        `Generated ${response.tags.length} tag${response.tags.length === 1 ? "" : "s"}`
      );
      form.resetFields(["metadata", "qrConfig"]);
    } catch (error: unknown) {
      console.error("Error generating tags:", error);
      const message =
        error instanceof Error ? error.message : "Failed to generate tags";
      toast.error(message);
      setResult(null); // Clear result on error
    } finally {
      setLoading(false);
    }
  };

  const generatedRows: GeneratedTagRow[] =
    result?.tags.map((tag) => ({
      ...tag,
      key: tag.shortCode,
    })) ?? [];

  return (
    <div className="space-y-6">
      <Card
        title="Generate QR Tags"
        className="shadow-1 dark:bg-gray-dark dark:text-white"
      >
        <Form<GenerateBulkRequest>
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={{
            count: 1,
            qrConfig: {
              margin: undefined,
              scale: undefined,
              darkColor: undefined,
              lightColor: undefined,
            },
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="count"
                label="Tag count"
                rules={[
                  { required: true, message: "Enter number of tags to create" },
                  {
                    type: "number",
                    min: 1,
                    max: 500,
                    message: "Count must be between 1 and 500",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={500}
                  className="w-full"
                  placeholder="e.g. 25"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="batchName"
                label="Batch name"
                tooltip="Optional label grouping generated tags"
              >
                <Input placeholder="Marketing launch June" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name={["metadata", "campaign"]}
                label="Campaign metadata"
                tooltip="Optional custom metadata stored with each tag"
              >
                <Input placeholder="e.g. summer-2025" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="assignedTo"
                label="Assigned To"
                tooltip="Optional: Assign tags to a user (Admin, Support Admin, Super Admin, or Affiliate)"
              >
                <Select
                  placeholder="Select user (optional)"
                  allowClear
                  showSearch
                  loading={loadingUsers}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  options={users.map((user) => ({
                    value: user._id,
                    label: `${user.name} (${user.role})`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Collapse className="mb-6">
            <Collapse.Panel header="Advanced QR styling" key="qr-config">
              <Row gutter={16}>
                <Col xs={24} md={6}>
                  <Form.Item
                    name={["qrConfig", "margin"]}
                    label="Margin"
                    tooltip="White space (modules) around the QR"
                  >
                    <InputNumber min={0} className="w-full" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name={["qrConfig", "scale"]}
                    label="Scale"
                    tooltip="Pixels per QR module"
                  >
                    <InputNumber min={1} max={16} className="w-full" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name={["qrConfig", "darkColor"]}
                    label="Foreground color"
                    tooltip="Hex color, e.g. #111827"
                  >
                    <Input placeholder="#0F172A" allowClear />
                  </Form.Item>
                </Col>
                <Col xs={24} md={6}>
                  <Form.Item
                    name={["qrConfig", "lightColor"]}
                    label="Background color"
                    tooltip="Hex color, e.g. #FFFFFF"
                  >
                    <Input placeholder="#FFFFFF" allowClear />
                  </Form.Item>
                </Col>
              </Row>
            </Collapse.Panel>
          </Collapse>

          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              htmlType="submit"
              loading={loading}
            >
              Generate Tags
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                form.resetFields();
                setResult(null);
              }}
              disabled={loading}
            >
              Reset
            </Button>
          </Space>
        </Form>
      </Card>

      {result && (
        <Card
          title={`Generated Tags ${
            result.batchName ? `• ${result.batchName}` : ""
          }`}
          extra={
            <span className="text-sm text-gray-500 dark:text-gray-300">
              Total: {result.totalGenerated ?? result.tags.length}
            </span>
          }
          className="shadow-1 dark:bg-gray-dark dark:text-white"
        >
          <Table<GeneratedTagRow>
            rowKey="key"
            columns={columns}
            dataSource={generatedRows}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
};

export default BulkGenerator;

