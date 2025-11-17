import { useState, useEffect, useMemo } from "react";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { API } from "../../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined, MailOutlined, PhoneOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Tag, Space, Avatar } from "antd";
import { debounce } from "lodash";

interface Student {
  key: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  coursesEnrolled: number;
  joinedDate: string;
}

const AllStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
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
      fetchStudents(term);
    }, 500),
    [pagination]
  );

  const fetchStudents = async (search: string = "") => {
    setLoading(true);
    try {
      // TODO: Replace with actual API endpoint
      // const response = await API.getAuthAPI("students", true, { search, page: pagination.current, limit: pagination.pageSize });
      
      // Mock data
      const mockStudents: Student[] = [
        {
          key: "1",
          name: "Alice Johnson",
          email: "alice@example.com",
          phone: "+1234567890",
          status: "active",
          coursesEnrolled: 5,
          joinedDate: new Date().toISOString(),
        },
        {
          key: "2",
          name: "Bob Williams",
          email: "bob@example.com",
          phone: "+1234567891",
          status: "active",
          coursesEnrolled: 3,
          joinedDate: new Date().toISOString(),
        }
      ];
      
      setStudents(mockStudents);
      setPagination({ ...pagination, total: 2 });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      fetchStudents();
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      // TODO: Replace with actual API endpoint
      // await API.DeleteAuthAPI(id, "students", true);
      toast.success("Student deleted successfully");
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete student");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Student) => (
        <div className="flex items-center gap-2">
          <Avatar>{name[0]}</Avatar>
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <div className="flex items-center gap-1">
          <MailOutlined />
          <span>{email}</span>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => (
        <div className="flex items-center gap-1">
          <PhoneOutlined />
          <span>{phone}</span>
        </div>
      ),
    },
    {
      title: "Courses",
      dataIndex: "coursesEnrolled",
      key: "coursesEnrolled",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Student) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/students/${record.key}/view`)} />
          <Button icon={<EditOutlined />} onClick={() => navigate(`/students/${record.key}/edit`)} />
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Students</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate("/students/add")}
          >
            Add Student
          </Button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search students..."
            className="w-full max-w-md border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CustomAntdTable
          columns={columns}
          dataSource={students}
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
  );
};

export default AllStudents;

