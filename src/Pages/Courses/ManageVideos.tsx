import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Modal, Form, Input, InputNumber, Switch } from "antd";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

interface Video {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPreview: boolean;
  status: string;
}

const ManageVideos = () => {
  const { courseId, topicId } = useParams<{ courseId: string; topicId: string }>();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (courseId && topicId) {
      fetchVideos();
    }
  }, [courseId, topicId]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API endpoint
      // const { data, error } = await API.getAuthAPI(`courses/${courseId}/topics/${topicId}/videos`, true);
      // if (error) throw new Error(error);
      
      // Mock data
      const mockVideos: Video[] = [];
      setVideos(mockVideos);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingVideo(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    form.setFieldsValue({
      ...video,
      duration: video.duration / 60, // Convert seconds to minutes
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Replace with actual API endpoint
      // await API.DeleteAuthAPI(id, `courses/${courseId}/topics/${topicId}/videos`, true);
      toast.success("Video deleted successfully");
      fetchVideos();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete video");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        course: courseId,
        topic: topicId,
        duration: Math.round(values.duration * 60), // Convert minutes to seconds
      };

      if (editingVideo) {
        // TODO: Update API
        // await API.putAuthAPI(payload, `courses/${courseId}/topics/${topicId}/videos/${editingVideo._id}`, true);
        toast.success("Video updated successfully");
      } else {
        // TODO: Create API
        // const { data } = await API.postAuthAPI(payload, `courses/${courseId}/topics/${topicId}/videos`, true);
        toast.success("Video created successfully");
      }

      setIsModalOpen(false);
      fetchVideos();
    } catch (error: any) {
      toast.error(error.message || "Failed to save video");
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const sortedVideos = [...videos].sort((a, b) => a.order - b.order);

  if (loading && videos.length === 0) return <MiniLoader />;

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="flex items-center justify-between border-b border-stroke px-6.5 py-4 dark:border-dark-3">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Manage Videos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add video content to your topic
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="default"
            onClick={() => navigate(`/courses/${courseId}/topics`)}
          >
            Back to Topics
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Video
          </Button>
        </div>
      </div>

      <div className="p-6">
        {sortedVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No videos added yet</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Your First Video
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedVideos.map((video) => (
              <div
                key={video._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-dark-3 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded bg-gray-100 dark:bg-dark-2 font-bold">
                      {video.order}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-dark dark:text-white">{video.title}</h3>
                        {video.isPreview && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Preview
                          </span>
                        )}
                        {video.isFree && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            Free
                          </span>
                        )}
                      </div>
                      {video.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                          {video.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Duration: {formatDuration(video.duration)}</span>
                        <span>Status: {video.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(video)}
                  >
                    Edit
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(video._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedVideos.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-3">
            <Button
              type="default"
              size="large"
              onClick={() => navigate(`/courses/${courseId}/topics`)}
              style={{ width: "100%" }}
            >
              Done - Back to Topics
            </Button>
          </div>
        )}
      </div>

      <Modal
        title={editingVideo ? "Edit Video" : "Add New Video"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Video Title"
            rules={[{ required: true, message: "Please enter video title" }]}
          >
            <Input placeholder="Enter video title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Enter video description (optional)"
            />
          </Form.Item>

          <Form.Item
            name="videoUrl"
            label="Video URL"
            rules={[{ required: true, message: "Please enter video URL" }]}
          >
            <Input placeholder="https://example.com/video.mp4" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: "Please enter duration" }]}
            >
              <InputNumber
                min={0}
                placeholder="10"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              name="order"
              label="Order"
              rules={[{ required: true, message: "Please enter order" }]}
            >
              <InputNumber
                min={1}
                placeholder="1"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

          <Form.Item name="thumbnail" label="Thumbnail URL">
            <Input placeholder="https://example.com/thumbnail.jpg" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="isFree"
              label="Free Video"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="isPreview"
              label="Preview Video"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
          </div>

          <Form.Item
            name="status"
            label="Status"
            initialValue="published"
          >
            <Input placeholder="draft, published, processing" />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingVideo ? "Update" : "Create"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageVideos;

