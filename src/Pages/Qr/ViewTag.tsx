import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, Tag, Space, Image, Spin, Alert } from "antd";
import { ArrowLeftOutlined, EditOutlined, DownloadOutlined, CopyOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { getAdminTags } from "../../services/qrAdminService";
import { TagItem, TagStatus } from "../../types/qr";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

const ViewTag = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [tag, setTag] = useState<TagItem | null>(null);
  const [loading, setLoading] = useState(true);
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
        console.log("foundTag", foundTag, response);
        if (!foundTag) {
          setError("Tag not found");
        } else {
          setTag(foundTag);
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
  }, [shortCode]);

  const getStatusColor = (status: TagStatus) => {
    switch (status) {
      case "activated":
        return "green";
      case "assigned":
        return "blue";
      case "generated":
        return "gold";
      case "archived":
        return "red";
      default:
        return "default";
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
              onClick={() => navigate("/qr/tags")}
            >
              Back
            </Button>
            <h1 className="text-2xl font-bold text-dark dark:text-white m-0">
              Tag Details: {tag.shortCode}
            </h1>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/qr/tags/${tag.shortCode}/edit`)}
            >
              Edit Tag
            </Button>
          </Space>
        </div>

        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          className="dark:text-white"
        >
          <Descriptions.Item label="Tag ID">
            {tag.tagId || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Short Code">
            <span className="font-mono">{tag.shortCode}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(tag.status)}>
              {tag.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Batch Name">
            {tag.batchName || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Short URL">
            {tag.shortUrl ? (
              <a
                href={tag.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {tag.shortUrl}
              </a>
            ) : (
              "—"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Qr Id" >
            {tag._id ? (
              <Space>
                <span className="font-mono">{tag._id || "—"}</span>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => {
                    if (tag._id) {
                      navigator.clipboard.writeText(tag._id);
                      toast.success("Copied to clipboard");
                    }
                  }}
                />
              </Space>
            ) : (
              "—"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="QR Code Image" span={2}>
            {tag.qrUrl ? (
              <div className="space-y-2">
                <Image
                  src={tag.qrUrl}
                  alt={`QR Code for ${tag.shortCode}`}
                  width={200}
                  className="border rounded"
                />
                <div>
                  <Button
                    icon={<DownloadOutlined />}
                    href={tag.qrUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download QR
                  </Button>
                </div>
              </div>
            ) : (
              <Tag color="orange">QR Code not generated</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {tag.createdAt
              ? dayjs(tag.createdAt).format("DD MMM YYYY, HH:mm:ss")
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {tag.updatedAt
              ? dayjs(tag.updatedAt).format("DD MMM YYYY, HH:mm:ss")
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Activated At">
            {tag.activatedAt
              ? dayjs(tag.activatedAt).format("DD MMM YYYY, HH:mm:ss")
              : "—"}
          </Descriptions.Item>
        </Descriptions>

        {tag.assignedTo && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">
              Assigned To Partner
            </h3>
            <Descriptions
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              className="dark:text-white"
            >
              <Descriptions.Item label="Name">
                {tag.assignedTo.name || tag.assignedTo.fullName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {tag.assignedTo.phone || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {tag.assignedTo.email || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                {tag.assignedTo.role || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {tag.assignedTo.city || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="State">
                {tag.assignedTo.state || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {tag.assignedTo.address || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Pincode">
                {tag.assignedTo.pincode || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Company Name">
                {tag.assignedTo.companyName || tag.assignedTo.company || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Commission Percentage">
                {tag.assignedTo.commissionPercentage !== undefined
                  ? `${tag.assignedTo.commissionPercentage}%`
                  : tag.assignedTo.commissionRate !== undefined
                  ? `${tag.assignedTo.commissionRate}%`
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={tag.assignedTo.isActive ? "green" : "red"}>
                  {tag.assignedTo.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {tag?.ownerAssignedTo && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">
              Vehicle Owner Details
            </h3>
            <Descriptions
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              className="dark:text-white"
            >
              <Descriptions.Item label="Full Name">
                {tag.ownerAssignedTo.fullName || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {tag.ownerAssignedTo.phone || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {tag.ownerAssignedTo.email || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {tag.ownerAssignedTo.city || "—"}
              </Descriptions.Item>
              {tag.ownerAssignedTo.vehicle && (
                <>
                  <Descriptions.Item label="Vehicle Number">
                    {tag.ownerAssignedTo.vehicle.number || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vehicle Type">
                    {tag.ownerAssignedTo.vehicle.type || "—"}
                  </Descriptions.Item>
                </>
              )}
              {tag.ownerAssignedTo.preferences && (
                <Descriptions.Item label="Notification Preferences" span={2}>
                  <Space>
                    {tag.ownerAssignedTo.preferences.sms && <Tag>SMS</Tag>}
                    {tag.ownerAssignedTo.preferences.whatsapp && <Tag>WhatsApp</Tag>}
                    {tag.ownerAssignedTo.preferences.call && <Tag>Call</Tag>}
                    {!tag.ownerAssignedTo.preferences.sms &&
                      !tag.ownerAssignedTo.preferences.whatsapp &&
                      !tag.ownerAssignedTo.preferences.call && (
                        <span className="text-gray-500">None</span>
                      )}
                  </Space>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Status">
                <Tag color={tag.ownerAssignedTo.isActive ? "green" : "red"}>
                  {tag.ownerAssignedTo.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              {tag.ownerAssignedTo.createdAt && (
                <Descriptions.Item label="Created At">
                  {dayjs(tag.ownerAssignedTo.createdAt).format("DD MMM YYYY, HH:mm:ss")}
                </Descriptions.Item>
              )}
              {tag.ownerAssignedTo.updatedAt && (
                <Descriptions.Item label="Updated At">
                  {dayjs(tag.ownerAssignedTo.updatedAt).format("DD MMM YYYY, HH:mm:ss")}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}

        {tag.metadata && Object.keys(tag.metadata).length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4 text-dark dark:text-white">
              Metadata
            </h3>
            <Descriptions bordered column={1}>
              {Object.entries(tag.metadata).map(([key, value]) => (
                <Descriptions.Item key={key} label={key}>
                  {String(value)}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ViewTag;

