import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useShortMutations } from "../../hooks/useShorts";
import { ShortPayload } from "../../types/shorts";
import { sanitiseHashtags, SHORT_STATUS_OPTIONS } from "../../utils/shorts";

const { Title, Paragraph } = Typography;

interface ShortFormValues extends ShortPayload {}

const CreateShort = () => {
  const [form] = Form.useForm<ShortFormValues>();
  const navigate = useNavigate();
  const { createShort, isSubmitting } = useShortMutations();

  const handleFinish = async (values: ShortFormValues) => {
    const payload: ShortPayload = {
      title: values.title.trim(),
      description: values.description?.trim() ?? "",
      videoUrl: values.videoUrl.trim(),
      thumbnail: values.thumbnail?.trim() || undefined,
      duration: values.duration,
      hashtags: sanitiseHashtags(values.hashtags ?? []),
      status: values.status ?? "published",
    };

    const result = await createShort(payload);
    if (result?._id) {
      navigate("/shorts");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="max-w-4xl mx-auto shadow-lg" bordered={false}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={3} className="!mb-1">
              Create Short
            </Title>
            <Paragraph type="secondary" className="!mb-0">
              Upload a new vertical video to appear in the Shorts feed.
            </Paragraph>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <Form<ShortFormValues>
          layout="vertical"
          form={form}
          initialValues={{ status: "published", duration: 30, hashtags: [] }}
          onFinish={handleFinish}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input placeholder="Enter an engaging title" maxLength={120} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={4}
              placeholder="Optional description to give more context"
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
              placeholder="Add hashtags (press enter to add)"
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
              <Button onClick={() => navigate("/shorts")}>Cancel</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                htmlType="submit"
                loading={isSubmitting}
              >
                Save Short
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateShort;

