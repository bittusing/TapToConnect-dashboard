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
import SwitcherTwo from "../../components/FormElements/Switchers/SwitcherTwo";
import { Select, Tag } from "antd";
import TabPanel from "../../components/TabPanel/TabPanel";
import { FaUser, FaShieldAlt, FaCode, FaGraduationCap } from "react-icons/fa";

interface StudentFormData {
  // Basic Info
  name: string;
  email: string;
  phone: string;
  bio: string;
  profilePic: string;
  isActive: boolean;
  isPrime: boolean;
  // Social & Education
  github: string;
  linkedin: string;
  portfolio: string;
  college: string;
  course: string;
  semester: string;
  // Skills
  skills: string[];
  technologies: string[];
}

const initialFormState: StudentFormData = {
  name: "",
  email: "",
  phone: "",
  bio: "",
  profilePic: "",
  isActive: true,
  isPrime: false,
  github: "",
  linkedin: "",
  portfolio: "",
  college: "",
  course: "",
  semester: "",
  skills: [],
  technologies: [],
};

const semesterOptions = [
  { label: "1st Semester", value: "1st Semester" },
  { label: "2nd Semester", value: "2nd Semester" },
  { label: "3rd Semester", value: "3rd Semester" },
  { label: "4th Semester", value: "4th Semester" },
  { label: "5th Semester", value: "5th Semester" },
  { label: "6th Semester", value: "6th Semester" },
  { label: "7th Semester", value: "7th Semester" },
  { label: "8th Semester", value: "8th Semester" },
];

const commonSkills = [
  "JavaScript", "Python", "Java", "React", "Node.js", "HTML/CSS",
  "MongoDB", "MySQL", "Git", "AWS", "Docker", "Kubernetes",
  "Problem Solving", "Communication", "Leadership", "Team Work"
];

const commonTechnologies = [
  "React", "Vue.js", "Angular", "Next.js", "Node.js", "Express",
  "MongoDB", "PostgreSQL", "MySQL", "Firebase", "AWS", "Docker",
  "Kubernetes", "GraphQL", "REST API", "Microservices"
];

export default function EditStudent() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState<StudentFormData>(initialFormState);
  const [newSkill, setNewSkill] = useState("");
  const [newTech, setNewTech] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
    //  fetchStudentData(id);
    }
  }, [id]);

  const fetchStudentData = async (studentId: string) => {
    setIsLoadingData(true);
    try {
      const { data, error } = await API.getAuthAPI(`${END_POINT.USERS}/${studentId}`, true);
      if (error || !data) throw new Error(error);
      
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        bio: data.bio || "",
        profilePic: data.profilePic || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
        isPrime: data.isPrime || false,
        github: data.github || "",
        linkedin: data.linkedin || "",
        portfolio: data.portfolio || "",
        college: data.college || "",
        course: data.course || "",
        semester: data.semester || "",
        skills: data.skills || [],
        technologies: data.technologies || [],
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch student data");
      navigate("/students");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleAddTech = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()],
      }));
      setNewTech("");
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((tech) => tech !== techToRemove),
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.email.trim() || !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await API.updateAuthAPI(formData, id!, END_POINT.USERS, true);
      if (error || !data) throw new Error(error);
      
      toast.success("Student updated successfully!");
      navigate("/students");
    } catch (error: any) {
      toast.error(error.message || "Failed to update student");
    } finally {
      setIsLoading(false);
    }
  };

  // if (isLoadingData) return <MiniLoader />;

  const tabsData = [
    {
      tabName: (
        <span className="flex items-center gap-2">
          <FaUser /> Basic Information
        </span>
      ),
      component: (
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputGroup
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            required
          />

          <InputGroup
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
          />

          <InputGroup
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            required
          />

          <InputGroup
            label="Profile Picture URL"
            name="profilePic"
            value={formData.profilePic}
            onChange={handleInputChange}
            placeholder="https://example.com/profile.jpg"
          />

          <TextAreaCustom
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Enter bio"
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Status
              </label>
              <SwitcherTwo
                id="isActive"
                defaultChecked={formData.isActive}
                onChange={(checked: boolean) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Premium Subscription
              </label>
              <SwitcherTwo
                id="isPrime"
                defaultChecked={formData.isPrime}
                onChange={(checked: boolean) => setFormData((prev) => ({ ...prev, isPrime: checked }))}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <ButtonDefault
              type="submit"
              label="Update Student"
              variant="primary"
              loading={isLoading}
            />
            <ButtonDefault
              type="button"
              label="Cancel"
              variant="outline"
              onClick={() => navigate("/students")}
            />
          </div>
        </form>
      ),
    },
    {
      tabName: (
        <span className="flex items-center gap-2">
          <FaShieldAlt /> Social & Education
        </span>
      ),
      component: (
        <div className="space-y-6">
          <InputGroup
            label="GitHub URL"
            name="github"
            value={formData.github}
            onChange={handleInputChange}
            placeholder="https://github.com/username"
          />

          <InputGroup
            label="LinkedIn URL"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleInputChange}
            placeholder="https://linkedin.com/in/username"
          />

          <InputGroup
            label="Portfolio URL"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleInputChange}
            placeholder="https://portfolio.example.com"
          />

          <InputGroup
            label="College"
            name="college"
            value={formData.college}
            onChange={handleInputChange}
            placeholder="Enter college name"
          />

          <InputGroup
            label="Course"
            name="course"
            value={formData.course}
            onChange={handleInputChange}
            placeholder="Enter course name"
          />

          <SelectGroupAntd
            label="Semester"
            selectedOption={formData.semester}
            setSelectedOption={(value) => setFormData((prev) => ({ ...prev, semester: value }))}
            options={semesterOptions}
          />
        </div>
      ),
    },
    {
      tabName: (
        <span className="flex items-center gap-2">
          <FaCode /> Skills & Technologies
        </span>
      ),
      component: (
        <div className="space-y-8">
          {/* Skills Section */}
          <div>
            <label className="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Skills
            </label>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.skills.map((skill, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => handleRemoveSkill(skill)}
                  className="text-base py-1 px-3"
                >
                  {skill}
                </Tag>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <InputGroup
                name="newSkill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill"
              />
              <ButtonDefault
                type="button"
                label="Add Skill"
                variant="outline"
                onClick={handleAddSkill}
              />
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Quick Add:</p>
              <div className="flex flex-wrap gap-2">
                {commonSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      if (!formData.skills.includes(skill)) {
                        setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
                      }
                    }}
                    disabled={formData.skills.includes(skill)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Technologies Section */}
          <div>
            <label className="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Technologies
            </label>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.technologies.map((tech, index) => (
                <Tag
                  key={index}
                  closable
                  onClose={() => handleRemoveTech(tech)}
                  className="text-base py-1 px-3 bg-green-50"
                >
                  {tech}
                </Tag>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <InputGroup
                name="newTech"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                placeholder="Add technology"
              />
              <ButtonDefault
                type="button"
                label="Add Technology"
                variant="outline"
                onClick={handleAddTech}
              />
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Quick Add:</p>
              <div className="flex flex-wrap gap-2">
                {commonTechnologies.map((tech) => (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => {
                      if (!formData.technologies.includes(tech)) {
                        setFormData((prev) => ({ ...prev, technologies: [...prev.technologies, tech] }));
                      }
                    }}
                    disabled={formData.technologies.includes(tech)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Student</h1>
            <ButtonDefault
              type="button"
              label="Back to Students"
              variant="outline"
              onClick={() => navigate("/students")}
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

