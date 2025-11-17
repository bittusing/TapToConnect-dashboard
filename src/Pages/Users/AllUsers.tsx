import { useState, useEffect, useMemo } from "react";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Tag, Space, Switch } from "antd";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

interface User {
  key: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const USER_ROLES = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "Support Admin", label: "Support Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Tutor", label: "Tutor" },
  { value: "Employee", label: "Employee" },
  { value: "HR", label: "HR" },
  { value: "Finance", label: "Finance" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "Sales", label: "Sales" },
  { value: "User", label: "User" },
];

const AllUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setPagination({ ...pagination, current: 1 });
      fetchUsers(term);
    }, 500),
    [pagination]
  );

  const fetchUsers = async (search: string = "") => {
    setLoading(true);
    try {
      const response = await API.getAuthAPI(END_POINT.USERS, true, { search, page: pagination.current, limit: pagination.pageSize });
      if (response.error) throw new Error(response.error);
      
      const usersData = response.data || [];
      const usersList = (Array.isArray(usersData) ? usersData : []).map((user: any) => ({
        key: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "N/A",
        role: user.role || "User",
        isActive: user.isActive !== undefined ? user.isActive : true,
        createdAt: user.createdAt,
      }));
      
      setUsers(usersList);
      setPagination({ ...pagination, total: response.data?.length || usersList.length });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      fetchUsers();
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await API.DeleteAuthAPI(userId, END_POINT.USERS, true);
      if (response.error) throw new Error(response.error);
      
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      const response = await API.updateAuthAPI(
        { isActive },
        userId,
        END_POINT.USERS,
        true
      );
      if (response.error) throw new Error(response.error);
      
      toast.success(`User ${isActive ? "activated" : "deactivated"} successfully`);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  const getRoleColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      "Super Admin": "red",
      "Support Admin": "purple",
      "Admin": "blue",
      "Tutor": "green",
      "Employee": "orange",
      "HR": "cyan",
      "Finance": "gold",
      "Project Manager": "volcano",
      "Sales": "magenta",
      "User": "default",
    };
    return roleColors[role] || "default";
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: User) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 150,
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>{role}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean, record: User) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleStatusChange(record.key, checked)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: User) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/users/${record.key}/edit`)} 
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.key)} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Users</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/users/add")}
            >
              Add User
            </Button>
          </div>

          <CustomAntdTable
            columns={columns}
            data={users}
            loading={loading}
            pagination={pagination}
            setPagination={setPagination}
            onChange={(pagination: any) => {
              setPagination({ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total });
            }}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchPlaceholder="Search users..."
          />
        </div>
      </div>
    </div>
  );
};

export default AllUsers;

