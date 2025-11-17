import { useState, useEffect, useMemo } from "react";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Tag, Space, Avatar } from "antd";
import { debounce } from "lodash";

interface Instructor {
  key: string;
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  profilePic?: string;
  createdAt?: string;
}

const AllInstructors = () => {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
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
      fetchInstructors(term);
    }, 500),
    [pagination]
  );

  const fetchInstructors = async (search: string = "") => {
    setLoading(true);
    try {
      const response = await API.getAuthAPI(END_POINT.GET_ROLE_WISE_USER_LIST, true, { 
        role: "Tutor",
        search,
        page: pagination.current,
        limit: pagination.pageSize 
      });
      
      if (response.error) throw new Error(response.error);
      
      // Map API response to Instructor interface
      const instructorsData = response.data || [];
      const instructorsList = (Array.isArray(instructorsData) ? instructorsData : []).map((instructor: any) => ({
        key: instructor._id || instructor.id,
        _id: instructor._id || instructor.id,
        name: instructor.name || "N/A",
        email: instructor.email || "N/A",
        phone: instructor.phone || "N/A",
        role: instructor.role || "Tutor",
        isActive: instructor.isActive !== undefined ? instructor.isActive : true,
        profilePic: instructor.profilePic,
        createdAt: instructor.createdAt,
      }));
      
      setInstructors(instructorsList);
      setPagination({ ...pagination, total: instructorsList.length });
    } catch (error: any) {
      console.error("Failed to fetch instructors:", error);
      toast.error(error.message || "Failed to fetch instructors");
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      fetchInstructors();
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this instructor?")) return;

    try {
      const response = await API.DeleteAuthAPI(id, END_POINT.USERS, true);
      if (response.error) throw new Error(response.error);
      
      toast.success("Instructor deleted successfully");
      fetchInstructors();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete instructor");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Instructor) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.profilePic}>{name[0]?.toUpperCase()}</Avatar>
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone || "N/A",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "orange"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Instructor) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/instructors/${record.key}/edit`)} />
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Instructors</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate("/instructors/add")}
          >
            Add Instructor
          </Button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search instructors..."
            className="w-full max-w-md border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CustomAntdTable
          columns={columns}
          dataSource={instructors}
          isLoading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page: number, pageSize: number) => setPagination({ ...pagination, current: page, pageSize }),
          }}
        />
        </div>
      </div>
    </div>
  );
};

export default AllInstructors;

