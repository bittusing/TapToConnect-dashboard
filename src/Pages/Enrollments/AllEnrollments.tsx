import { useState, useEffect, useMemo } from "react";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Tag, Space } from "antd";
import { debounce } from "lodash";

interface Enrollment {
  key: string;
  student: string;
  course: string;
  enrolledDate: string;
  status: string;
  progress: number;
  amount: number;
}

const AllEnrollments = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
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
      fetchEnrollments(term);
    }, 500),
    [pagination]
  );

  const fetchEnrollments = async (search: string = "") => {
    setLoading(true);
    try {
      // Mock data
      const mockEnrollments: Enrollment[] = [
        {
          key: "1",
          student: "Alice Johnson",
          course: "Complete Python Programming",
          enrolledDate: new Date().toISOString(),
          status: "active",
          progress: 45,
          amount: 99,
        },
        {
          key: "2",
          student: "Bob Williams",
          course: "React Masterclass",
          enrolledDate: new Date().toISOString(),
          status: "active",
          progress: 78,
          amount: 149,
        }
      ];
      
      setEnrollments(mockEnrollments);
      setPagination({ ...pagination, total: 2 });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch enrollments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      fetchEnrollments();
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const columns = [
    {
      title: "Student",
      dataIndex: "student",
      key: "student",
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
    },
    {
      title: "Enrolled Date",
      dataIndex: "enrolledDate",
      key: "enrolledDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number) => `${progress}%`,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${amount}`,
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
      render: (_: any, record: Enrollment) => (
        <Space>
          <Button icon={<EditOutlined />} />
          <Button danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Enrollments</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate("/enrollments/create")}
          >
            Create Enrollment
          </Button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search enrollments..."
            className="w-full max-w-md border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CustomAntdTable
          columns={columns}
          dataSource={enrollments}
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

export default AllEnrollments;

