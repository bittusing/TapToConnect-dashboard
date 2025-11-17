import { useState, useEffect, useMemo } from "react";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Tag, Space, Image } from "antd";

interface Course {
  key: string;
  title: string;
  instructor: string;
  category: string;
  price: number;
  students: number;
  status: string;
  createdAt: string;
  thumbnail?: string;
  description?: string;
}

const AllCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
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
      fetchCourses(term);
    }, 500),
    [pagination]
  );

  const fetchCourses = async (search: string = "") => {
    setLoading(true);
    try {
      const response = await API.getAuthAPI(END_POINT.COURSES, true, { search, page: pagination.current, limit: pagination.pageSize });
      if (response.error) throw new Error(response.error);
      
      // Map API response to Course interface
      const coursesData = response.data.courses || [];
      const coursesList = (Array.isArray(coursesData) ? coursesData : []).map((course: any) => ({
        key: course._id || course.id,
        title: course.title,
        instructor: course.instructor?.name || "N/A",
        category: course.category,
        price: course.price,  
        students: course.students || 0,
        status: course.status,
        createdAt: course.createdAt,
        description: course.description,
      }));
      
      setCourses(coursesList);
      setPagination({ ...pagination, total: coursesList.length });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch courses");
      // Keep mock data as fallback
      const mockCourses: Course[] = [
        {
          key: "1",
          title: "Complete Python Programming",
          instructor: "John Doe",
          category: "Programming",
          price: 99,
          students: 1250,
          status: "active",
          createdAt: new Date().toISOString(),
          description: "Learn Python from scratch to advanced"
        },
      ];
      setCourses(mockCourses);
      setPagination({ ...pagination, total: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      fetchCourses();
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      await API.DeleteAuthAPI(id, END_POINT.COURSES, true);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete course");
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: true,
    },
    {
      title: "Instructor",
      dataIndex: "instructor",
      key: "instructor",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `₹${price.toLocaleString()}`,
    },
    {
      title: "Students",
      dataIndex: "students",
      key: "students",
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
      render: (_: any, record: Course) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/courses/${record.key}/view`)} />
          <Button icon={<EditOutlined />} onClick={() => navigate(`/courses/${record.key}/edit`)} />
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Courses</h1>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate("/courses/create")}
          >
            Create Course
          </Button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full max-w-md border border-gray-300 dark:border-gray-600 rounded px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <CustomAntdTable
          columns={columns}
          dataSource={courses}
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

export default AllCourses;

