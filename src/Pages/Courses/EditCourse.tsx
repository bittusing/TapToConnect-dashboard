import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import InputGroup from "../../components/FormElements/InputGroup";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import SelectGroupAntd from "../../components/FormElements/SelectGroup/SelectGroupAntd";
import TextAreaCustom from "../../components/FormElements/TextArea/TextAreaCustom";
import TabPanel from "../../components/TabPanel/TabPanel";
import CourseTopics from "../../components/Courses/CourseTopics";
import CourseVideos from "../../components/Courses/CourseVideos";
import { FaBook, FaPlayCircle, FaListAlt } from "react-icons/fa";
import { Checkbox, Tag as AntdTag, Button as AntdButton, Input } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  isFree: boolean;
  language: string;
  instructor: string;
  level: string;
  status: string;
  tagValues: string[];
  thumbnail: string;
  whatYouWillLearn: string[];
  requirements: string[];
}

const initialFormState: CourseFormData = {
  title: "",
  description: "",
  category: "",
  price: 0,
  isFree: false,
  language: "English",
  instructor: "",
  level: "beginner",
  status: "draft",
  tagValues: [],
  thumbnail: "",
  whatYouWillLearn: [],
  requirements: [],
};

const categories = [
  { label: "Programming", value: "Programming" },
  { label: "Web Development", value: "Web Development" },
  { label: "Data Science", value: "Data Science" },
  { label: "Design", value: "Design" },
];

const technologies = [
  { label: "Node.js", value: "Node.js" },
  { label: "React", value: "React" },
  { label: "Python", value: "Python" },
  { label: "JavaScript", value: "JavaScript" },
  { label: "Java", value: "Java" },
  { label: "PHP", value: "PHP" },
];

const statuses = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

const languages = [
  { label: "English", value: "english" },
  { label: "Hindi", value: "hindi" },
];

const levels = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

export default function EditCourse() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState<CourseFormData>(initialFormState);
  const [tutors, setTutors] = useState<any[]>([]);
  const [topics, setTopics] = useState<Array<{ label: string; value: string }>>([]);
  const [availableTags, setAvailableTags] = useState<Array<{ _id: string; name: string; tagValue: string; color?: string }>>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [whatYouWillLearnInput, setWhatYouWillLearnInput] = useState("");
  const [requirementsInput, setRequirementsInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
    fetchTutors();
    if (id) {
      fetchCourseData(id);
    }
  }, [id]);

  const fetchTutors = async () => {
    try {
      const { data, error } = await API.getAuthAPI(END_POINT.GET_ROLE_WISE_USER_LIST, true, { role: "Tutor" });
      if (error || !data) {
        throw new Error(error || "Failed to fetch tutors");
      }
      const tutorsList = Array.isArray(data) ? data : (data || []);
      setTutors(tutorsList?.map((tutor: any) => ({
        _id: tutor._id || tutor.id,
        name: tutor.name,
      })));
    } catch (error: any) {
      console.error("Failed to fetch tutors", error);
      toast.error(error.message || "Failed to load tutors");
      setTutors([]);
    }
  };

  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      // Fetch all tags
      const tagsResponse = await API.getAuthAPI(END_POINT.TAGS, true);
      const tagsData = tagsResponse?.data?.tags || tagsResponse?.data || [];
      
      // Map all tags to simple format
      const tagsList = tagsData.map((tag: any) => ({
        _id: tag._id || tag.id,
        name: tag.name,
        tagValue: tag.tagValue || tag.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
        color: tag.color,
      }));
      
      setAvailableTags(tagsList);
    } catch (error) {
      console.error("Failed to fetch tags", error);
      toast.error("Failed to load tags");
    } finally {
      setLoadingTags(false);
    }
  };

  const handleTagChange = (tagValue: string, checked: boolean) => {
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

  const fetchCourseData = async (courseId: string) => {
    setIsLoadingData(true);
    try {
      const { data, error } = await API.getAuthAPI(`${END_POINT.COURSES}/${courseId}`, true);
      if (error || !data) throw new Error(error);
      // Handle both tagValues (new) and tags (old) formats from backend
      const tagValues = data.tagValues || (data.tags && Array.isArray(data.tags) 
        ? data.tags.map((tag: any) => typeof tag === 'string' ? tag : (tag.tagValue || tag.name?.toLowerCase().replace(/[^a-z0-9]/g, "")))
        : []) || [];
      
      setFormData({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        price: data.price || 0,
        isFree: data.isFree || false,
        language: data.language || "English",
        instructor: data.instructor?._id || data.instructor || data.tutor?._id || data.tutor || "",
        level: data.level || "beginner",
        status: data.status || "draft",
        tagValues: tagValues,
        thumbnail: data.thumbnail || "",
        whatYouWillLearn: data.whatYouWillLearn || [],
        requirements: data.requirements || [],
      });

      // Fetch topics for the dropdown
      const topicsResponse = await API.getAuthAPI(`${END_POINT.COURSES}/${courseId}/topics`, true);
      if (!topicsResponse.error && topicsResponse.data) {
        const topicsList = (topicsResponse.data || []).map((topic: any) => ({
          label: topic.title,
          value: topic._id || topic.id,
        }));
        setTopics(topicsList);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch course data");
      navigate("/courses");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAddWhatYouWillLearn = () => {
    if (whatYouWillLearnInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        whatYouWillLearn: [...prev.whatYouWillLearn, whatYouWillLearnInput.trim()],
      }));
      setWhatYouWillLearnInput("");
    }
  };

  const handleRemoveWhatYouWillLearn = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      whatYouWillLearn: prev.whatYouWillLearn.filter((_, i) => i !== index),
    }));
  };

  const handleAddRequirement = () => {
    if (requirementsInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, requirementsInput.trim()],
      }));
      setRequirementsInput("");
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Course title is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }
    if (!formData.instructor) {
      toast.error("Please select an instructor");
      return false;
    }
    if (formData.price < 0) {
      toast.error("Price must be greater than or equal to 0");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        isFree: formData.isFree,
        category: formData.category,
        instructor: formData.instructor,
        tagValues: formData.tagValues,
        thumbnail: formData.thumbnail,
        whatYouWillLearn: formData.whatYouWillLearn.filter((item) => item.trim() !== ""),
        requirements: formData.requirements.filter((item) => item.trim() !== ""),
        level: formData.level,
        language: formData.language,
        status: formData.status,
      };

      console.log("Updating course payload:", payload);
      const { data, error } = await API.updateAuthAPI(payload, id!, END_POINT.COURSES, true);
      
      if (error) {
        console.error("API Error:", error);
        throw new Error(error || "Failed to update course");
      }
      
      if (!data) {
        console.error("No data received from API");
        throw new Error("No data received from server");
      }
      
      console.log("Course updated successfully:", data);
      toast.success("Course updated successfully!");
      navigate("/courses");
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast.error(error?.message || error?.error || "Failed to update course. Please check all required fields.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) return <MiniLoader />;

  const tabsData = [
    {
      tabName: (
        <span className="flex items-center gap-2">
          <FaBook /> Course Details
        </span>
      ),
      component: (
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputGroup
            label="Course Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter course title"
            required
          />

          <TextAreaCustom
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter course description"
            required
            rows={6}
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectGroupAntd
              label="Category"
              selectedOption={formData.category}
              setSelectedOption={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              options={categories}
              required
            />

              <InputGroup
                label="Price (₹)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectGroupAntd
                label="Status"
                selectedOption={formData.status}
                setSelectedOption={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                options={statuses}
              />

              <SelectGroupAntd
                label="Level"
                selectedOption={formData.level}
                setSelectedOption={(value) => setFormData((prev) => ({ ...prev, level: value }))}
                options={levels}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectGroupAntd
                label="Language"
                selectedOption={formData.language}
                setSelectedOption={(value) => setFormData((prev) => ({ ...prev, language: value }))}
                options={languages}
              />

              <SelectGroupAntd
                label="Instructor (Tutor)"
                selectedOption={formData.instructor}
                setSelectedOption={(value) => setFormData((prev) => ({ ...prev, instructor: value }))}
                options={tutors.map((tutor: any) => ({
                  label: tutor.name,
                  value: tutor._id,
                }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <InputGroup
                label="Thumbnail URL"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                placeholder="https://example.com/course-thumbnail.jpg"
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  <Checkbox
                    name="isFree"
                    checked={formData.isFree}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isFree: e.target.checked }))}
                  >
                    Free Course
                  </Checkbox>
                </label>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  What You Will Learn
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={whatYouWillLearnInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWhatYouWillLearnInput(e.target.value)}
                      placeholder="Enter what students will learn"
                      onPressEnter={handleAddWhatYouWillLearn}
                    />
                    <AntdButton
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddWhatYouWillLearn}
                    >
                      Add
                    </AntdButton>
                  </div>
                  <div className="space-y-1">
                    {formData.whatYouWillLearn.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No items added yet</p>
                    ) : (
                      formData.whatYouWillLearn.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            {item}
                          </span>
                          <AntdButton
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveWhatYouWillLearn(index)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Requirements
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={requirementsInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRequirementsInput(e.target.value)}
                      placeholder="Enter requirement"
                      onPressEnter={handleAddRequirement}
                    />
                    <AntdButton
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddRequirement}
                    >
                      Add
                    </AntdButton>
                  </div>
                  <div className="space-y-1">
                    {formData.requirements.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No requirements added yet</p>
                    ) : (
                      formData.requirements.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                            {item}
                          </span>
                          <AntdButton
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveRequirement(index)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Tags
              </label>
              <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                {loadingTags ? (
                  <div className="text-center py-4 text-gray-500">Loading tags...</div>
                ) : availableTags.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No tags available</div>
                ) : (
                  <div className="space-y-2">
                    {availableTags.map((tag) => (
                      <div key={tag._id} className="flex items-center">
                        <Checkbox
                          checked={formData.tagValues.includes(tag.tagValue)}
                          onChange={(e) => handleTagChange(tag.tagValue, e.target.checked)}
                          className="text-sm"
                        >
                          <span className="text-gray-700 dark:text-gray-300">{tag.name}</span>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {formData.tagValues.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">
                    Selected: {formData.tagValues.length} tag(s)
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {formData.tagValues.map((tagValue) => {
                      const tag = availableTags.find(t => t.tagValue === tagValue);
                      return (
                        <AntdTag key={tagValue} color={tag?.color} className="text-xs">
                          {tag?.name || tagValue}
                        </AntdTag>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <ButtonDefault
              type="submit"
              label="Update Course"
              variant="primary"
              loading={isLoading}
            />
            <ButtonDefault
              type="button"
              label="Cancel"
              variant="outline"
              onClick={() => navigate("/courses")}
            />
          </div>
        </form>
      ),
    },
    {
      tabName: (
        <span className="flex items-center gap-2">
          <FaListAlt /> Topics
        </span>
      ),
      component: id ? <CourseTopics courseId={id} /> : <div>Loading...</div>,
    },
    {
      tabName: (
        <span className="flex items-center gap-2">
          <FaPlayCircle /> Videos
        </span>
      ),
      component: id ? <CourseVideos courseId={id} topics={topics} /> : <div>Loading...</div>,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
            <ButtonDefault
              type="button"
              label="Back to Courses"
              variant="outline"
              onClick={() => navigate("/courses")}
            />
          </div>

          <TabPanel
            tabsData={tabsData}
            type="line"
            defaultActiveKey="1"
            size="large"
          />
        </div>
      </div>
    </div>
  );
}

