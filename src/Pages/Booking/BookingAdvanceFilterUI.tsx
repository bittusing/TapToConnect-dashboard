import React, { useState } from "react";
import { Row, Col, Select } from "antd";
import ButtonDefault from "../../components/Buttons/ButtonDefault";

const { Option } = Select;

interface BookingAdvanceFilterUIProps {
  onFilter: (filters: {
    status?: string;
    vertical?: string;
    as?: string;
    vp?: string;
    avp?: string;
    gm?: string;
    agm?: string;
    tlcp?: string;
    employee?: string;
  }) => void;
  onReset: () => void;
  loading?: boolean;
  setIsAdvanceFilterEnable?: (value: boolean) => void;
}

interface FilterState {
  status: string;
  vertical: string;
  as: string;
  vp: string;
  avp: string;
  gm: string;
  agm: string;
  tlcp: string;
  employee: string;
}

const BookingAdvanceFilterUI: React.FC<BookingAdvanceFilterUIProps> = ({
  onFilter,
  onReset,
  loading = false,
  setIsAdvanceFilterEnable,
}) => {
  // Mock options for dropdowns (in a real app, these would come from an API)
  const statusOptions = ['Pending', 'Complete', 'Canceled'];
  const verticalOptions = ['Residential', 'Commercial', 'Industrial'];
  const asOptions = ['AS 1', 'AS 2', 'AS 3'];
  const vpOptions = ['VP 1', 'VP 2', 'VP 3'];
  const avpOptions = ['AVP 1', 'AVP 2', 'AVP 3'];
  const gmOptions = ['GM 1', 'GM 2', 'GM 3'];
  const agmOptions = ['AGM 1', 'AGM 2', 'AGM 3'];
  const tlcpOptions = ['TL/CP 1', 'TL/CP 2', 'TL/CP 3'];
  const employeeOptions = ['Employee 1', 'Employee 2', 'Employee 3'];

  const [filters, setFilters] = useState<FilterState>({
    status: "",
    vertical: "",
    as: "",
    vp: "",
    avp: "",
    gm: "",
    agm: "",
    tlcp: "",
    employee: "",
  });

  const handleChange = (field: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Filter out empty values
    const validFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc[key as keyof FilterState] = value;
        }
        return acc;
      },
      {} as Partial<FilterState>
    );

    onFilter(validFilters);
    if (setIsAdvanceFilterEnable) {
      setIsAdvanceFilterEnable(false);
    }
  };

  const handleReset = () => {
    setFilters({
      status: "",
      vertical: "",
      as: "",
      vp: "",
      avp: "",
      gm: "",
      agm: "",
      tlcp: "",
      employee: "",
    });
    onReset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <div className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">Select Status</div>
            <Select
              placeholder="Select Status"
              style={{ width: '100%' }}
              value={filters.status || undefined}
              onChange={(value) => handleChange('status', value)}
              allowClear
            >
              {statusOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">Select Vertical</div>
            <Select
              placeholder="Select Vertical"
              style={{ width: '100%' }}
              value={filters.vertical || undefined}
              onChange={(value) => handleChange('vertical', value)}
              allowClear
            >
              {verticalOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">Select AS</div>
            <Select
              placeholder="Select AS"
              style={{ width: '100%' }}
              value={filters.as || undefined}
              onChange={(value) => handleChange('as', value)}
              allowClear
            >
              {asOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">Select VP</div>
            <Select
              placeholder="Select VP"
              style={{ width: '100%' }}
              value={filters.vp || undefined}
              onChange={(value) => handleChange('vp', value)}
              allowClear
            >
              {vpOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      <div className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">Select AVP</div>
            <Select
              placeholder="Select AVP"
              style={{ width: '100%' }}
              value={filters.avp || undefined}
              onChange={(value) => handleChange('avp', value)}
              allowClear
            >
              {avpOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">Select GM</div>
            <Select
              placeholder="Select GM"
              style={{ width: '100%' }}
              value={filters.gm || undefined}
              onChange={(value) => handleChange('gm', value)}
              allowClear
            >
              {gmOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">Select AGM</div>
            <Select
              placeholder="Select AGM"
              style={{ width: '100%' }}
              value={filters.agm || undefined}
              onChange={(value) => handleChange('agm', value)}
              allowClear
            >
              {agmOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">Select TL/CP</div>
            <Select
              placeholder="Select TL/CP"
              style={{ width: '100%' }}
              value={filters.tlcp || undefined}
              onChange={(value) => handleChange('tlcp', value)}
              allowClear
            >
              {tlcpOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      <div className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">Select Employee</div>
            <Select
              placeholder="Select Employee"
              style={{ width: '100%' }}
              value={filters.employee || undefined}
              onChange={(value) => handleChange('employee', value)}
              allowClear
            >
              {employeeOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      <div className="flex justify-center gap-4">
        <ButtonDefault
          label={loading ? "Filtering..." : "Apply Filters"}
          onClick={handleSubmit}
          variant="primary"
          customClasses="bg-blue-500 text-white"
          disabled={loading}
        />
        <ButtonDefault
          label="Reset"
          onClick={handleReset}
          variant="secondary"
          customClasses="bg-black text-white"
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default BookingAdvanceFilterUI; 