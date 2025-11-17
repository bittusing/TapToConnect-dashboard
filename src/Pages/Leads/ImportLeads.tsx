import React, { useState, useRef } from "react";
import { message } from "antd";
import SelectGroupOne from "../../components/FormElements/SelectGroup/SelectGroupOne";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import FileUploadFillType from "../../components/FormElements/FileUpload/FileUploadFillType";
import { API } from "../../api";
import {
  getStoredAgents,
  getStoredCountries,
  getStoredProductsServices,
  getStoredSources,
  getStoredStatus,
} from "../../api/commonAPI";
interface BulkUploadResponse {
  totalProcessed: number;
  successful: number;
  skipped: number;
  duplicateDetails: string[];
}

const ImportLeads: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResponse | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const agentList = getStoredAgents(true);
  const serviceList = getStoredProductsServices(true);
  const sourceList = getStoredSources(true);
  const statusList = getStoredStatus(true);
  const countryOptions = getStoredCountries(true);

  // Form state
  const [formData, setFormData] = useState({
    leadSource: "",
    status: "",
    assignToAgent: "",
    service: "",
    country: "",
    state: "",
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension === "xlsx" || fileExtension === "xls") {
        setSelectedFile(file);
        setUploadResult(null); // Reset previous results
        message.success("Excel file selected successfully");
      } else {
        message.error("Please select only Excel files (.xlsx or .xls)");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedFile(null);
      }
    }
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      message.error("Please select a file first");
      return;
    }

    // if (!formData.leadSource || !formData.status || !formData.assignToAgent) {
    //   message.error("Please fill in all required fields");
    //   return;
    // }

    try {
      setIsLoading(true);

      const formPayload = new FormData();
      formPayload.append("file", selectedFile);
      formPayload.append("leadSource", formData.leadSource);
      formPayload.append("service", formData.service);
      formPayload.append("status", formData.status);
      formPayload.append("country", formData.country);
      // formPayload.append("state", formData.state);
      formPayload.append("assignToAgent", formData.assignToAgent);

      const token = localStorage.getItem("accessToken") || "";

      const response = await API.postAuthAPI1(
        formPayload,
        "bulkUplodeLead",
        token,
        null,
        true,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token,
          },
        }
      );

      if (response.error) {
        throw new Error(response.error);
      }

      setUploadResult(response.data);
      message.success("File processed successfully");

      // Reset form after successful upload
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFile(null);
      setFormData({
        leadSource: "",
        status: "",
        assignToAgent: "",
        service: "",
        country: "",
        state: "",
      });
    } catch (error: any) {
      message.error(error.message || "Failed to process file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSample = () => {
    try {
      // Create an anchor element
      const link = document.createElement("a");
      link.href = "/sampleSheet.xlsx"; // Path to the file in public directory
      link.download = "sampleSheet.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success("Sample file downloaded successfully");
    } catch (error) {
      console.error("Error downloading sample file:", error);
      message.error("Failed to download sample file");
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      {/* File Upload Section */}
      <div className="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <label className="block text-lg font-medium text-gray-700 dark:text-gray-300">
          Select File (Excel File)
        </label>
        <FileUploadFillType
          onChange={handleFileChange}
          customClasses="w-full"
          accept=".xlsx,.xls"
          ref={fileInputRef}
          tooltipInfo="Only .xls and .xlsx formats are allowed to upload"
        />
        <ButtonDefault
          label="Download Sample File"
          onClick={handleDownloadSample}
          variant="secondary"
          customClasses="w-fit"
        />
      </div>

      {/* Form Fields */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <SelectGroupOne
          label="Lead Source"
          options={sourceList}
          selectedOption={formData.leadSource}
          setSelectedOption={(value) => handleSelectChange("leadSource", value)}
        />
        <SelectGroupOne
          label="Service"
          options={serviceList}
          selectedOption={formData.service}
          setSelectedOption={(value) => handleSelectChange("service", value)}
        />
        <SelectGroupOne
          label="Status"
          options={statusList}
          selectedOption={formData.status}
          setSelectedOption={(value) => handleSelectChange("status", value)}
        />
        <SelectGroupOne
          label="Country"
          options={countryOptions}
          selectedOption={formData.country}
          setSelectedOption={(value) => handleSelectChange("country", value)}
        />
        <SelectGroupOne
          label="Assign to agent"
          options={agentList}
          selectedOption={formData.assignToAgent}
          setSelectedOption={(value) =>
            handleSelectChange("assignToAgent", value)
          }
        />
        {/* <SelectGroupOne
          label="State"
          options={mockOptions}
          selectedOption={formData.state}
          setSelectedOption={(value) => handleSelectChange("state", value)}
        /> */}
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div className="mb-6 rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-700">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Upload Results
          </h3>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p>Total Processed: {uploadResult.totalProcessed}</p>
            <p>Successfully Imported: {uploadResult.successful}</p>
            <p>Skipped: {uploadResult.skipped}</p>
            {uploadResult.duplicateDetails.length > 0 && (
              <div>
                <p className="mb-2 font-medium">Duplicate Entries:</p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  {uploadResult.duplicateDetails.map((detail, index) => (
                    <li key={index} className="text-red-600 dark:text-red-400">
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex w-full justify-center">
        <ButtonDefault
          label={isLoading ? "Processing..." : "Import Leads"}
          onClick={handleUpload}
          variant="primary"
          customClasses="w-full bg-primary text-white"
          disabled={isLoading || !selectedFile}
        />
      </div>
    </div>
  );
};

export default ImportLeads;
