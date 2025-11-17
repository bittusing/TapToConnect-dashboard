import { useState, useEffect, useMemo } from "react";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Tag as AntdTag, Space, Select, Input, InputNumber, Row, Col } from "antd";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";

interface JobData {
  key: string;
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  jobType: string;
  workMode: string;
  location: string;
  experience: string;
  salary: string;
  openings: number;
  requiredSkills: string[];
  jobLevel: string;
  status: string;
  viewCount: number;
  postedDate: string;
  contactDetails?: {
    hrName: string;
    hrContact: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
  } | null;
}

const AllJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    location: "",
    jobType: "",
    workMode: "",
    experience: "",
    jobLevel: "",
    minSalary: undefined as number | undefined,
    maxSalary: undefined as number | undefined,
    status: "active",
  });
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

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

  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setPagination({ ...pagination, current: 1 });
      fetchJobs(term);
    }, 500),
    [pagination]
  );

  const fetchJobs = async (search: string = "") => {
    setLoading(true);
    try {
      const params: any = {
        search,
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status,
      };

      if (filters.location) params.location = filters.location;
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.workMode) params.workMode = filters.workMode;
      if (filters.experience) params.experience = filters.experience;
      if (filters.jobLevel) params.jobLevel = filters.jobLevel;
      if (filters.minSalary) params.minSalary = filters.minSalary;
      if (filters.maxSalary) params.maxSalary = filters.maxSalary;

      const response = await API.getAuthAPI(END_POINT.JOBS, true, params);
      if (response.error) throw new Error(response.error);

      const jobsData = response?.data?.jobs || response?.data || [];
      const jobsList = (Array.isArray(jobsData) ? jobsData : []).map((job: any) => ({
        key: job._id || job.id,
        _id: job._id || job.id,
        title: job.title,
        company: job.company,
        companyLogo: job.companyLogo,
        jobType: job.jobType,
        workMode: job.workMode,
        location: job.location,
        experience: job.experience,
        salary: job.salary,
        openings: job.openings || 0,
        requiredSkills: job.requiredSkills || [],
        jobLevel: job.jobLevel,
        status: job.status || "active",
        viewCount: job.viewCount || 0,
        postedDate: job.postedDate || job.createdAt,
        contactDetails: job.contactDetails || null,
      }));

      setJobs(jobsList);
      setPagination({
        ...pagination,
        total: response?.data?.pagination?.total || jobsList.length,
      });

      // Extract unique locations for filter
      const locations = [...new Set(jobsList.map((job) => job.location).filter(Boolean))];
      setAvailableLocations(locations);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    if (searchTerm !== "") {
      debouncedSearch(searchTerm);
    } else {
      fetchJobs();
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const response = await API.DeleteAuthAPI(jobId, END_POINT.JOBS, true);
      if (response.error) throw new Error(response.error);
      toast.success("Job deleted successfully");
      fetchJobs(searchTerm);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete job");
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination({ ...pagination, current: 1 });
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      jobType: "",
      workMode: "",
      experience: "",
      jobLevel: "",
      minSalary: undefined,
      maxSalary: undefined,
      status: "active",
    });
    setPagination({ ...pagination, current: 1 });
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: JobData) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-sm text-gray-500">{record.company}</div>
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Job Type",
      dataIndex: "jobType",
      key: "jobType",
      render: (jobType: string) => <AntdTag color="blue">{jobType}</AntdTag>,
    },
    {
      title: "Work Mode",
      dataIndex: "workMode",
      key: "workMode",
      render: (workMode: string) => <AntdTag color="green">{workMode}</AntdTag>,
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      render: (salary: string) => <span className="font-medium text-green-600">{salary}</span>,
    },
    {
      title: "Skills",
      dataIndex: "requiredSkills",
      key: "requiredSkills",
      render: (skills: string[]) => (
        <Space size={[0, 8]} wrap>
          {skills?.slice(0, 3).map((skill, idx) => (
            <AntdTag key={idx} color="purple">
              {skill}
            </AntdTag>
          ))}
          {skills?.length > 3 && <AntdTag>+{skills.length - 3}</AntdTag>}
        </Space>
      ),
    },
    {
      title: "Openings",
      dataIndex: "openings",
      key: "openings",
      width: 100,
      render: (openings: number) => <AntdTag color="orange">{openings}</AntdTag>,
    },
    {
      title: "Views",
      dataIndex: "viewCount",
      key: "viewCount",
      width: 100,
      render: (count: number) => <span className="text-gray-600">{count || 0}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <AntdTag color={status === "active" ? "green" : status === "closed" ? "red" : "orange"}>
          {status}
        </AntdTag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_: any, record: JobData) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => navigate(`/jobs/${record._id}/view`)}>
            View
          </Button>
          <Button icon={<EditOutlined />} onClick={() => navigate(`/jobs/${record._id}/edit`)}>
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteJob(record._id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  if (loading && jobs.length === 0) return <MiniLoader />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/jobs/create")}>
              Add Job
            </Button>
          </div>

          {/* Filters */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Location"
                  value={filters.location || undefined}
                  onChange={(value) => handleFilterChange("location", value)}
                  allowClear
                  showSearch
                  style={{ width: "100%" }}
                  options={availableLocations.map((loc) => ({ label: loc, value: loc }))}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Job Type"
                  value={filters.jobType || undefined}
                  onChange={(value) => handleFilterChange("jobType", value)}
                  allowClear
                  style={{ width: "100%" }}
                  options={jobTypes}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Work Mode"
                  value={filters.workMode || undefined}
                  onChange={(value) => handleFilterChange("workMode", value)}
                  allowClear
                  style={{ width: "100%" }}
                  options={workModes}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Job Level"
                  value={filters.jobLevel || undefined}
                  onChange={(value) => handleFilterChange("jobLevel", value)}
                  allowClear
                  style={{ width: "100%" }}
                  options={jobLevels}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Experience (e.g., 3-5 years)"
                  value={filters.experience}
                  onChange={(e) => handleFilterChange("experience", e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <InputNumber
                  placeholder="Min Salary (LPA)"
                  value={filters.minSalary}
                  onChange={(value) => handleFilterChange("minSalary", value || undefined)}
                  style={{ width: "100%" }}
                  min={0}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <InputNumber
                  placeholder="Max Salary (LPA)"
                  value={filters.maxSalary}
                  onChange={(value) => handleFilterChange("maxSalary", value || undefined)}
                  style={{ width: "100%" }}
                  min={0}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Status"
                  value={filters.status}
                  onChange={(value) => handleFilterChange("status", value)}
                  style={{ width: "100%" }}
                  options={statuses}
                />
              </Col>
              <Col xs={24} sm={24} md={24}>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </Col>
            </Row>
          </div>

          <CustomAntdTable
            columns={columns}
            dataSource={jobs}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            pagination={pagination}
            setPagination={setPagination}
          />
        </div>
      </div>
    </div>
  );
};

export default AllJobs;


