import React, { useState, useEffect } from "react";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import SelectGroupOne from "../../components/FormElements/SelectGroup/SelectGroupOne";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import FileUploadFillType from "../../components/FormElements/FileUpload/FileUploadFillType";
import TextAreaCustom from "../FormElements/TextArea/TextAreaCustom";
import InputGroup from "../../components/FormElements/InputGroup";
import { getStoredAgents, getStoredStatus } from "../../api/commonAPI";

interface BulkMessageProps {
  data?: any[];
  type: "active" | "all" | "contacts" | "none";
  mode?: "sms" | "whatsapp";
  onRefresh?: () => void;
  showActionControl?: boolean;
}

const templateOptions = [
  { value: "template1", label: "Template 1" },
  { value: "template2", label: "Template 2" },
];

const BulkMessage: React.FC<BulkMessageProps> = ({
  data,
  type,
  mode = "whatsapp",
  showActionControl = true,
  onRefresh,
}) => {
  const agentOptions = getStoredAgents(true);
  const baseOptions = getStoredStatus(true);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    status: "",
    agent: "",
    template: "",
    message: "",
  });
  const [charCount, setCharCount] = useState(0);
  const [smsCount, setSmsCount] = useState(1);

  useEffect(() => {
    // if (mode === "sms") {
    const count = formData.message.length;
    setCharCount(count);
    // Calculate SMS count (160 chars per SMS)
    setSmsCount(Math.ceil(count / 160) || 1);
    // }
  }, [formData.message, mode]);

  const getStatusOptions = () => {
    if (type === "active") {
      return baseOptions.filter((opt) => opt.label.toLowerCase() !== "lost");
    }
    return baseOptions;
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Number",
      dataIndex: "number",
      key: "number",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Agent",
      dataIndex: "agent",
      key: "agent",
    },
    {
      title: "Followup date",
      dataIndex: "followupDate",
      key: "followupDate",
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const handleSubmit = async () => {
    console.log("Submitting:", { type, formData, selectedRows });
  };

  const handleSend = async () => {
    console.log("Sending message to:", selectedRows);
  };

  return (
    <div className="w-full rounded-lg bg-white dark:bg-gray-800">
      {/* Action Controls Section */}
      {showActionControl && (
        <div className="mb-2 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900 sm:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <SelectGroupOne
              label="Status"
              options={getStatusOptions()}
              selectedOption={formData.status}
              setSelectedOption={(value) => handleSelectChange("status", value)}
              placeholder="Select Status"
            />

            <SelectGroupOne
              label="Agent"
              options={agentOptions}
              selectedOption={formData.agent}
              setSelectedOption={(value) => handleSelectChange("agent", value)}
              placeholder="Select Agent"
            />

            <ButtonDefault
              label="Submit"
              onClick={handleSubmit}
              variant="primary"
              customClasses="self-end w-full"
            />
          </div>
        </div>
      )}

      {/* Message Section */}
      <div className="mb-2 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Message Input */}
          <div className={"lg:col-span-6"}>
            <TextAreaCustom
              label="Message"
              name="message"
              value={formData.message}
              onChange={(e) => handleSelectChange("message", e.target.value)}
              placeholder="Enter Message"
              rows={5}
            />
          </div>

          <div className="flex flex-col gap- justify-between lg:col-span-3">
            {/* Template Selection */}
            <SelectGroupOne
              label="Select Template"
              options={templateOptions}
              selectedOption={formData.template}
              setSelectedOption={(value) =>
                handleSelectChange("template", value)
              }
              placeholder="Choose Template"
            />
            {/* Character Count */}
            <InputGroup
              label="Characters"
              type="text"
              value={charCount.toString()}
              readOnly
            />
          </div>

          {/* <div className="lg:col-span-2"></div> */}

          {/* Image Upload and Send */}
          <div className="flex flex-col justify-between lg:col-span-3">
            {mode !== "sms" ? (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Image
                </label>
                <FileUploadFillType
                  accept="image/*"
                  tooltipInfo="Upload an image file"
                />
              </div>
            ) : (
              <InputGroup
                label="No of SMS"
                type="text"
                value={smsCount.toString()}
                readOnly
              />
            )}

            <ButtonDefault
              label="Send"
              onClick={handleSend}
              variant="primary"
              customClasses="w-full mt-auto"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-lg border border-gray-100 dark:border-gray-700">
        <CustomAntdTable
          columns={columns}
          dataSource={data}
          pagination={{
            pageSize: 10,
            total: data?.length,
          }}
        />
      </div>
    </div>
  );
};

export default BulkMessage;
