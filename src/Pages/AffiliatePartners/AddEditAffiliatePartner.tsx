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
  InputNumber,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  getAffiliatePartnerById,
  createAffiliatePartner,
  updateAffiliatePartner,
} from "../../services/affiliatePartnerService";
import { AffiliatePartner } from "../../types/qr";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

const { Option } = Select;

const AddEditAffiliatePartner = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode && id) {
      const fetchPartner = async () => {
        setLoading(true);
        setError(null);
        try {
          const partner = await getAffiliatePartnerById(id);
          form.setFieldsValue({
            name: partner.name,
            email: partner.email,
            phone: partner.phone,
            company: partner.companyName || partner.company || "",
            address: partner.address || "",
            city: partner.city || "",
            state: partner.state || "",
            pincode: partner.pincode || "",
            commissionRate: partner.commissionPercentage || partner.commissionRate || 0,
            status: partner.status || (partner.isActive ? "active" : "inactive"),
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Failed to load partner";
          setError(message);
          toast.error(message);
        } finally {
          setLoading(false);
        }
      };

      void fetchPartner();
    }
  }, [id, isEditMode, form]);

  const handleSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    commissionRate?: number;
    status?: "active" | "inactive" | "suspended";
  }) => {
    setSaving(true);
    try {
      if (isEditMode && id) {
        await updateAffiliatePartner(id, values);
        toast.success("Partner updated successfully");
      } else {
        await createAffiliatePartner(values);
        toast.success("Partner created successfully");
      }
      navigate("/affiliate-partners");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save partner";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <MiniLoader />;
  }

  if (error && isEditMode) {
    return (
      <div className="space-y-6">
        <Card className="shadow-1 dark:bg-gray-dark dark:text-white">
          <Alert
            message="Error"
            description={error}
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
              {isEditMode ? "Edit Affiliate Partner" : "Add Affiliate Partner"}
            </h1>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "active",
            commissionRate: 0,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: "Name is required" }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input type="email" placeholder="Enter email address" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: "Phone is required" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Please enter a valid 10-digit phone number",
                },
              ]}
            >
              <Input placeholder="Enter 10-digit phone number" maxLength={10} />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                ...(isEditMode ? [] : [{ required: true, message: "Password is required" }]),
                {
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
              ]}
            >
              <Input.Password 
                placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"} 
              />
            </Form.Item>

            <Form.Item name="company" label="Company (Optional)">
              <Input placeholder="Enter company name" />
            </Form.Item>

            <Form.Item name="address" label="Address (Optional)">
              <Input.TextArea rows={2} placeholder="Enter address" />
            </Form.Item>

            <Form.Item name="city" label="City (Optional)">
              <Input placeholder="Enter city" />
            </Form.Item>

            <Form.Item name="state" label="State (Optional)">
              <Input placeholder="Enter state" />
            </Form.Item>

            <Form.Item
              name="pincode"
              label="Pincode (Optional)"
              rules={[
                {
                  pattern: /^[0-9]{6}$/,
                  message: "Please enter a valid 6-digit pincode",
                },
              ]}
            >
              <Input placeholder="Enter 6-digit pincode" maxLength={6} />
            </Form.Item>

            <Form.Item
              name="commissionRate"
              label="Commission Rate (%)"
              rules={[
                { required: true, message: "Commission rate is required" },
                {
                  type: "number",
                  min: 0,
                  max: 100,
                  message: "Commission rate must be between 0 and 100",
                },
              ]}
            >
              <InputNumber
                placeholder="Enter commission rate"
                min={0}
                max={100}
                className="w-full"
                formatter={(value) => `${value}%`}
                parser={(value) => value?.replace("%", "") || ""}
              />
            </Form.Item>

            {!isEditMode && (
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Status is required" }]}
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="suspended">Suspended</Option>
                </Select>
              </Form.Item>
            )}
            {isEditMode && (
              <Form.Item
                name="status"
                label="Status (Read-only)"
                tooltip="Status cannot be changed via edit. Contact admin to change status."
              >
                <Select placeholder="Select status" disabled>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="suspended">Suspended</Option>
                </Select>
              </Form.Item>
            )}
          </div>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                {isEditMode ? "Update Partner" : "Create Partner"}
              </Button>
              <Button onClick={() => navigate("/affiliate-partners")}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddEditAffiliatePartner;

