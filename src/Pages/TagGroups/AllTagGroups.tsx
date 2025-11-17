import { useState, useEffect, useMemo } from "react";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Tag as AntdTag, Space, Modal, Input, InputNumber, ColorPicker, Checkbox, Card, Divider } from "antd";
import TextAreaCustom from "../../components/FormElements/TextArea/TextAreaCustom";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

interface TagGroupData {
  key: string;
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  tagCount: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  tagValues?: string[];
}

interface TagOption {
  _id: string;
  name: string;
  tagValue: string;
  color: string;
}

const AllTagGroups = () => {
  const navigate = useNavigate();
  const [tagGroups, setTagGroups] = useState<TagGroupData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTagGroup, setEditingTagGroup] = useState<TagGroupData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#3B82F6",
    order: 1,
    isActive: true,
    tagValues: [] as string[],
  });
  const [availableTags, setAvailableTags] = useState<TagOption[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setPagination({ ...pagination, current: 1 });
      fetchTagGroups(term);
    }, 500),
    [pagination]
  );

  const fetchTagGroups = async (search: string = "") => {
    setLoading(true);
    try {
      const response = await API.getAuthAPI(END_POINT.TAG_GROUPS, true, { search, page: pagination.current, limit: pagination.pageSize });
      if (response.error) throw new Error(response.error);
      
      const tagGroupsData = response?.data?.groups || response?.data || [];
      const tagGroupsList = (Array.isArray(tagGroupsData) ? tagGroupsData : []).map((group: any) => ({
        key: group._id || group.id,
        _id: group._id || group.id,
        name: group.name,
        slug: group.slug,
        description: group.description || "",
        icon: group.icon || "",
        color: group.color || "#3B82F6",
        tagCount: group.tagCount || (group.tagValues?.length || 0),
        order: group.order || 1,
        isActive: group.isActive !== undefined ? group.isActive : true,
        createdAt: group.createdAt,
        tagValues: group.tagValues || [],
      }));
      
      setTagGroups(tagGroupsList);
      setPagination({ ...pagination, total: response?.data?.pagination?.total || tagGroupsList.length });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch tag groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTags = async () => {
    setLoadingTags(true);
    try {
      const response = await API.getAuthAPI(END_POINT.TAGS, true);
      if (response.error) throw new Error(response.error);
      
      const tagsData = response?.data?.tags || response?.data || [];
      const tagsList = (Array.isArray(tagsData) ? tagsData : []).map((tag: any) => ({
        _id: tag._id || tag.id,
        name: tag.name,
        tagValue: tag.tagValue || tag.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        color: tag.color || "#3B82F6",
      }));
      
      setAvailableTags(tagsList);
    } catch (error: any) {
      console.error("Failed to fetch tags:", error);
      toast.error("Failed to load tags");
    } finally {
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    fetchTagGroups();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      fetchTagGroups();
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleAddTagGroup = async () => {
    await fetchAvailableTags();
    setEditingTagGroup(null);
    setFormData({
      name: "",
      description: "",
      icon: "",
      color: "#3B82F6",
      order: 1,
      isActive: true,
      tagValues: [],
    });
    setModalVisible(true);
  };

  const handleEditTagGroup = async (record: TagGroupData) => {
    await fetchAvailableTags();
    setEditingTagGroup(record);
    setFormData({
      name: record.name,
      description: record.description,
      icon: record.icon,
      color: record.color,
      order: record.order,
      isActive: record.isActive,
      tagValues: record.tagValues || [],
    });
    setModalVisible(true);
  };

  const handleDeleteTagGroup = async (tagGroupId: string) => {
    if (!window.confirm("Are you sure you want to delete this tag group?")) return;
    
    try {
      const response = await API.DeleteAuthAPI(tagGroupId, END_POINT.TAG_GROUPS, true);
      if (response.error) throw new Error(response.error);
      toast.success("Tag group deleted successfully");
      fetchTagGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tag group");
    }
  };

  const handleTagValueChange = (tagValue: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          tagValues: [...prev.tagValues, tagValue],
        };
      } else {
        return {
          ...prev,
          tagValues: prev.tagValues.filter((v) => v !== tagValue),
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Tag group name is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon.trim(),
        color: formData.color,
        order: formData.order,
        isActive: formData.isActive,
        tagValues: formData.tagValues,
      };

      if (editingTagGroup) {
        const response = await API.updateAuthAPI(payload, editingTagGroup._id, END_POINT.TAG_GROUPS, true);
        if (response.error) throw new Error(response.error);
        toast.success("Tag group updated successfully");
      } else {
        const response = await API.postAuthAPI(payload, END_POINT.TAG_GROUPS, true);
        if (response.error) throw new Error(response.error);
        toast.success("Tag group created successfully");
      }

      setModalVisible(false);
      fetchTagGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to save tag group");
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
      sorter: (a: TagGroupData, b: TagGroupData) => a.order - b.order,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: TagGroupData) => (
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
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug: string) => <span className="text-gray-500 text-sm">{slug}</span>,
    },
    {
      title: "Tags Count",
      dataIndex: "tagCount",
      key: "tagCount",
      width: 120,
      render: (count: number) => <AntdTag color="blue">{count}</AntdTag>,
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
      render: (_: any, record: TagGroupData) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditTagGroup(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteTagGroup(record._id)} />
        </Space>
      ),
    },
  ];

  if (loading && tagGroups.length === 0) return <MiniLoader />;

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tag Groups</h1>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTagGroup}>
                Add Tag Group
              </Button>
            </div>

            <CustomAntdTable
              columns={columns}
              dataSource={tagGroups}
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
        title={editingTagGroup ? "Edit Tag Group" : "Add Tag Group"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        okText={editingTagGroup ? "Update" : "Create"}
        width={800}
        okButtonProps={{ loading }}
      >
        <div className="space-y-4 py-4">
          <Input
            placeholder="Tag group name (e.g., Programming Languages)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextAreaCustom
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tag group description (optional)"
            rows={3}
          />
          <Input
            placeholder="Icon name or URL (optional)"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
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
            <InputNumber
              placeholder="Order"
              value={formData.order}
              onChange={(value) => setFormData({ ...formData, order: value || 1 })}
              min={1}
              className="w-full"
            />
          </div>
          
          <Divider />
          
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Select Tags ({formData.tagValues.length} selected)
            </label>
            {loadingTags ? (
              <div className="text-center py-4">
                <MiniLoader />
              </div>
            ) : availableTags.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No tags available. Please create tags first.
              </div>
            ) : (
              <Card className="max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {availableTags.map((tag) => (
                    <div key={tag._id} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.tagValues.includes(tag.tagValue)}
                        onChange={(e) => handleTagValueChange(tag.tagValue, e.target.checked)}
                      >
                        <Space>
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 3,
                              backgroundColor: tag.color,
                              display: "inline-block",
                            }}
                          />
                          <span>{tag.name}</span>
                          <span className="text-gray-400 text-xs font-mono">({tag.tagValue})</span>
                        </Space>
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </Card>
            )}
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

export default AllTagGroups;
