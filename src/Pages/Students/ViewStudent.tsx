import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import TabPanel from "../../components/TabPanel/TabPanel";
import { 
  FaUser, 
  FaShieldAlt, 
  FaGraduationCap, 
  FaHeart,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaCode,
  FaBook,
  FaCertificate,
  FaCreditCard,
  FaShoppingCart,
  FaHistory
} from "react-icons/fa";
import { Tag, Avatar, Card, Descriptions, Table, Button, Space } from "antd";
import ButtonDefault from "../../components/Buttons/ButtonDefault";

interface StudentData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePic?: string;
  bio?: string;
  role: string;
  isActive: boolean;
  isPrime: boolean;
  // Profile fields
  skills: string[];
  technologies: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  // Education fields
  college?: string;
  course?: string;
  semester?: string;
  // Additional info
  lastLogin?: string;
  createdAt: string;
}

const ViewStudent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  useEffect(() => {
    if (id) {
    //  fetchStudentData(id);
    }
  }, [id]);

  const fetchStudentData = async (studentId: string) => {
    setLoading(true);
    try {
      const { data, error } = await API.getAuthAPI(`${END_POINT.USERS}/${studentId}`, true);
      if (error || !data) throw new Error(error);
      
      setStudentData(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch student data");
      navigate("/students");
    } finally {
      setLoading(false);
    }
  };

  // if (loading && !studentData) return <MiniLoader />;

  const tabsData = [
    {
      tabName: (
        <span className="flex items-center gap-2">
          <FaUser /> Basic Details
        </span>
      ),
      component: (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-6 mb-6">
              <Avatar 
                size={120} 
                src={studentData?.profilePic}
              >
                {studentData?.name?.[0]?.toUpperCase()}
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{studentData?.name}</h2>
                <p className="text-gray-600">{studentData?.email}</p>
                <div className="flex gap-2 mt-2">
                  <Tag color={studentData?.isActive ? "green" : "red"}>
                    {studentData?.isActive ? "Active" : "Inactive"}
                  </Tag>
                  {studentData?.isPrime && (
                    <Tag color="gold">Premium</Tag>
                  )}
                  <Tag color="blue">{studentData?.role}</Tag>
                </div>
              </div>
            </div>

            <Descriptions bordered column={2}>
              <Descriptions.Item label="Name">{studentData?.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{studentData?.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{studentData?.phone || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Role">{studentData?.role}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={studentData?.isActive ? "green" : "red"}>
                  {studentData?.isActive ? "Active" : "Inactive"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Subscription">
                <Tag color={studentData?.isPrime ? "gold" : "default"}>
                  {studentData?.isPrime ? "Premium" : "Free"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Last Login">
                {studentData?.lastLogin ? new Date(studentData.lastLogin).toLocaleString() : "Never"}
              </Descriptions.Item>
              <Descriptions.Item label="Joined Date">
                {studentData?.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : "N/A"}
              </Descriptions.Item>
            </Descriptions>

            {studentData?.bio && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Bio</h3>
                <p className="text-gray-700 dark:text-gray-300">{studentData.bio}</p>
              </div>
            )}
          </Card>
        </div>
      ),
    },
    {
      tabName: (
        <span className="flex items-center gap-2">
          <FaShieldAlt /> Social Media & Information
        </span>
      ),
      component: (
        <Card>
          <Descriptions bordered column={1}>
            <Descriptions.Item 
              label={
                <span className="flex items-center gap-2">
                  <FaGithub className="text-2xl" /> GitHub
                </span>
              }
            >
              {studentData?.github ? (
                <a href={studentData.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {studentData.github}
                </a>
              ) : "N/A"}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <span className="flex items-center gap-2">
                  <FaLinkedin className="text-blue-600 text-2xl" /> LinkedIn
                </span>
              }
            >
              {studentData?.linkedin ? (
                <a href={studentData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {studentData.linkedin}
                </a>
              ) : "N/A"}
            </Descriptions.Item>
            
            <Descriptions.Item 
              label={
                <span className="flex items-center gap-2">
                  <FaGlobe className="text-2xl" /> Portfolio
                </span>
              }
            >
              {studentData?.portfolio ? (
                <a href={studentData.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {studentData.portfolio}
                </a>
              ) : "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="College">
              {studentData?.college || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Course">
              {studentData?.course || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Semester">
              {studentData?.semester || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      tabName: (
        <span className="flex items-center gap-2">
          <FaCode /> Skills & Technologies
        </span>
      ),
      component: (
        <div className="space-y-6">
          <Card title="Skills">
            {studentData?.skills && studentData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {studentData.skills.map((skill, index) => (
                  <Tag key={index} color="blue" className="text-base py-1 px-3">
                    {skill}
                  </Tag>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No skills added yet</p>
            )}
          </Card>

          <Card title="Technologies">
            {studentData?.technologies && studentData.technologies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {studentData.technologies.map((tech, index) => (
                  <Tag key={index} color="green" className="text-base py-1 px-3">
                    {tech}
                  </Tag>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No technologies added yet</p>
            )}
          </Card>
        </div>
      ),
    },
    {
      tabName: (
        <span className="flex items-center gap-2">
          <FaBook /> Enrollments
        </span>
      ),
      component: (
        <Card>
          <p className="text-gray-600 mb-4">
            Display all courses this student is enrolled in
          </p>
          <Table
            columns={[
              { title: "Course Name", dataIndex: "name", key: "name" },
              { title: "Instructor", dataIndex: "instructor", key: "instructor" },
              { title: "Enrolled Date", dataIndex: "enrolledDate", key: "enrolledDate" },
              { title: "Progress", dataIndex: "progress", key: "progress" },
              { title: "Status", dataIndex: "status", key: "status" },
            ]}
            dataSource={[]}
            pagination={false}
            locale={{ emptyText: "No enrollments found" }}
          />
        </Card>
      ),
    },
    {
      tabName: (
        <span className="flex items-center gap-2">
          <FaCertificate /> Subscription
        </span>
      ),
      component: (
        <div className="space-y-6">
          <Card title="Current Subscription">
            <Descriptions bordered>
              <Descriptions.Item label="Status">
                <Tag color={studentData?.isPrime ? "gold" : "default"}>
                  {studentData?.isPrime ? "Premium" : "Free"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {studentData?.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Features">
                {studentData?.isPrime ? (
                  <div className="space-y-1">
                    <Tag color="green">Premium Courses</Tag>
                    <Tag color="green">Priority Support</Tag>
                    <Tag color="green">Certificates</Tag>
                  </div>
                ) : (
                  <div>
                    <Tag>Basic Access</Tag>
                  </div>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Subscription History">
            <Table
              columns={[
                { title: "Plan", dataIndex: "plan", key: "plan" },
                { title: "Start Date", dataIndex: "startDate", key: "startDate" },
                { title: "End Date", dataIndex: "endDate", key: "endDate" },
                { title: "Amount", dataIndex: "amount", key: "amount" },
                { title: "Status", dataIndex: "status", key: "status" },
              ]}
              dataSource={[]}
              pagination={false}
              locale={{ emptyText: "No subscription history" }}
            />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Details</h1>
            <Space>
              <ButtonDefault
                type="button"
                label="Back to Students"
                variant="outline"
                onClick={() => navigate("/students")}
              />
              <ButtonDefault
                type="button"
                label="Edit Student"
                variant="primary"
                onClick={() => navigate(`/students/${id}/edit`)}
              />
            </Space>
          </div>

          {studentData && (
            <TabPanel
              tabsData={tabsData}
              type="line"
              defaultActiveKey="1"
              size="large"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStudent;

