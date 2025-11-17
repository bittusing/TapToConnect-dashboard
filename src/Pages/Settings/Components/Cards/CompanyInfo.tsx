import { useState, useEffect } from "react";
import { FaBuilding } from "react-icons/fa";
import { toast } from "react-toastify";
import Card from "../../../../components/CommonUI/Card";
import ButtonDefault from "../../../../components/Buttons/ButtonDefault";
import InputGroup from "../../../../components/FormElements/InputGroup";
import { InfoItem } from "../../../../components/CommonUI/InfoItem";
import { updateCompanyInfo } from "./CardApis";

interface CompanyInfo {
  name: string;
  industry: string;
  size: string;
  taxId: string;
  status: string;
}

const CompanyInfoCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CompanyInfo>({
    name: "-",
    industry: "-",
    size: "-",
    taxId: "-",
    status: "active",
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        const company = userData.company || {};
        setFormData((prev) => ({
          ...prev,
          name: company.name || "-",
          industry: company.industry || "-",
          size: company.size || "-",
          taxId: company.taxId || "-",
          status: company.status || "active",
        }));
      } catch (error) {
        console.error("Error loading company data:", error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // API Update
      const response = await updateCompanyInfo({
        name: formData.name,
        industry: formData.industry,
        size: formData.size,
        taxId: formData.taxId,
        status: formData.status,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Local Storage Update
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        const updatedUserData = {
          ...userData,
          company: {
            ...userData.company,
            ...formData,
          },
        };
        localStorage.setItem("user", JSON.stringify(updatedUserData));
      }

      toast.success("Company information updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error(error.message || "Failed to update company information");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FaBuilding className="text-xl text-primary" />
          <h2 className="text-xl font-semibold dark:text-white">
            Company Information
          </h2>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <ButtonDefault
              label="Cancel"
              onClick={() => setIsEditing(false)}
              variant="secondary"
              customClasses="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2"
            />
            <ButtonDefault
              label={isLoading ? "Saving..." : "Save"}
              onClick={handleSubmit}
              variant="primary"
              customClasses="bg-primary hover:bg-primary/90 text-white px-4 py-2"
              disabled={isLoading}
            />
          </div>
        ) : (
          <ButtonDefault
            label="Edit"
            onClick={() => setIsEditing(true)}
            variant="primary"
            customClasses="bg-primary hover:bg-primary/90 text-white px-4 py-2"
          />
        )}
      </div>

      {isEditing ? (
        <div>
          <InputGroup
            label="Company Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
          />
          <InputGroup
            label="Industry"
            name="industry"
            type="text"
            value={formData.industry}
            onChange={handleInputChange}
          />
          <InputGroup
            label="Company Size"
            name="size"
            type="text"
            value={formData.size}
            onChange={handleInputChange}
          />
          <InputGroup
            label="Tax ID"
            name="taxId"
            type="text"
            value={formData.taxId}
            onChange={handleInputChange}
          />
        </div>
      ) : (
        <>
          <InfoItem label="Company Name" value={formData.name} />
          <InfoItem label="Industry" value={formData.industry} />
          <InfoItem label="Company Size" value={formData.size} />
          <InfoItem label="Tax ID" value={formData.taxId} />
          <InfoItem label="Status" value={formData.status} isStatus={true} />
        </>
      )}
    </Card>
  );
};

export default CompanyInfoCard;
