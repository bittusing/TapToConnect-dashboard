import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Alert,
  Image,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { getTagSaleById } from "../../services/tagSaleService";
import {
  TagSale,
  SaleType,
  PaymentStatus,
  VerificationStatus,
} from "../../types/qr";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

const formatDate = (date?: string) =>
  date ? dayjs(date).format("DD MMM YYYY, HH:mm") : "—";

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

const ViewSale = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<TagSale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchSale = async () => {
        setLoading(true);
        setError(null);
        try {
          const saleData = await getTagSaleById(id);
          setSale(saleData);
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to load sale";
          setError(message);
          toast.error(message);
        } finally {
          setLoading(false);
        }
      };

      void fetchSale();
    }
  }, [id]);

  if (loading) {
    return <MiniLoader />;
  }

  if (error || !sale) {
    return (
      <div className="space-y-6">
        <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
          <Alert
            message="Error"
            description={error || "Sale not found"}
            type="error"
            showIcon
            action={
              <Button onClick={() => navigate("/sales")}>
                Back to Sales
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const tag = typeof sale.tag === "object" ? sale.tag : null;
  const salesPerson =
    typeof sale.SalesPerson === "object" ? sale.SalesPerson : null;
  const owner = typeof sale.owner === "object" ? sale.owner : null;
  const createdBy =
    typeof sale.createdBy === "object" ? sale.createdBy : null;
  const updatedBy =
    typeof sale.updatedBy === "object" ? sale.updatedBy : null;

  return (
    <div className="space-y-6">
      <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/sales")}
            >
              Back
            </Button>
            <h1 className="text-2xl font-bold text-dark dark:text-white m-0">
              Sale Details
            </h1>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/sales/${id}/edit`)}
            >
              Edit Sale
            </Button>
          </Space>
        </div>

        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          className="dark:text-white"
        >
          <Descriptions.Item label="Sale ID">
            <span className="font-mono">{sale._id || "—"}</span>
          </Descriptions.Item>

          <Descriptions.Item label="Tag Code">
            <span className="font-mono font-semibold">
              {tag?.shortCode || "—"}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Tag URL">
            {tag?.shortUrl ? (
              <a
                href={tag.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400"
              >
                {tag.shortUrl}
              </a>
            ) : (
              "—"
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Sale Date">
            {formatDate(sale.saleDate)}
          </Descriptions.Item>

          <Descriptions.Item label="Sale Type">
            <Tag color={getSaleTypeColor(sale.saleType)}>
              {(sale.saleType || "not-confirmed").toUpperCase()}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Sales Person">
            {salesPerson?.name || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Sales Person Email">
            {salesPerson?.email || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Sales Person Phone">
            {salesPerson?.phone || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Sales Person Role">
            {sale.salesPersonRole || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Owner Name">
            {owner?.fullName || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Owner Phone">
            {owner?.phone || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Owner Email">
            {owner?.email || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Total Sale Amount">
            <span className="font-semibold text-green-600 dark:text-green-400">
              ₹{sale.totalSaleAmount?.toLocaleString() ?? 0}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Cost Amount">
            <span className="font-semibold">
              ₹{sale.castAmountOfProductAndServices?.toLocaleString() ?? 0}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Sales Person Commission">
            <span className="font-semibold">
              ₹{sale.commisionAmountOfSalesPerson?.toLocaleString() ?? 0}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Owner Commission">
            <span className="font-semibold">
              ₹{sale.commisionAmountOfOwner?.toLocaleString() ?? 0}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Payment Status">
            <Tag color={getPaymentStatusColor(sale.paymentStatus)}>
              {(sale.paymentStatus || "pending").toUpperCase()}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Verification Status">
            <Tag color={getVerificationStatusColor(sale.varificationStatus)}>
              {(sale.varificationStatus || "pending").toUpperCase()}
            </Tag>
          </Descriptions.Item>

          {sale.message && sale.message.length > 0 && (
            <Descriptions.Item label="Messages" span={2}>
              <div className="space-y-2">
                {sale.message.map((msg, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded"
                  >
                    {msg.message || "—"}
                  </div>
                ))}
              </div>
            </Descriptions.Item>
          )}

          {sale.paymentImageOrScreenShot && (
            <Descriptions.Item label="Payment Image/Screenshot" span={2}>
              <Image
                src={sale.paymentImageOrScreenShot}
                alt="Payment Screenshot"
                style={{ maxWidth: 400, maxHeight: 300 }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Created By">
            {createdBy?.name || "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Created At">
            {formatDate(sale.createdAt)}
          </Descriptions.Item>

          {updatedBy && (
            <Descriptions.Item label="Updated By">
              {updatedBy.name || "—"}
            </Descriptions.Item>
          )}

          {sale.updatedAt && (
            <Descriptions.Item label="Updated At">
              {formatDate(sale.updatedAt)}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
};

export default ViewSale;

