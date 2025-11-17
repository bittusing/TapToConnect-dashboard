import {
  Button,
  Card,
  Descriptions,
  Space,
  Tag,
  Typography,
  Spin,
  Empty,
  Avatar,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { EditOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useShortDetails } from "../../hooks/useShorts";
import { formatDuration } from "../../utils/shorts";

const { Title, Paragraph, Text } = Typography;

const ViewShort = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();
  const { shortDetails, isLoading } = useShortDetails(shortId ?? null);

  if (!shortId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Empty description="Short ID is missing" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="max-w-5xl mx-auto shadow-lg" bordered={false}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <Title level={3} className="!mb-1">
              Short Details
            </Title>
            <Paragraph type="secondary" className="!mb-0">
              Review the metadata and performance for this short video.
            </Paragraph>
          </div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/shorts/${shortId}/edit`)}
            >
              Edit Short
            </Button>
          </Space>
        </div>

        {isLoading && !shortDetails ? (
          <div className="py-16 flex justify-center">
            <Spin size="large" />
          </div>
        ) : shortDetails ? (
          <Space direction="vertical" size="large" className="w-full">
            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
              {shortDetails.videoUrl ? (
                <video
                  src={shortDetails.videoUrl}
                  controls
                  className="w-full max-h-[520px] bg-black object-contain"
                />
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                  <Text type="secondary">Video preview unavailable</Text>
                </div>
              )}
            </div>

            <Descriptions
              bordered
              column={1}
              labelStyle={{ width: "180px" }}
              contentStyle={{ backgroundColor: "inherit" }}
            >
              <Descriptions.Item label="Title">
                <Text strong>{shortDetails.title}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {shortDetails.description || "No description provided"}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {formatDuration(shortDetails.duration)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={shortDetails.status === "published" ? "green" : shortDetails.status === "draft" ? "gold" : "red"}>
                  {shortDetails.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Published At">
                {shortDetails.publishedAt
                  ? new Date(shortDetails.publishedAt).toLocaleString()
                  : "Not published"}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(shortDetails.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {new Date(shortDetails.updatedAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Hashtags">
                <Space size={[4, 4]} wrap>
                  {shortDetails.hashtags.length ? (
                    shortDetails.hashtags.map((tag) => (
                      <Tag key={tag} color="blue">
                        #{tag}
                      </Tag>
                    ))
                  ) : (
                    <Text type="secondary">None</Text>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Creator">
                {shortDetails.creator ? (
                  <Space>
                    <Avatar src={shortDetails.creator.profilePic}>
                      {shortDetails.creator.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                      <Text strong>{shortDetails.creator.name}</Text>
                      <Paragraph className="!mb-0 text-xs text-gray-500 dark:text-gray-400">
                        {shortDetails.creator.role}
                      </Paragraph>
                    </div>
                  </Space>
                ) : (
                  <Text type="secondary">Unknown</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Performance">
                <Space size="large">
                  <div>
                    <Text strong className="block">
                      {shortDetails.viewCount ?? 0}
                    </Text>
                    <Text type="secondary">Views</Text>
                  </div>
                  <div>
                    <Text strong className="block">
                      {shortDetails.likeCount ?? 0}
                    </Text>
                    <Text type="secondary">Likes</Text>
                  </div>
                  <div>
                    <Text strong className="block">
                      {shortDetails.shareCount ?? 0}
                    </Text>
                    <Text type="secondary">Shares</Text>
                  </div>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Space>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Text type="secondary">We could not find this short.</Text>}
          />
        )}
      </Card>
    </div>
  );
};

export default ViewShort;




