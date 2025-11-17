import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Modal, Form, Input, InputNumber } from "antd";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

interface Topic {
  _id: string;
  title: string;
  description: string;
  order: number;
  course: string;
}

const ManageTopics = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (courseId) {
      fetchTopics();
    }
  }, [courseId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API endpoint
      // const { data, error } = await API.getAuthAPI(`courses/${courseId}/topics`, true);
      // if (error) throw new Error(error);
      
      // Mock data
      const mockTopics: Topic[] = [];
      setTopics(mockTopics);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch topics");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTopic(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    form.setFieldsValue(topic);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Replace with actual API endpoint
      // await API.DeleteAuthAPI(id, `courses/${courseId}/topics`, true);
      toast.success("Topic deleted successfully");
      fetchTopics();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete topic");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        course: courseId,
      };

      if (editingTopic) {
        // TODO: Update API
        // await API.putAuthAPI(payload, `courses/${courseId}/topics/${editingTopic._id}`, true);
        toast.success("Topic updated successfully");
      } else {
        // TODO: Create API
        // const { data } = await API.postAuthAPI(payload, `courses/${courseId}/topics`, true);
        toast.success("Topic created successfully");
      }

      setIsModalOpen(false);
      fetchTopics();
    } catch (error: any) {
      toast.error(error.message || "Failed to save topic");
    }
  };

  const sortedTopics = [...topics].sort((a, b) => a.order - b.order);

  if (loading && topics.length === 0) return <MiniLoader />;

  return (
    <div className="rounded-[10px] border border-stroke bg-white shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="flex items-center justify-between border-b border-stroke px-6.5 py-4 dark:border-dark-3">
        <div>
          <h1 className="text-2xl font-bold text-dark dark:text-white">Manage Course Topics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add topics to organize your course content
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Topic
        </Button>
      </div>

      <div className="p-6">
        {sortedTopics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No topics added yet</p>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Your First Topic
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTopics.map((topic) => (
              <div
                key={topic._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-dark-3 hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold">
                      {topic.order}
                    </span>
                    <div>
                      <h3 className="font-semibold text-dark dark:text-white">{topic.title}</h3>
                      {topic.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(topic)}
                  >
                    Edit
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(topic._id)}
                  >
                    Delete
                  </Button>
                  <Button
                    type="default"
                    onClick={() => navigate(`/courses/${courseId}/topics/${topic._id}/videos`)}
                  >
                    Manage Videos
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedTopics.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-3">
            <Button
              type="default"
              size="large"
              onClick={() => navigate("/courses")}
              style={{ width: "100%" }}
            >
              Done - Back to Courses
            </Button>
          </div>
        )}
      </div>

      <Modal
        title={editingTopic ? "Edit Topic" : "Add New Topic"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Topic Title"
            rules={[{ required: true, message: "Please enter topic title" }]}
          >
            <Input placeholder="Enter topic title" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Enter topic description (optional)"
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

          <Form.Item>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingTopic ? "Update" : "Create"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageTopics;

