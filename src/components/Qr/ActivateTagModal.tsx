import { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Steps, message, Checkbox, Space } from "antd";
import { CheckCircleOutlined, PhoneOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  requestActivationOtp,
  confirmTagActivation,
} from "../../services/qrAdminService";
import {
  RequestOtpResponse,
  ConfirmActivationRequest,
  ConfirmActivationResponse,
} from "../../types/qr";

interface ActivateTagModalProps {
  open: boolean;
  onClose: () => void;
  shortCode: string;
  onSuccess?: () => void;
}

const { Step } = Steps;

const ActivateTagModal = ({
  open,
  onClose,
  shortCode,
  onSuccess,
}: ActivateTagModalProps) => {
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpResponse, setOtpResponse] = useState<RequestOtpResponse | null>(
    null
  );

  // Auto-fill OTP when otpResponse is received
  useEffect(() => {
    if (otpResponse?.otp && currentStep === 1) {
      // Set OTP in the form with a small delay to ensure form is ready
      setTimeout(() => {
        otpForm.setFieldsValue({ otp: otpResponse.otp });
      }, 100);
    }
  }, [otpResponse, currentStep, otpForm]);

  const handleRequestOtp = async () => {
    try {
      const values = await form.validateFields(["phone"]);
      setLoading(true);

      const response = await requestActivationOtp({
        shortCode,
        phone: values.phone,
      });

      setOtpResponse(response);
      message.success(response.message || "OTP sent successfully");
      
      // Move to next step
      setCurrentStep(1);
      
      // Pre-fill OTP immediately
      if (response.otp) {
        // Use setTimeout to ensure form is ready after step change
        setTimeout(() => {
          otpForm.setFieldsValue({ otp: response.otp });
        }, 200);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmActivation = async () => {
    try {
      const values = await otpForm.validateFields();
      setLoading(true);

      const payload: ConfirmActivationRequest = {
        shortCode,
        otp: values.otp,
        fullName: values.fullName,
        phone: form.getFieldValue("phone"),
        vehicleNumber: values.vehicleNumber,
        vehicleType: values.vehicleType,
        email: values.email,
        city: values.city,
        preferences: {
          sms: values.sms ?? true,
          whatsapp: values.whatsapp ?? true,
          call: values.call ?? true,
        },
      };

      const response: ConfirmActivationResponse = await confirmTagActivation(
        payload
      );

      message.success(response.message || "Tag activated successfully");
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to activate tag";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    otpForm.resetFields();
    setCurrentStep(0);
    setOtpResponse(null);
    onClose();
  };

  return (
    <Modal
      title={`Activate Tag: ${shortCode}`}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Steps current={currentStep} className="mb-6">
        <Step title="Request OTP" icon={<PhoneOutlined />} />
        <Step title="Confirm Activation" icon={<CheckCircleOutlined />} />
      </Steps>

      {currentStep === 0 && (
        <Form form={form} layout="vertical" onFinish={handleRequestOtp}>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: "Phone number is required" },
              {
                pattern: /^[0-9]{10}$/,
                message: "Please enter a valid 10-digit phone number",
              },
            ]}
          >
            <Input
              placeholder="Enter 10-digit phone number"
              prefix={<PhoneOutlined />}
              maxLength={10}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Send OTP
              </Button>
              <Button onClick={handleClose}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      )}

      {currentStep === 1 && (
        <Form form={otpForm} layout="vertical" onFinish={handleConfirmActivation}>
          {otpResponse?.otp && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>OTP:</strong> {otpResponse.otp}
              </p>
              {otpResponse.expiresAt && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Expires at: {new Date(otpResponse.expiresAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          <Form.Item
            name="otp"
            label="OTP"
            rules={[
              { required: true, message: "OTP is required" },
              {
                pattern: /^[0-9]{6}$/,
                message: "OTP must be 6 digits",
              },
            ]}
          >
            <Input 
              placeholder={otpResponse?.otp ? `OTP: ${otpResponse.otp}` : "Enter 6-digit OTP"} 
              maxLength={6}
              className={otpResponse?.otp ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700" : ""}
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: "Full name is required" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            name="vehicleNumber"
            label="Vehicle Number"
            rules={[
              { required: true, message: "Vehicle number is required" },
            ]}
          >
            <Input placeholder="e.g., UP32AB1234" />
          </Form.Item>

          <Form.Item
            name="vehicleType"
            label="Vehicle Type"
            rules={[{ required: true, message: "Vehicle type is required" }]}
          >
            <Input placeholder="e.g., car, bike, truck" />
          </Form.Item>

          <Form.Item name="email" label="Email (Optional)">
            <Input type="email" placeholder="Enter email address" />
          </Form.Item>

          <Form.Item name="city" label="City (Optional)">
            <Input placeholder="Enter city" />
          </Form.Item>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Notification Preferences
            </label>
            <Space direction="vertical">
              <Form.Item name="sms" valuePropName="checked" noStyle>
                <Checkbox>SMS</Checkbox>
              </Form.Item>
              <Form.Item name="whatsapp" valuePropName="checked" noStyle>
                <Checkbox>WhatsApp</Checkbox>
              </Form.Item>
              <Form.Item name="call" valuePropName="checked" noStyle>
                <Checkbox>Call</Checkbox>
              </Form.Item>
            </Space>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Activate Tag
              </Button>
              <Button onClick={() => setCurrentStep(0)}>Back</Button>
              <Button onClick={handleClose}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ActivateTagModal;

