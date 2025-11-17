import { useEffect } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
  Spin,
  Empty,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useShortDetails, useShortMutations } from "../../hooks/useShorts";
import { ShortPayload } from "../../types/shorts";
import { sanitiseHashtags, SHORT_STATUS_OPTIONS } from "../../utils/shorts";

const { Title, Paragraph, Text } = Typography;

interface ShortFormValues extends ShortPayload {}

const EditShort = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const { shortDetails, isLoading } = useShortDetails(shortId ?? null);
  const { updateShort, isSubmitting } = useShortMutations();
  const [form] = Form.useForm<ShortFormValues>();

  useEffect(() => {
    if (shortDetails) {
      form.setFieldsValue({
        title: shortDetails.title,
        description: shortDetails.description ?? "",
        videoUrl: shortDetails.videoUrl,
        thumbnail: shortDetails.thumbnail ?? "",
        duration: shortDetails.duration,
        hashtags: shortDetails.hashtags,
        status: shortDetails.status,
      });
    }
  }, [form, shortDetails]);

  const handleFinish = async (values: ShortFormValues) => {
    if (!shortId) return;

    const payload: Partial<ShortPayload> = {
      title: values.title.trim(),
      description: values.description?.trim() ?? "",
      videoUrl: values.videoUrl.trim(),
      thumbnail: values.thumbnail?.trim() || undefined,
      duration: values.duration,
      hashtags: sanitiseHashtags(values.hashtags ?? []),
      status: values.status ?? shortDetails?.status,
    };

    const result = await updateShort(shortId, payload);
    if (result?._id) {
      navigate(`/shorts/${shortId}/view`);
    }
  };

  if (!shortId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Empty description="Short ID is missing" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="max-w-4xl mx-auto shadow-lg" bordered={false}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={3} className="!mb-1">
              Edit Short
            </Title>
            <Paragraph type="secondary" className="!mb-0">
              Update the metadata or status for this short video.
            </Paragraph>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        {isLoading && !shortDetails ? (
          <div className="py-16 flex justify-center">
            <Spin size="large" />
          </div>
        ) : shortDetails ? (
          <Form<ShortFormValues>
            layout="vertical"
            form={form}
            onFinish={handleFinish}
          >
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Title is required" }]}
            >
              <Input placeholder="Enter short title" maxLength={120} />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea
                rows={4}
                placeholder="Optional description"
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              label="Video URL"
              name="videoUrl"
              rules={[
                { required: true, message: "Video URL is required" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input placeholder="https://cdn.example.com/shorts/video.mp4" />
            </Form.Item>

            <Form.Item
              label="Thumbnail URL"
              name="thumbnail"
              rules={[{ type: "url", message: "Please enter a valid URL" }]}
            >
              <Input placeholder="https://cdn.example.com/shorts/thumbnail.jpg" />
            </Form.Item>

            <Form.Item
              label="Duration (seconds)"
              name="duration"
              rules={[{ required: true, message: "Duration is required" }]}
            >
              <InputNumber
                min={1}
                max={300}
                className="w-full"
                placeholder="Enter video length"
              />
            </Form.Item>

            <Form.Item label="Hashtags" name="hashtags">
              <Select
                mode="tags"
                tokenSeparators={[",", " "]}
                placeholder="Update hashtags"
              />
            </Form.Item>

            <Form.Item label="Status" name="status">
              <Select
                options={SHORT_STATUS_OPTIONS.map(({ label, value }) => ({
                  label,
                  value,
                }))}
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end gap-3">
                <Button onClick={() => navigate(`/shorts/${shortId}/view`)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={isSubmitting}
                >
                  Save Changes
                </Button>
              </div>
            </Form.Item>
          </Form>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary">We could not find this short.</Text>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default EditShort;




