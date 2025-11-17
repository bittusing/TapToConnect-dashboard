import { useState, useEffect, useCallback } from "react";
import { Button, Card, Form, Input, Select, DatePicker, InputNumber, Space, Alert } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { createTagSale } from "../../services/tagSaleService";
import { getUserListForAssignment, verifyTagByShortCode } from "../../services/qrAdminService";
import { getUserRole } from "../../api/commonAPI";
import {
  SaleType,
  PaymentStatus,
  VerificationStatus,
  SalesPersonRole,
  TagSale,
  UserListItem,
  TagVerifyResult,
} from "../../types/qr";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

const { TextArea } = Input;

interface SaleFormValues {
  tagShortCode: string;
  SalesPerson?: string;
  owner: string;
  saleDate: Dayjs;
  saleType: SaleType;
  salesPersonRole: SalesPersonRole;
  totalSaleAmount: number;
  commisionAmountOfSalesPerson: number;
  commisionAmountOfOwner: number;
  castAmountOfProductAndServices: number;
  paymentStatus: PaymentStatus;
  varificationStatus: VerificationStatus;
  message?: string;
  paymentImageOrScreenShot?: string;
}

// Helper function to get current user ID
const getCurrentUserId = (): string | null => {
  try {
    const data = localStorage.getItem("user");
    const parsedData = data ? JSON.parse(data) : null;
    return parsedData?._id || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

const AddSale = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<SaleFormValues>();
  const [loading, setLoading] = useState(false);
  const [salesPersons, setSalesPersons] = useState<UserListItem[]>([]);
  const [loadingSalesPersons, setLoadingSalesPersons] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [verifiedTag, setVerifiedTag] = useState<TagVerifyResult | null>(null);
  const [tagVerifyLoading, setTagVerifyLoading] = useState(false);
  const [tagVerifyError, setTagVerifyError] = useState<string | null>(null);
  const [tagVerifySuccess, setTagVerifySuccess] = useState<string | null>(null);

  const handleSubmit = async (values: SaleFormValues) => {
    setLoading(true);
    try {
      if (!verifiedTag?._id) {
        throw new Error("Please verify the tag short code before creating a sale");
      }
      if (!values.owner) {
        throw new Error("Owner details are missing. Please verify the tag again.");
      }

      const saleData: Omit<TagSale, "_id" | "createdAt" | "updatedAt"> = {
        tag: verifiedTag._id, // Service expects ID and will convert to tagId
        SalesPerson: values.SalesPerson || currentUserId || "", // Will be converted to salesPersonId in service
        owner: values.owner, // Will be converted to ownerId in service
        saleDate: values.saleDate.toISOString(),
        saleType: values.saleType,
        salesPersonRole: values.salesPersonRole,
        totalSaleAmount: values.totalSaleAmount,
        commisionAmountOfSalesPerson: values.commisionAmountOfSalesPerson,
        commisionAmountOfOwner: values.commisionAmountOfOwner,
        castAmountOfProductAndServices: values.castAmountOfProductAndServices,
        paymentStatus: values.paymentStatus,
        varificationStatus: values.varificationStatus,
        message: values.message ? [{ message: values.message }] : [],
        paymentImageOrScreenShot: values.paymentImageOrScreenShot,
      };

      await createTagSale(saleData);
      toast.success("Sale created successfully");
      navigate("/sales");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to create sale";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommissionCalculation = () => {
    const totalAmount = form.getFieldValue("totalSaleAmount") || 0;
    const costAmount = form.getFieldValue("castAmountOfProductAndServices") || 0;
    const salesPersonRole = form.getFieldValue("salesPersonRole");

    // Calculate commissions (example logic - adjust as needed)
    if (salesPersonRole === "Affiliate") {
      const salesPersonCommission = totalAmount * 0.1; // 10% commission
      const ownerCommission = totalAmount * 0.04; // 4% commission
      form.setFieldsValue({
        commisionAmountOfSalesPerson: salesPersonCommission,
        commisionAmountOfOwner: ownerCommission,
      });
    } else {
      form.setFieldsValue({
        commisionAmountOfSalesPerson: 0,
        commisionAmountOfOwner: totalAmount * 0.04,
      });
    }
  };

  // Get current user role and ID
  useEffect(() => {
    const role = getUserRole();
    const userId = getCurrentUserId();
    setCurrentUserRole(role);
    setCurrentUserId(userId);
    
    // If user is Affiliate, set the sales person to current user ID
    if (role === "Affiliate" && userId) {
      form.setFieldsValue({
        SalesPerson: userId,
      });
    }
  }, [form]);

  // Fetch sales persons list for Admin/Support Admin/Super Admin
  useEffect(() => {
    const role = getUserRole();
    if (role && (role === "Super Admin" || role === "Support Admin" || role === "Admin")) {
      const fetchSalesPersons = async () => {
        setLoadingSalesPersons(true);
        try {
          const response = await getUserListForAssignment();
          setSalesPersons(response.users || []);
        } catch (error: unknown) {
          console.error("Failed to load sales persons:", error);
          toast.error("Failed to load sales persons list");
        } finally {
          setLoadingSalesPersons(false);
        }
      };
      void fetchSalesPersons();
    }
  }, []);

  const tagShortCodeValue = Form.useWatch("tagShortCode", form);

  const handleVerifyTag = useCallback(async (shortCode: string) => {
    if (!shortCode) return;
    setTagVerifyLoading(true);
    setTagVerifyError(null);
    try {
      const data = await verifyTagByShortCode(shortCode);
      setVerifiedTag(data);
      const nextValues: Partial<SaleFormValues> = {};
      if (data.ownerId) {
        nextValues.owner = data.ownerId;
      }
      if (data.assignedTo) {
        nextValues.SalesPerson = data.assignedTo;
      }
      if (Object.keys(nextValues).length > 0) {
        form.setFieldsValue(nextValues);
      }
      setTagVerifyError(null);
      setTagVerifySuccess(`Tag ${data.shortCode} verified successfully`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to verify tag";
      setVerifiedTag(null);
      setTagVerifySuccess(null);
      setTagVerifyError(message);
      form.setFieldsValue({ owner: undefined });
    } finally {
      setTagVerifyLoading(false);
    }
  }, [form]);

  useEffect(() => {
    const trimmed = tagShortCodeValue?.trim();
    if (!trimmed) {
      setVerifiedTag(null);
      setTagVerifyError(null);
      setTagVerifySuccess(null);
      form.setFieldsValue({ owner: undefined });
      return;
    }

    if (verifiedTag && verifiedTag.shortCode === trimmed) {
      return;
    }

    if (trimmed.length < 3) {
      setVerifiedTag(null);
      setTagVerifySuccess(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void handleVerifyTag(trimmed);
    }, 600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [tagShortCodeValue, handleVerifyTag, verifiedTag, form]);

  // Watch for changes in totalSaleAmount and salesPersonRole
  const totalAmount = Form.useWatch("totalSaleAmount", form);
  const salesPersonRole = Form.useWatch("salesPersonRole", form);
  const selectedSalesPersonId = Form.useWatch("SalesPerson", form);
  const assignedSalesPersonDetails =
    verifiedTag?.assignedTo && salesPersons.length
      ? salesPersons.find((person) => person._id === verifiedTag.assignedTo)
      : undefined;

  useEffect(() => {
    if (totalAmount) {
      handleCommissionCalculation();
    }
  }, [totalAmount, salesPersonRole]);

  if (loading) return <MiniLoader />;

  return (
    <div className="space-y-6">
      <Card
        title={
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/sales")}
              type="text"
            />
            <span>Add New Sale</span>
          </div>
        }
        className="shadow-1 dark:bg-gray-dark dark:text-white"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
          tagShortCode: "",
            saleDate: dayjs(),
            saleType: "not-confirmed",
            salesPersonRole: "Affiliate",
            paymentStatus: "pending",
            varificationStatus: "pending",
            totalSaleAmount: 0,
            commisionAmountOfSalesPerson: 0,
            commisionAmountOfOwner: 0,
            castAmountOfProductAndServices: 0,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Form.Item
                name="tagShortCode"
                label="Tag Short Code"
                rules={[{ required: true, message: "Please enter a tag short code" }]}
              >
                <Input
                  placeholder="Enter tag short code"
                  autoComplete="off"
                />
              </Form.Item>
              {tagVerifyLoading && (
                <Alert
                  type="info"
                  showIcon
                  message="Verifying tag short code..."
                />
              )}
              {tagVerifySuccess && verifiedTag && (
                <Alert
                  type="success"
                  showIcon
                  message={tagVerifySuccess}
                  description={
                    <div className="text-sm">
                      <div>
                        <span className="font-semibold">Short Code:</span>{" "}
                        {verifiedTag.shortCode}
                      </div>
                      <div>
                        <span className="font-semibold">Status:</span>{" "}
                        {verifiedTag.status ?? "—"}
                      </div>
                      <div>
                        <span className="font-semibold">Batch:</span>{" "}
                        {verifiedTag.batchName ?? "—"}
                      </div>
                      <div>
                        <span className="font-semibold">Owner:</span>{" "}
                        {verifiedTag.ownerFullName ?? "—"}
                      </div>
                      <div>
                        <span className="font-semibold">Owner Phone:</span>{" "}
                        {verifiedTag.ownerPhone ?? "—"}
                      </div>
                      <div>
                        <span className="font-semibold">Assigned Partner:</span>{" "}
                        {assignedSalesPersonDetails
                          ? `${assignedSalesPersonDetails.name || assignedSalesPersonDetails.fullName || "—"}`
                          : verifiedTag.assignedTo || "—"}
                      </div>
                    </div>
                  }
                />
              )}
              {tagVerifyError && (
                <Alert type="error" showIcon message={tagVerifyError} />
              )}
            </div>

            <Form.Item
              name="saleDate"
              label="Sale Date"
              rules={[{ required: true, message: "Please select sale date" }]}
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Select Sale Date"
              />
            </Form.Item>

            <Form.Item
              name="SalesPerson"
              label="Sales Person"
              rules={[{ required: true, message: "Please select sales person" }]}
            >
              {currentUserRole === "Affiliate" ? (
                <Input
                  value={selectedSalesPersonId || currentUserId || ""}
                  disabled
                  placeholder="Current User (Affiliate)"
                />
              ) : (
                <Select
                  placeholder="Select Sales Person"
                  loading={loadingSalesPersons}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  options={salesPersons.map((person) => ({
                    value: person._id || "",
                    label: `${person.name || person.fullName || "Unknown"} ${person.email ? `(${person.email})` : ""}`,
                  }))}
                />
              )}
            </Form.Item>

            <Form.Item
              name="salesPersonRole"
              label="Sales Person Role"
              rules={[{ required: true, message: "Please select role" }]}
            >
              <Select
                placeholder="Select Role"
                options={[
                  { value: "Affiliate", label: "Affiliate" },
                  { value: "Support Admin", label: "Support Admin" },
                  { value: "Admin", label: "Admin" },
                  { value: "Super Admin", label: "Super Admin" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="owner"
              hidden
              rules={[{ required: true, message: "Owner is required" }]}
            >
              <Input type="hidden" />
            </Form.Item>
            <Form.Item label="Owner" required>
              <div className="space-y-2">
                <Input
                  value={verifiedTag?.ownerFullName ?? ""}
                  disabled
                  placeholder="Owner will auto-fill after tag verification"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {verifiedTag?.ownerPhone && (
                    <span className="mr-4">Phone: {verifiedTag.ownerPhone}</span>
                  )}
                  {verifiedTag?.ownerEmail && <span>Email: {verifiedTag.ownerEmail}</span>}
                </div>
              </div>
            </Form.Item>

            <Form.Item
              name="saleType"
              label="Sale Type"
              rules={[{ required: true, message: "Please select sale type" }]}
            >
              <Select
                placeholder="Select Sale Type"
                options={[
                  { value: "online", label: "Online" },
                  { value: "offline", label: "Offline" },
                  { value: "not-confirmed", label: "Not Confirmed" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="totalSaleAmount"
              label="Total Sale Amount (₹)"
              rules={[
                { required: true, message: "Please enter total sale amount" },
                { type: "number", min: 0, message: "Amount must be positive" },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="Enter Total Sale Amount"
                prefix="₹"
                min={0}
                step={100}
                onChange={() => handleCommissionCalculation()}
              />
            </Form.Item>

            <Form.Item
              name="castAmountOfProductAndServices"
              label="Cost Amount (₹)"
              rules={[
                { required: true, message: "Please enter cost amount" },
                { type: "number", min: 0, message: "Amount must be positive" },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="Enter Cost Amount"
                prefix="₹"
                min={0}
                step={100}
              />
            </Form.Item>

            <Form.Item
              name="commisionAmountOfSalesPerson"
              label="Sales Person Commission (₹)"
              rules={[
                { required: true, message: "Please enter commission amount" },
                { type: "number", min: 0, message: "Amount must be positive" },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="Enter Commission Amount"
                prefix="₹"
                min={0}
                step={10}
              />
            </Form.Item>

            <Form.Item
              name="commisionAmountOfOwner"
              label="Owner Commission (₹)"
              rules={[
                { required: true, message: "Please enter owner commission" },
                { type: "number", min: 0, message: "Amount must be positive" },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="Enter Owner Commission"
                prefix="₹"
                min={0}
                step={10}
              />
            </Form.Item>

            <Form.Item
              name="paymentStatus"
              label="Payment Status"
              rules={[{ required: true, message: "Please select payment status" }]}
            >
              <Select
                placeholder="Select Payment Status"
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="varificationStatus"
              label="Verification Status"
              rules={[{ required: true, message: "Please select verification status" }]}
            >
              <Select
                placeholder="Select Verification Status"
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="message"
              label="Message"
              className="md:col-span-2"
            >
              <TextArea
                rows={3}
                placeholder="Enter any additional message or notes"
              />
            </Form.Item>

            <Form.Item
              name="paymentImageOrScreenShot"
              label="Payment Image/Screenshot URL"
              className="md:col-span-2"
            >
              <Input
                placeholder="Enter payment image URL (optional)"
              />
            </Form.Item>
          </div>

          <Form.Item className="mt-6">
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Sale
              </Button>
              <Button onClick={() => navigate("/sales")}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddSale;

