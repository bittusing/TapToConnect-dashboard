import { useState, useEffect, useMemo } from "react";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Tag as AntdTag, Space, Modal, Input, ColorPicker } from "antd";
import TextAreaCustom from "../../components/FormElements/TextArea/TextAreaCustom";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

interface TagData {
  key: string;
  _id: string;
  name: string;
  tagValue: string;
  description: string;
  color: string;
  courseCount: number;
  isActive: boolean;
  createdAt: string;
}

const AllTags = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    isActive: true,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Generate tagValue from name (auto-generated on backend, but show here for reference)
  const generateTagValue = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .trim();
  };

  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setPagination({ ...pagination, current: 1 });
      fetchTags(term);
    }, 500),
    [pagination]
  );

  const fetchTags = async (search: string = "") => {
    setLoading(true);
    try {
      const params: any = { search, page: pagination.current, limit: pagination.pageSize };
      const response = await API.getAuthAPI(END_POINT.TAGS, true, params);
      if (response.error) throw new Error(response.error);
      
      const tagsData = response?.data?.tags || response?.data || [];
      const tagsList = (Array.isArray(tagsData) ? tagsData : []).map((tag: any) => ({
        key: tag._id || tag.id,
        _id: tag._id || tag.id,
        name: tag.name,
        tagValue: tag.tagValue || generateTagValue(tag.name),
        description: tag.description || "",
        color: tag.color || "#3B82F6",
        courseCount: tag.courseCount || 0,
        isActive: tag.isActive !== undefined ? tag.isActive : true,
        createdAt: tag.createdAt,
      }));
      
      setTags(tagsList);
      setPagination({ ...pagination, total: response?.data?.pagination?.total || tagsList.length });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      fetchTags();
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleAddTag = () => {
    setEditingTag(null);
    setFormData({
      name: "",
      description: "",
      color: "#3B82F6",
      isActive: true,
    });
    setModalVisible(true);
  };

  const handleEditTag = (record: TagData) => {
    setEditingTag(record);
    setFormData({
      name: record.name,
      description: record.description,
      color: record.color,
      isActive: record.isActive,
    });
    setModalVisible(true);
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;
    
    try {
      const response = await API.DeleteAuthAPI(tagId, END_POINT.TAGS, true);
      if (response.error) throw new Error(response.error);
      toast.success("Tag deleted successfully");
      fetchTags(searchTerm);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tag");
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        color: formData.color,
        isActive: formData.isActive,
      };

      if (editingTag) {
        const response = await API.updateAuthAPI(payload, editingTag._id, END_POINT.TAGS, true);
        if (response.error) throw new Error(response.error);
        toast.success("Tag updated successfully");
      } else {
        const response = await API.postAuthAPI(payload, END_POINT.TAGS, true);
        if (response.error) throw new Error(response.error);
        toast.success("Tag created successfully");
      }

      setModalVisible(false);
      fetchTags(searchTerm);
    } catch (error: any) {
      toast.error(error.message || "Failed to save tag");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: TagData) => (
        <Space>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: record.color,
              display: "inline-block",
              marginRight: 8,
            }}
          />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Tag Value",
      dataIndex: "tagValue",
      key: "tagValue",
      render: (tagValue: string) => (
        <span className="text-gray-500 text-sm font-mono">{tagValue}</span>
      ),
    },
    {
      title: "Courses/EBooks",
      dataIndex: "courseCount",
      key: "courseCount",
      width: 120,
      render: (count: number) => <AntdTag color="green">{count}</AntdTag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <AntdTag color={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</AntdTag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: TagData) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditTag(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteTag(record._id)} />
        </Space>
      ),
    },
  ];

  if (loading && tags.length === 0) return <MiniLoader />;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tags</h1>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTag}>
                Add Tag
              </Button>
            </div>

            <CustomAntdTable
              columns={columns}
              dataSource={tags}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              pagination={pagination}
              setPagination={setPagination}
            />
          </div>
        </div>
      </div>

      <Modal
        title={editingTag ? "Edit Tag" : "Add Tag"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText={editingTag ? "Update" : "Create"}
        width={700}
        okButtonProps={{ loading }}
      >
        <div className="space-y-4 py-4">
          <div>
            <Input
              placeholder="Tag name (e.g., Node.js)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formData.name && (
              <p className="mt-1 text-xs text-gray-500">
                Tag Value (auto-generated): <code className="font-mono">{generateTagValue(formData.name)}</code>
              </p>
            )}
          </div>
          <TextAreaCustom
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tag description (optional)"
            rows={3}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Color
            </label>
            <ColorPicker
              value={formData.color}
              onChange={(color) => setFormData({ ...formData, color: color.toHexString() })}
              showText
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Active
            </label>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AllTags;

