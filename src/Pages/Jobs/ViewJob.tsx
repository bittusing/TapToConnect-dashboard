import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { toast } from "react-toastify";
import { Button, Tag, Descriptions, Card, Alert, Space, Image } from "antd";
import { ArrowLeftOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, UserOutlined } from "@ant-design/icons";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import dayjs from "dayjs";

interface JobData {
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
  description: string;
  requiredSkills: string[];
  jobLevel: string;
  status: string;
  viewCount: number;
  postedDate: string;
  expiryDate?: string;
  contactDetails?: {
    hrName: string;
    hrContact: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
  } | null;
  membership?: {
    hasAccess: boolean;
    monthlyViews: number;
    remainingViews: number;
    membershipActive: boolean;
  };
  message?: string;
}

export default function ViewJob() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobData | null>(null);

  useEffect(() => {
    if (id) {
      fetchJobData(id);
    }
  }, [id]);

  const fetchJobData = async (jobId: string) => {
    setLoading(true);
    try {
      const { data, error } = await API.getAuthAPI(`${END_POINT.JOBS}/${jobId}`, true);
      if (error || !data) throw new Error(error || "Failed to fetch job data");

      setJob({
        _id: data._id,
        title: data.title || "",
        company: data.company || "",
        companyLogo: data.companyLogo,
        jobType: data.jobType || "",
        workMode: data.workMode || "",
        location: data.location || "",
        experience: data.experience || "",
        salary: data.salary || "",
        openings: data.openings || 0,
        description: data.description || "",
        requiredSkills: data.requiredSkills || [],
        jobLevel: data.jobLevel || "",
        status: data.status || "active",
        viewCount: data.viewCount || 0,
        postedDate: data.postedDate || data.createdAt,
        expiryDate: data.expiryDate,
        contactDetails: data.contactDetails || null,
        membership: data.membership,
        message: data.message,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch job data");
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <MiniLoader />;
  if (!job) return null;

  const hasContactAccess = job.membership?.hasAccess && job.membership?.remainingViews > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/jobs")}>
              Back
            </Button>
            <Button onClick={() => navigate(`/jobs/${id}/edit`)}>Edit Job</Button>
          </div>

          {/* Membership Status Alert */}
          {job.membership && (
            <div className="mb-6">
              {hasContactAccess ? (
                <Alert
                  message={`Membership Active - ${job.membership.remainingViews} views remaining this month`}
                  type="success"
                  showIcon
                />
              ) : (
                <Alert
                  message={
                    !job.membership.membershipActive
                      ? "Membership required to view contact details"
                      : job.membership.remainingViews === 0
                      ? "Monthly view limit reached. Contact details will be available next month."
                      : "Membership required to view contact details"
                  }
                  type="warning"
                  showIcon
                />
              )}
            </div>
          )}

          {/* Job Header */}
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              {job.companyLogo && (
                <Image
                  src={job.companyLogo}
                  alt={job.company}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                  fallback="https://via.placeholder.com/80"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h1>
                <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-4">{job.company}</h2>
                <div className="flex flex-wrap gap-2">
                  <Tag color="blue">{job.jobType}</Tag>
                  <Tag color="green">{job.workMode}</Tag>
                  <Tag color="orange">{job.location}</Tag>
                  {job.jobLevel && <Tag color="purple">{job.jobLevel}</Tag>}
                  <Tag color={job.status === "active" ? "green" : "red"}>{job.status}</Tag>
                </div>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <Descriptions
            title="Job Details"
            bordered
            column={{ xs: 1, sm: 2, md: 3 }}
            className="mb-6"
          >
            <Descriptions.Item label="Experience">{job.experience || "Not specified"}</Descriptions.Item>
            <Descriptions.Item label="Salary">
              <span className="font-semibold text-green-600">{job.salary}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Openings">
              <Tag color="orange">{job.openings}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Posted Date">
              {dayjs(job.postedDate).format("MMMM DD, YYYY")}
            </Descriptions.Item>
            {job.expiryDate && (
              <Descriptions.Item label="Expiry Date">
                {dayjs(job.expiryDate).format("MMMM DD, YYYY")}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Total Views">
              <span className="text-gray-600">{job.viewCount}</span>
            </Descriptions.Item>
          </Descriptions>

          {/* Required Skills */}
          {job.requiredSkills.length > 0 && (
            <Card title="Required Skills" className="mb-6">
              <Space size={[8, 16]} wrap>
                {job.requiredSkills.map((skill, idx) => (
                  <Tag key={idx} color="purple" className="text-base py-1 px-3">
                    {skill}
                  </Tag>
                ))}
              </Space>
            </Card>
          )}

          {/* Job Description */}
          <Card title="Job Description" className="mb-6">
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.description || "No description provided."}
            </div>
          </Card>

          {/* Contact Details */}
          <Card
            title="Contact Details"
            className="mb-6"
            extra={
              !hasContactAccess && (
                <Tag color="orange">Membership Required</Tag>
              )
            }
          >
            {hasContactAccess && job.contactDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <UserOutlined className="text-2xl text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">HR Contact</div>
                      <div className="font-semibold">{job.contactDetails.hrName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneOutlined className="text-2xl text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">HR Phone</div>
                      <a
                        href={`tel:${job.contactDetails.hrContact}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {job.contactDetails.hrContact}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MailOutlined className="text-2xl text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Company Email</div>
                      <a
                        href={`mailto:${job.contactDetails.companyEmail}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {job.contactDetails.companyEmail}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <PhoneOutlined className="text-2xl text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Company Phone</div>
                      <a
                        href={`tel:${job.contactDetails.companyPhone}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {job.contactDetails.companyPhone}
                      </a>
                    </div>
                  </div>
                </div>
                {job.contactDetails.companyAddress && (
                  <div className="flex items-start gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <EnvironmentOutlined className="text-2xl text-gray-500 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Company Address</div>
                      <div className="font-semibold">{job.contactDetails.companyAddress}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">
                  {job.message || "Contact details are only available to members with active membership and remaining views."}
                </p>
                {!job.membership?.membershipActive && (
                  <Button type="primary" onClick={() => navigate("/membership")}>
                    Get Membership
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}


