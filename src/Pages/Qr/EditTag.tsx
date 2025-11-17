import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Alert,
  Tag,
  message,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getAdminTags,
  updateTagStatus,
} from "../../services/qrAdminService";
import { TagItem, TagStatus } from "../../types/qr";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

const { Option } = Select;

const statusOptions: Array<{ label: string; value: TagStatus }> = [
  { label: "Generated", value: "generated" },
  { label: "Assigned", value: "assigned" },
  { label: "Activated", value: "activated" },
  { label: "Archived", value: "archived" },
];

const EditTag = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [tag, setTag] = useState<TagItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortCode) {
      setError("Tag short code is required");
      setLoading(false);
      return;
    }

    const fetchTag = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAdminTags({ search: shortCode, limit: 1 });
        const foundTag = response.tags?.find((t) => t.shortCode === shortCode);
        
        if (!foundTag) {
          setError("Tag not found");
        } else {
          setTag(foundTag);
          // Set form values
          form.setFieldsValue({
            status: foundTag.status,
            batchName: foundTag.batchName || "",
            metadata: foundTag.metadata
              ? Object.entries(foundTag.metadata).map(([key, value]) => ({
                  key,
                  value: String(value),
                }))
              : [],
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load tag";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchTag();
  }, [shortCode, form]);

  const handleSubmit = async (values: {
    status: TagStatus;
    batchName: string;
    metadata: Array<{ key: string; value: string }>;
  }) => {
    if (!shortCode || !tag) return;

    setSaving(true);
    try {
      // Update status if changed
      if (values.status !== tag.status) {
        await updateTagStatus(shortCode, { status: values.status });
      }

      // TODO: Add API endpoint for updating batchName and metadata
      // For now, we'll only update status
      // You can add these endpoints later:
      // await updateTagDetails(shortCode, {
      //   batchName: values.batchName,
      //   metadata: values.metadata.reduce((acc, item) => {
      //     if (item.key && item.value) {
      //       acc[item.key] = item.value;
      //     }
      //     return acc;
      //   }, {} as Record<string, string>),
      // });

      message.success("Tag updated successfully");
      navigate(`/qr/tags/${shortCode}/view`);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update tag";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <MiniLoader />;
  }

  if (error || !tag) {
    return (
      <div className="space-y-6">
        <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
          <Alert
            message="Error"
            description={error || "Tag not found"}
            type="error"
            showIcon
            action={
              <Button onClick={() => navigate("/qr/tags")}>
                Back to Tags
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
              onClick={() => navigate(`/qr/tags/${shortCode}/view`)}
            >
              Back
            </Button>
            <h1 className="text-2xl font-bold text-dark dark:text-white m-0">
              Edit Tag: {tag.shortCode}
            </h1>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: tag.status,
            batchName: tag.batchName || "",
            metadata: tag.metadata
              ? Object.entries(tag.metadata).map(([key, value]) => ({
                  key,
                  value: String(value),
                }))
              : [],
          }}
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Select placeholder="Select status">
              {statusOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="batchName"
            label="Batch Name"
            tooltip="Optional batch name for grouping tags"
          >
            <Input placeholder="Enter batch name" allowClear />
          </Form.Item>

          <Form.List name="metadata">
            {(fields, { add, remove }) => (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-dark dark:text-white">
                    Metadata (Key-Value Pairs)
                  </label>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                    size="small"
                  >
                    Add Metadata
                  </Button>
                </div>
                {fields.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    No metadata. Click "Add Metadata" to add key-value pairs.
                  </div>
                )}
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                    className="w-full"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "key"]}
                      rules={[
                        { required: true, message: "Key is required" },
                      ]}
                      className="flex-1"
                    >
                      <Input placeholder="Key" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "value"]}
                      rules={[
                        { required: true, message: "Value is required" },
                      ]}
                      className="flex-1"
                    >
                      <Input placeholder="Value" />
                    </Form.Item>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    >
                      Remove
                    </Button>
                  </Space>
                ))}
              </div>
            )}
          </Form.List>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                Save Changes
              </Button>
              <Button onClick={() => navigate(`/qr/tags/${shortCode}/view`)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Currently, only status can be updated. Batch name and metadata
            update functionality will be available once the backend API endpoint is implemented.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default EditTag;

