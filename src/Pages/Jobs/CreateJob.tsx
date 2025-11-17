import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { toast } from "react-toastify";
import { Button, Input, Select, InputNumber, DatePicker, Tag, Space } from "antd";
import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import TextAreaCustom from "../../components/FormElements/TextArea/TextAreaCustom";
import dayjs, { Dayjs } from "dayjs";

const { TextArea } = Input;

interface JobFormData {
  title: string;
  company: string;
  companyLogo: string;
  jobType: string;
  workMode: string;
  location: string;
  experience: string;
  experienceMin: number;
  experienceMax: number;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  openings: number;
  description: string;
  requiredSkills: string[];
  jobLevel: string;
  hrName: string;
  hrContact: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  expiryDate: Dayjs | null;
  status: string;
}

const initialFormState: JobFormData = {
  title: "",
  company: "",
  companyLogo: "",
  jobType: "",
  workMode: "",
  location: "",
  experience: "",
  experienceMin: 0,
  experienceMax: 0,
  salary: "",
  salaryMin: 0,
  salaryMax: 0,
  openings: 1,
  description: "",
  requiredSkills: [],
  jobLevel: "",
  hrName: "",
  hrContact: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  expiryDate: null,
  status: "active",
};

const jobTypes = [
  { label: "Full Time", value: "Full Time" },
  { label: "Part Time", value: "Part Time" },
  { label: "Contract", value: "Contract" },
  { label: "Internship", value: "Internship" },
  { label: "Freelance", value: "Freelance" },
];

const workModes = [
  { label: "Work From Home", value: "Work From Home" },
  { label: "Work From Office", value: "Work From Office" },
  { label: "Hybrid", value: "Hybrid" },
];

const jobLevels = [
  { label: "Fresher", value: "Fresher" },
  { label: "Junior", value: "Junior" },
  { label: "Mid", value: "Mid" },
  { label: "Senior", value: "Senior" },
  { label: "Lead", value: "Lead" },
  { label: "Manager", value: "Manager" },
];

const statuses = [
  { label: "Active", value: "active" },
  { label: "Closed", value: "closed" },
  { label: "Expired", value: "expired" },
  { label: "Draft", value: "draft" },
];

export default function CreateJob() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<JobFormData>(initialFormState);
  const [skillInput, setSkillInput] = useState("");

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Job title is required");
      return;
    }
    if (!formData.company.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!formData.jobType) {
      toast.error("Job type is required");
      return;
    }
    if (!formData.workMode) {
      toast.error("Work mode is required");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Location is required");
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        jobType: formData.jobType,
        workMode: formData.workMode,
        location: formData.location.trim(),
        openings: formData.openings,
        description: formData.description.trim(),
        requiredSkills: formData.requiredSkills,
        status: formData.status,
      };

      if (formData.companyLogo) payload.companyLogo = formData.companyLogo.trim();
      if (formData.experience) payload.experience = formData.experience.trim();
      if (formData.experienceMin) payload.experienceMin = formData.experienceMin;
      if (formData.experienceMax) payload.experienceMax = formData.experienceMax;
      if (formData.salary) payload.salary = formData.salary.trim();
      if (formData.salaryMin) payload.salaryMin = formData.salaryMin;
      if (formData.salaryMax) payload.salaryMax = formData.salaryMax;
      if (formData.jobLevel) payload.jobLevel = formData.jobLevel;
      if (formData.hrName) payload.hrName = formData.hrName.trim();
      if (formData.hrContact) payload.hrContact = formData.hrContact.trim();
      if (formData.companyEmail) payload.companyEmail = formData.companyEmail.trim();
      if (formData.companyPhone) payload.companyPhone = formData.companyPhone.trim();
      if (formData.companyAddress) payload.companyAddress = formData.companyAddress.trim();
      if (formData.expiryDate) payload.expiryDate = formData.expiryDate.toISOString();

      const response = await API.postAuthAPI(payload, END_POINT.JOBS, true);
      if (response.error) throw new Error(response.error);

      toast.success("Job created successfully!");
      navigate("/jobs");
    } catch (error: any) {
      toast.error(error.message || "Failed to create job");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/jobs")}>
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Job</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Job Title *
                  </label>
                  <Input
                    placeholder="e.g., Senior Flutter Developer"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Company Name *
                  </label>
                  <Input
                    placeholder="e.g., Tech Corp"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Company Logo URL
                </label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={formData.companyLogo}
                  onChange={(e) => handleInputChange("companyLogo", e.target.value)}
                />
              </div>

              <TextAreaCustom
                label="Job Description"
                name="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter job description..."
                rows={6}
              />
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Job Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Job Type *
                  </label>
                  <Select
                    placeholder="Select job type"
                    value={formData.jobType}
                    onChange={(value) => handleInputChange("jobType", value)}
                    style={{ width: "100%" }}
                    options={jobTypes}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Work Mode *
                  </label>
                  <Select
                    placeholder="Select work mode"
                    value={formData.workMode}
                    onChange={(value) => handleInputChange("workMode", value)}
                    style={{ width: "100%" }}
                    options={workModes}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Location *
                  </label>
                  <Input
                    placeholder="e.g., Noida"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Job Level
                  </label>
                  <Select
                    placeholder="Select job level"
                    value={formData.jobLevel}
                    onChange={(value) => handleInputChange("jobLevel", value)}
                    style={{ width: "100%" }}
                    options={jobLevels}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Experience (e.g., 3-5 years)
                  </label>
                  <Input
                    placeholder="3-5 years"
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Min Experience (years)
                  </label>
                  <InputNumber
                    placeholder="3"
                    value={formData.experienceMin}
                    onChange={(value) => handleInputChange("experienceMin", value || 0)}
                    style={{ width: "100%" }}
                    min={0}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Max Experience (years)
                  </label>
                  <InputNumber
                    placeholder="5"
                    value={formData.experienceMax}
                    onChange={(value) => handleInputChange("experienceMax", value || 0)}
                    style={{ width: "100%" }}
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Salary (e.g., ₹12-18 LPA)
                  </label>
                  <Input
                    placeholder="₹12-18 LPA"
                    value={formData.salary}
                    onChange={(e) => handleInputChange("salary", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Min Salary (LPA)
                  </label>
                  <InputNumber
                    placeholder="12"
                    value={formData.salaryMin}
                    onChange={(value) => handleInputChange("salaryMin", value || 0)}
                    style={{ width: "100%" }}
                    min={0}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Max Salary (LPA)
                  </label>
                  <InputNumber
                    placeholder="18"
                    value={formData.salaryMax}
                    onChange={(value) => handleInputChange("salaryMax", value || 0)}
                    style={{ width: "100%" }}
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Number of Openings
                </label>
                <InputNumber
                  placeholder="5"
                  value={formData.openings}
                  onChange={(value) => handleInputChange("openings", value || 1)}
                  style={{ width: "100%" }}
                  min={1}
                />
              </div>
            </div>

            {/* Required Skills */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Required Skills</h2>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Enter skill (e.g., Flutter)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onPressEnter={handleAddSkill}
                />
                <Button icon={<PlusOutlined />} onClick={handleAddSkill}>
                  Add Skill
                </Button>
              </div>

              {formData.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill, idx) => (
                    <Tag
                      key={idx}
                      closable
                      onClose={() => handleRemoveSkill(skill)}
                      color="blue"
                    >
                      {skill}
                    </Tag>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contact Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    HR Name
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={formData.hrName}
                    onChange={(e) => handleInputChange("hrName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    HR Contact
                  </label>
                  <Input
                    placeholder="+919999999999"
                    value={formData.hrContact}
                    onChange={(e) => handleInputChange("hrContact", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Company Email
                  </label>
                  <Input
                    type="email"
                    placeholder="hr@techcorp.com"
                    value={formData.companyEmail}
                    onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Company Phone
                  </label>
                  <Input
                    placeholder="+911234567890"
                    value={formData.companyPhone}
                    onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Company Address
                </label>
                <TextArea
                  placeholder="123 Tech Street, Noida"
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Additional Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Additional Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Expiry Date
                  </label>
                  <DatePicker
                    value={formData.expiryDate}
                    onChange={(date) => handleInputChange("expiryDate", date)}
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(value) => handleInputChange("status", value)}
                    style={{ width: "100%" }}
                    options={statuses}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={() => navigate("/jobs")}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Create Job
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


