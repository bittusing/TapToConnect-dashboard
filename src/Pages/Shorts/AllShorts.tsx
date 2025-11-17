import { useCallback, useMemo, useState } from "react";
import { Button, Input, Space, Tag, Tooltip, Avatar, Modal } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { useShortsList } from "../../hooks/useShorts";
import { ShortItem } from "../../types/shorts";
import { formatDuration } from "../../utils/shorts";

const STATUS_COLOR_MAP: Record<string, string> = {
  published: "green",
  draft: "gold",
  archived: "red",
};

const AllShorts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    shorts,
    pagination,
    filters,
    isLoading,
    fetchShorts,
    debouncedSearch,
    handleDelete,
  } = useShortsList();

  const dataSource = useMemo(
    () =>
      shorts.map((item) => ({
        ...item,
        key: item._id,
      })),
    [shorts]
  );

  const confirmDeletion = useCallback((record: ShortItem) => {
    Modal.confirm({
      title: "Delete short?",
      content: `Are you sure you want to archive "${record.title}"?`,
      okText: "Delete",
      okType: "danger",
      onOk: () => handleDelete(record._id),
    });
  }, [handleDelete]);

  const columns = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        render: (_: unknown, record: ShortItem) => (
          <div className="flex items-center gap-4">
            {record.thumbnail ? (
              <Avatar shape="square" size={48} src={record.thumbnail} />
            ) : (
              <Avatar shape="square" size={48} className="bg-primary/20">
                {record.title.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <div>
              <p className="font-semibold text-sm text-dark dark:text-white">
                {record.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {record.description || "No description available"}
              </p>
            </div>
          </div>
        ),
      },
      {
        title: "Creator",
        dataIndex: "creator",
        key: "creator",
        render: (creator: ShortItem["creator"]) =>
          creator ? (
            <div className="flex items-center gap-2">
              <Avatar src={creator.profilePic} size="small">
                {creator.name.charAt(0).toUpperCase()}
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-dark dark:text-white">
                  {creator.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {creator.role}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-gray-400">—</span>
          ),
      },
      {
        title: "Duration",
        dataIndex: "duration",
        key: "duration",
        render: (duration: number) => formatDuration(duration),
      },
      {
        title: "Hashtags",
        dataIndex: "hashtags",
        key: "hashtags",
        render: (hashtags: string[]) => (
          <Space size={[4, 4]} wrap>
            {hashtags.length
              ? hashtags.map((tag) => (
                  <Tag key={tag} color="blue">
                    #{tag}
                  </Tag>
                ))
              : "—"}
          </Space>
        ),
      },
      {
        title: "Stats",
        dataIndex: "viewCount",
        key: "stats",
        render: (_: unknown, record: ShortItem) => (
          <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-300">
            <Tooltip title="Views">
              <span>
                👁️ {record.viewCount ?? 0}
              </span>
            </Tooltip>
            <Tooltip title="Likes">
              <span>
                ❤️ {record.likeCount ?? 0}
              </span>
            </Tooltip>
            <Tooltip title="Shares">
              <span>
                🔁 {record.shareCount ?? 0}
              </span>
            </Tooltip>
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: string) => (
          <Tag color={STATUS_COLOR_MAP[status] || "default"}>{status}</Tag>
        ),
      },
      {
        title: "Published",
        dataIndex: "publishedAt",
        key: "publishedAt",
        render: (publishedAt?: string) =>
          publishedAt
            ? new Date(publishedAt).toLocaleString()
            : "Not published",
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: ShortItem) => (
          <Space size="middle">
            <Tooltip title="View">
              <Button
                icon={<EyeOutlined />}
                onClick={() => navigate(`/shorts/${record._id}/view`)}
              />
            </Tooltip>
            <Tooltip title="Edit">
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/shorts/${record._id}/edit`)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => confirmDeletion(record)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [navigate, confirmDeletion]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Shorts Library
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your bite-sized learning videos. View performance, edit
              details, or create new shorts.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/shorts/create")}
          >
            Create Short
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            placeholder="Search shorts by title, description, or hashtag"
            value={searchTerm}
            onChange={handleSearchChange}
            allowClear
            className="md:col-span-2"
          />
          <Input
            placeholder="Filter by hashtag (optional)"
            value={filters.hashtag ?? ""}
            onChange={(e) => fetchShorts({ page: 1, hashtag: e.target.value })}
            allowClear
          />
        </div>

        <CustomAntdTable
          columns={columns}
          dataSource={dataSource}
          isLoading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            onChange: (page: number, pageSize: number) =>
              fetchShorts({ page, limit: pageSize }),
          }}
        />
      </div>
    </div>
  );
};

export default AllShorts;

