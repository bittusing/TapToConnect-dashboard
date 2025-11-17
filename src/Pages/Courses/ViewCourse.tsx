import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { toast } from "react-toastify";
import { Button, Tag, Descriptions, Card, Space, Image } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import dayjs from "dayjs";

interface CourseData {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  technology?: string;
  price: number;
  language?: string;
  level?: string;
  status: string;
  instructor?: {
    _id: string;
    name: string;
    email?: string;
  };
  tutor?: {
    _id: string;
    name: string;
  };
  students?: number;
  createdAt?: string;
  updatedAt?: string;
  tags?: Array<{
    _id: string;
    name: string;
    tagValue?: string;
    color?: string;
  }>;
  tagValues?: string[];
}

export default function ViewCourse() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseData | null>(null);

  useEffect(() => {
    if (id) {
      fetchCourseData(id);
    }
  }, [id]);

  const fetchCourseData = async (courseId: string) => {
    setLoading(true);
    try {
      const { data, error } = await API.getAuthAPI(`${END_POINT.COURSES}/${courseId}`, true);
      if (error || !data) throw new Error(error || "Failed to fetch course data");

      setCourse({
        _id: data._id,
        title: data.title || "",
        description: data.description || "",
        thumbnail: data.thumbnail,
        category: data.category,
        technology: data.technology,
        price: data.price || 0,
        language: data.language || "english",
        level: data.level || "beginner",
        status: data.status || "draft",
        instructor: data.instructor,
        tutor: data.tutor,
        students: data.students || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        tags: data.tags || [],
        tagValues: data.tagValues || [],
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch course data");
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MiniLoader />;
  if (!course) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "published":
      case "active":
        return "green";
      case "draft":
        return "orange";
      case "archived":
        return "red";
      default:
        return "default";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "blue";
      case "intermediate":
        return "orange";
      case "advanced":
        return "red";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/courses")}>
              Back
            </Button>
            <Button icon={<EditOutlined />} onClick={() => navigate(`/courses/${id}/edit`)}>
              Edit Course
            </Button>
          </div>

          {/* Course Header */}
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-6">
              {course.thumbnail && (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  className="rounded-lg"
                  width={200}
                  height={150}
                  style={{ objectFit: "cover" }}
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {course.title}
                </h1>
                <div className="flex flex-wrap gap-2 items-center mb-4">
                  <Tag color={getStatusColor(course.status)} className="text-sm">
                    {course.status?.toUpperCase()}
                  </Tag>
                  {course.level && (
                    <Tag color={getLevelColor(course.level)} className="text-sm">
                      {course.level?.toUpperCase()}
                    </Tag>
                  )}
                  {course.price > 0 ? (
                    <Tag color="green" className="text-sm font-semibold">
                      ${course.price}
                    </Tag>
                  ) : (
                    <Tag color="blue" className="text-sm">
                      FREE
                    </Tag>
                  )}
                </div>
                {(course.instructor || course.tutor) && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">Instructor:</span>{" "}
                    {course.instructor?.name || course.tutor?.name || "N/A"}
                  </p>
                )}
                {course.students !== undefined && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    <span className="font-semibold">Students:</span> {course.students}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Course Details */}
          <Descriptions
            title="Course Details"
            bordered
            column={{ xs: 1, sm: 2, md: 3 }}
            className="mb-6"
          >
            {course.category && (
              <Descriptions.Item label="Category">
                <Tag color="blue">{course.category}</Tag>
              </Descriptions.Item>
            )}
            {course.technology && (
              <Descriptions.Item label="Technology">
                <Tag color="purple">{course.technology}</Tag>
              </Descriptions.Item>
            )}
            {course.language && (
              <Descriptions.Item label="Language">
                <Tag color="cyan">{course.language.toUpperCase()}</Tag>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Price">
              <span className="font-semibold text-green-600">
                {course.price > 0 ? `$${course.price}` : "FREE"}
              </span>
            </Descriptions.Item>
            {course.createdAt && (
              <Descriptions.Item label="Created Date">
                {dayjs(course.createdAt).format("MMMM DD, YYYY")}
              </Descriptions.Item>
            )}
            {course.updatedAt && (
              <Descriptions.Item label="Last Updated">
                {dayjs(course.updatedAt).format("MMMM DD, YYYY")}
              </Descriptions.Item>
            )}
          </Descriptions>

          {/* Tags */}
          {(course.tags && course.tags.length > 0) || (course.tagValues && course.tagValues.length > 0) ? (
            <Card title="Tags" className="mb-6">
              <Space size={[8, 16]} wrap>
                {course.tags && course.tags.length > 0
                  ? course.tags.map((tag) => (
                      <Tag
                        key={tag._id}
                        color={tag.color || "blue"}
                        className="text-base py-1 px-3"
                      >
                        {tag.name}
                      </Tag>
                    ))
                  : course.tagValues?.map((tagValue, idx) => (
                      <Tag key={idx} color="blue" className="text-base py-1 px-3">
                        {tagValue}
                      </Tag>
                    ))}
              </Space>
            </Card>
          ) : null}

          {/* Course Description */}
          <Card title="Description" className="mb-6">
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {course.description || "No description provided."}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}





