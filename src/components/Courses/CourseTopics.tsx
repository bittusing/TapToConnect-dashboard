import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Table, Tag, Space, Modal, Input, InputNumber } from "antd";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import TextAreaCustom from "../FormElements/TextArea/TextAreaCustom";
import MiniLoader from "../CommonUI/Loader/MiniLoader";

interface Topic {
  key: string;
  title: string;
  description: string;
  order: number;
}

interface CourseTopicsProps {
  courseId: string;
}

const CourseTopics: React.FC<CourseTopicsProps> = ({ courseId }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 1,
  });

  useEffect(() => {
    if (courseId) {
      fetchTopics();
    }
  }, [courseId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await API.getAuthAPI(`${END_POINT.COURSES}/${courseId}/topics`, true);
      if (response.error) throw new Error(response.error);
      
      const topicsList = (response.data || []).map((topic: any) => ({
        key: topic._id || topic.id,
        title: topic.title,
        description: topic.description,
        order: topic.order,
      }));
      setTopics(topicsList);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch topics");
      // Keep mock data as fallback
      const mockTopics: Topic[] = [
        {
          key: "1",
          title: "Introduction",
          description: "Introduction to the course",
          order: 1,
        },
      ];
      setTopics(mockTopics);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = () => {
    setEditingTopic(null);
    setFormData({ title: "", description: "", order: topics.length + 1 });
    setModalVisible(true);
  };

  const handleEditTopic = (record: Topic) => {
    setEditingTopic(record);
    setFormData({
      title: record.title,
      description: record.description,
      order: record.order,
    });
    setModalVisible(true);
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      const response = await API.DeleteAuthAPI(topicId, `${END_POINT.COURSES}/${courseId}/topics`, true);
      if (response.error) throw new Error(response.error);
      toast.success("Topic deleted successfully");
      fetchTopics();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete topic");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        order: formData.order,
      };

      if (editingTopic) {
        const response = await API.updateAuthAPI(payload, editingTopic.key, `${END_POINT.COURSES}/${courseId}/topics`, true);
        if (response.error) throw new Error(response.error);
        toast.success("Topic updated successfully");
      } else {
        const response = await API.postAuthAPI(payload, `${END_POINT.COURSES}/${courseId}/topics`, true);
        if (response.error) throw new Error(response.error);
        toast.success("Topic created successfully");
      }

      setModalVisible(false);
      fetchTopics();
    } catch (error: any) {
      toast.error(error.message || "Failed to save topic");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Order",
      dataIndex: "order",
      key: "order",
      width: 80,
      sorter: (a: Topic, b: Topic) => a.order - b.order,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: Topic) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditTopic(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteTopic(record.key)} />
        </Space>
      ),
    },
  ];

  if (loading && topics.length === 0) return <MiniLoader />;

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Course Topics</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTopic}>
          Add Topic
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={topics}
        loading={loading}
        pagination={false}
        size="small"
      />

      <Modal
        title={editingTopic ? "Edit Topic" : "Add Topic"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText={editingTopic ? "Update" : "Create"}
        width={600}
        okButtonProps={{ loading }}
      >
        <div className="space-y-4 py-4">
          <Input
            placeholder="Topic title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextAreaCustom
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Topic description"
            rows={4}
          />
          <InputNumber
            placeholder="Order"
            value={formData.order}
            onChange={(value) => setFormData({ ...formData, order: value || 1 })}
            min={1}
            className="w-full"
          />
        </div>
      </Modal>
    </div>
  );
};

export default CourseTopics;

