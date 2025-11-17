import React from "react";
import { Card, Row, Col, Typography, Spin } from "antd";
import { PhoneOutlined, ClockCircleOutlined, BarChartOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface AnalysisProps {
  data?: {
    mobileCallAnalysis: {
      topCaller: {
        number: string;
        totalCalls: number;
      };
    };
    totalCallDurationAnalysis: {
      longestDuration: {
        duration: string;
        callTo: string;
        callTime: string;
      };
    };
    averageCallDurationAnalysis: {
      perCall: string;
      totalCalls: number;
      perDay: string;
      totalDays: number;
    };
  };
  isLoading?: boolean;
}

interface AnalysisCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ icon, title, children }) => (
  <Card className="h-full bg-white dark:bg-gray-800 shadow-md">
    <div className="flex items-center mb-4">
      {icon}
      <Title level={4} className="ml-2 mb-0 dark:text-white">
        {title}
      </Title>
    </div>
    {children}
  </Card>
);

const AnalysisReport: React.FC<AnalysisProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-6 text-gray-500 dark:text-gray-400">
        No analysis data available
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900">
      <Row gutter={[16, 16]}>
        {/* Mobile Call Analysis Card */}
        <Col xs={24} md={8}>
          <AnalysisCard
            icon={<PhoneOutlined className="text-2xl text-blue-500" />}
            title="Mobile Call Analysis"
          >
            <div className="border-l-4 border-yellow-500 pl-4 mb-4">
              <Text strong className="block mb-2 dark:text-white">
                Top Caller
              </Text>
              <Text className="dark:text-gray-300">
                {data.mobileCallAnalysis?.topCaller?.number}
              </Text>
              <Text strong className="block mt-4 mb-2 dark:text-white">
                Total Calls: {data.mobileCallAnalysis?.topCaller?.totalCalls} (Incoming + Outgoing)
              </Text>
            </div>
            <Paragraph className="text-sm text-gray-600 dark:text-gray-400">
              Highest total number of outgoing (dialed), incoming (answered) or both (caller) among all registered mobile numbers.
            </Paragraph>
          </AnalysisCard>
        </Col>

        {/* Total Call Duration Analysis Card */}
        <Col xs={24} md={8}>
          <AnalysisCard
            icon={<ClockCircleOutlined className="text-2xl text-green-500" />}
            title="Total Call Duration Analysis"
          >
            <div className="border-l-4 border-yellow-500 pl-4 mb-4">
              <Text strong className="block mb-2 dark:text-white">
                Longest Duration
              </Text>
              <Text className="dark:text-gray-300">
                Duration: {data.totalCallDurationAnalysis?.longestDuration?.duration}
              </Text>
              <Text strong className="block mt-2 mb-2 dark:text-white">
                Call To: {data.totalCallDurationAnalysis?.longestDuration?.callTo}
              </Text>
              <Text strong className="block mb-2 dark:text-white">
                Call Time: {data.totalCallDurationAnalysis?.longestDuration?.callTime}
              </Text>
            </div>
            <Paragraph className="text-sm text-gray-600 dark:text-gray-400">
              Highest total call duration (incoming and outgoing) among all registered mobile numbers and longest call duration (incoming or outgoing) from one mobile number among all.
            </Paragraph>
          </AnalysisCard>
        </Col>

        {/* Average Call Duration Analysis Card */}
        <Col xs={24} md={8}>
          <AnalysisCard
            icon={<BarChartOutlined className="text-2xl text-purple-500" />}
            title="Average Call Duration Analysis"
          >
            <div className="border-l-4 border-yellow-500 pl-4 mb-4">
              <Text strong className="block mb-2 dark:text-white">
                Average Duration per Call
              </Text>
              <Text className="dark:text-gray-300">
                {data.averageCallDurationAnalysis?.perCall} (Total Calls: {data.averageCallDurationAnalysis?.totalCalls})
              </Text>
              <Text strong className="block mt-4 mb-2 dark:text-white">
                Average Duration per Day
              </Text>
              <Text className="dark:text-gray-300">
                {data.averageCallDurationAnalysis?.perDay} (Total Days: {data.averageCallDurationAnalysis?.totalDays})
              </Text>
            </div>
            <Paragraph className="text-sm text-gray-600 dark:text-gray-400">
              Average call duration (incoming and outgoing) among all registered mobile numbers, (i) per Call (ii) per Day
            </Paragraph>
          </AnalysisCard>
        </Col>
      </Row>

      <style>{`
        .dark .ant-card-bordered {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .ant-typography {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default AnalysisReport;