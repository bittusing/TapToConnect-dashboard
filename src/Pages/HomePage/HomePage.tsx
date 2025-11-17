import { useState, useEffect } from "react";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { toast } from "react-toastify";
import { Button, Tag, Card, Select, Empty, Spin, Image } from "antd";
import { PlayCircleOutlined } from "@ant-design/icons";

const { Meta } = Card;

interface TagGroup {
  _id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  tagCount?: number;
}

interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  price: number;
  instructor?: {
    name: string;
  };
  tags?: Array<{
    _id: string;
    name: string;
    tagGroup?: {
      _id: string;
      name: string;
    };
  }>;
  students?: number;
  rating?: number;
}

const HomePage = () => {
  const [selectedTagGroups, setSelectedTagGroups] = useState<string[]>([]);
  const [availableTagGroups, setAvailableTagGroups] = useState<TagGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [tagGroupsLoading, setTagGroupsLoading] = useState(false);
  const [selectValue, setSelectValue] = useState<string | undefined>(undefined);

  // Fetch available tag groups
  const fetchTagGroups = async () => {
    setTagGroupsLoading(true);
    try {
      const response = await API.getAuthAPI(END_POINT.TAG_GROUPS, true);
      if (response.error) throw new Error(response.error);
      
      const groupsData = response?.data?.groups || response?.data?.tagGroups || response?.data || [];
      const groupsList = (Array.isArray(groupsData) ? groupsData : []).map((group: any) => ({
        _id: group._id || group.id,
        name: group.name,
        slug: group.slug,
        color: group.color || "#3B82F6",
        icon: group.icon,
        tagCount: group.tagCount || 0,
      }));
      
      setAvailableTagGroups(groupsList);
    } catch (error: any) {
      console.error("Failed to fetch tag groups:", error);
      toast.error("Failed to load tag groups");
    } finally {
      setTagGroupsLoading(false);
    }
  };

  // Fetch courses based on selected tag groups
  const fetchCoursesByTagGroups = async () => {
    if (selectedTagGroups.length === 0) {
      setCourses([]);
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with GraphQL API later
      // For now, using REST API with tag groups filter
      const response = await API.getAuthAPI(END_POINT.COURSES, true, {
        tagGroups: selectedTagGroups.join(","),
        limit: 50,
      });
      
      if (response.error) throw new Error(response.error);
      
      const coursesData = response?.data?.courses || response?.data || [];
      const coursesList = (Array.isArray(coursesData) ? coursesData : []).map((course: any) => ({
        _id: course._id || course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail || course.image,
        price: course.price || 0,
        instructor: course.instructor,
        tags: course.tags || [],
        students: course.students || course.enrollments || 0,
        rating: course.rating || 0,
      }));
      
      setCourses(coursesList);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      toast.error(error.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTagGroups();
  }, []);

  useEffect(() => {
    fetchCoursesByTagGroups();
  }, [selectedTagGroups]);

  const handleAddTagGroup = (tagGroupId: string) => {
    if (!selectedTagGroups.includes(tagGroupId)) {
      setSelectedTagGroups([...selectedTagGroups, tagGroupId]);
      setSelectValue(undefined); // Reset select after adding
    }
  };

  const handleRemoveTagGroup = (tagGroupId: string) => {
    setSelectedTagGroups(selectedTagGroups.filter(id => id !== tagGroupId));
  };

  const getTagGroupById = (id: string) => {
    return availableTagGroups.find(group => group._id === id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Home Page - Course Display
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select tag groups to dynamically display courses
          </p>
        </div>
      </div>

      {/* Tag Groups Selection Section */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Card className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Select Tag Groups
            </h2>
            
            {/* Selected Tag Groups */}
            {selectedTagGroups.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Tag Groups:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTagGroups.map((tagGroupId) => {
                    const tagGroup = getTagGroupById(tagGroupId);
                    if (!tagGroup) return null;
                    return (
                      <Tag
                        key={tagGroupId}
                        closable
                        onClose={() => handleRemoveTagGroup(tagGroupId)}
                        style={{
                          backgroundColor: tagGroup.color,
                          color: "white",
                          borderColor: tagGroup.color,
                          padding: "4px 12px",
                          fontSize: "14px",
                          borderRadius: "6px",
                        }}
                      >
                        {tagGroup.name}
                      </Tag>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Tag Group Dropdown */}
            <Select
              placeholder="Select a tag group to add"
              value={selectValue}
              onChange={handleAddTagGroup}
              style={{ width: "100%", maxWidth: "400px" }}
              loading={tagGroupsLoading}
              showSearch
              optionFilterProp="label"
              allowClear={false}
            >
              {availableTagGroups
                .filter(group => !selectedTagGroups.includes(group._id))
                .map((group) => (
                  <Select.Option key={group._id} value={group._id} label={group.name}>
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 3,
                          backgroundColor: group.color,
                          display: "inline-block",
                        }}
                      />
                      <span>{group.name}</span>
                      {group.tagCount !== undefined && (
                        <span className="text-gray-500 text-xs">
                          ({group.tagCount} tags)
                        </span>
                      )}
                    </div>
                  </Select.Option>
                ))}
            </Select>
          </div>
        </Card>

        {/* Courses Display Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Courses
              {selectedTagGroups.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({courses.length} courses found)
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : selectedTagGroups.length === 0 ? (
            <Card>
              <Empty
                description="Please select tag groups to view courses"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : courses.length === 0 ? (
            <Card>
              <Empty
                description="No courses found for selected tag groups"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <Card
                  key={course._id}
                  hoverable
                  className="dark:bg-gray-800"
                  cover={
                    course.thumbnail ? (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          preview={false}
                          fallback="/images/placeholder-course.jpg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <PlayCircleOutlined className="text-white text-4xl opacity-0 hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <PlayCircleOutlined className="text-white text-6xl" />
                      </div>
                    )
                  }
                  actions={[
                    <Button type="link" key="view">
                      View Details
                    </Button>,
                    <Button type="primary" key="enroll">
                      Enroll Now
                    </Button>,
                  ]}
                >
                  <Meta
                    title={
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {course.title}
                      </h3>
                    }
                    description={
                      <div>
                        {course.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">
                            {course.description}
                          </p>
                        )}
                        {course.instructor && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mb-2">
                            By {course.instructor.name}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold text-primary">
                            ${course.price}
                          </span>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            {course.students !== undefined && (
                              <span>{course.students} students</span>
                            )}
                            {course.rating !== undefined && (
                              <span>⭐ {course.rating}</span>
                            )}
                          </div>
                        </div>
                        {course.tags && course.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {course.tags.slice(0, 3).map((tag) => (
                              <Tag
                                key={tag._id}
                                color={tag.tagGroup?.name ? "blue" : "default"}
                                className="text-xs"
                              >
                                {tag.name}
                              </Tag>
                            ))}
                            {course.tags.length > 3 && (
                              <Tag className="text-xs">+{course.tags.length - 3} more</Tag>
                            )}
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
