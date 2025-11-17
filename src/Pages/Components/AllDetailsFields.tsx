import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import InputGroup from "../../components/FormElements/InputGroup";
import SelectGroupOne from "../../components/FormElements/SelectGroup/SelectGroupOne";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import {
  getStoredProductsServices,
  getStoredSources,
} from "../../api/commonAPI";

interface LeadData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  leadSource: { _id: string; name: string };
  productService: { _id: string; name: string };
  assignedAgent: { _id: string; name: string };
  leadStatus: { _id: string; name: string };
  companyName: string;
  website: string;
  alternatePhone: string;
  leadCost: number;
  position?: string;
}

interface AllDetailsFieldsProps {
  leadData?: LeadData;
  onUpdate: (data: any) => Promise<void>;
  leadStatus: string;
}

const AllDetailsFields: React.FC<AllDetailsFieldsProps> = ({
  leadData,
  onUpdate,
  leadStatus = "",
}) => {
  const serviceList = getStoredProductsServices(true);
  const sourceLis = getStoredSources(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    website: "",
    productService: "",
    productServiceName: "",
    contactNumber: "",
    alternatePhone: "",
    leadSource: "",
    leadSourceName: "",
    leadCost: "",
    // position: "",
  });

  useEffect(() => {
    if (leadData) {      
      setFormData({
        firstName: leadData?.firstName || "",
        lastName: leadData?.lastName || "",
        email: leadData?.email || "",
        companyName: leadData?.companyName || "",
        website: leadData?.website || "",
        productService: leadData?.productService?._id || "",
        productServiceName: leadData?.productService?.name || "",
        contactNumber: leadData?.contactNumber || "",
        alternatePhone: leadData?.alternatePhone || "",
        leadSource: leadData?.leadSource?._id || "",
        leadSourceName: leadData?.leadSource?.name || "",
        leadCost: leadData?.leadCost?.toString() || "",
        // position: leadData.position || "",
      });
    }
  }, [leadData]);

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.firstName.trim()) errors.push("Name is required");
    // if (!formData.lastName.trim()) errors.push("Last name is required");
    // if (!formData.email.trim()) errors.push("Email is required");
    // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //   errors.push("Please enter a valid email address");
    // }
    if (!formData.contactNumber.trim())
      errors.push("Contact number is required");
    if (!/^\d{10}$/.test(formData.contactNumber)) {
      errors.push("Contact number must be 10 digits");
    }
    if (formData.alternatePhone && !/^\d{10}$/.test(formData.alternatePhone)) {
      errors.push("Alternate phone number must be 10 digits");
    }
    if (!formData.leadSource) errors.push("Lead source is required");
    if (!formData.productService) errors.push("Service is required");
    if (formData.leadCost && isNaN(Number(formData.leadCost))) {
      errors.push("Lead cost must be a valid number");
    }

    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return false;
    }
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      setIsLoading(true);
      const updatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        leadSource: formData.leadSource,
        productService: formData.productService,
        companyName: formData.companyName,
        website: formData.website,
        alternatePhone: formData.alternatePhone,
        leadCost: Number(formData.leadCost) || 0,
        leadStatus,
        comment: "System Comment: Details update",
        // position: formData.position,
      };

      await onUpdate(updatePayload);
    } catch (error: any) {
      console.error(error.message || "Failed to update details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white dark:bg-gray-dark dark:text-white">
      <div className="mb-8 flex w-full flex-col sm:flex-row justify-between gap-4 sm:gap-8">
        <div className="flex w-full flex-col gap-4 sm:border-r-2 sm:pr-8 border-r-0 pr-0 text-dark dark:text-white">
          {/* Left Fields */}
          <InputGroup
            label="Full Name"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            placeholder="Enter full name"
          />

          {/* <InputGroup
            label="Last Name"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            placeholder="Enter last name"
          /> */}

          <InputGroup
            label="Company Name"
            name="companyName"
            type="text"
            value={formData.companyName}
            onChange={handleInputChange}
            placeholder="Enter company name"
          />

          <SelectGroupOne
            label="Service"
            options={serviceList}
            selectedOption={formData.productService}
            setSelectedOption={(value) =>
              handleSelectChange("productService", value)
            }
            required
          />

          <InputGroup
            label="Alternative Phone"
            name="alternatePhone"
            type="tel"
            value={formData.alternatePhone}
            onChange={handleInputChange}
            placeholder="Enter alternative phone"
            maxLength={10}
          />

          <SelectGroupOne
            label="Lead Source"
            options={sourceLis}
            selectedOption={formData.leadSource}
            setSelectedOption={(value) =>
              handleSelectChange("leadSource", value)
            }
            required
          />
        </div>

        {/* Right Fields */}
        <div className="flex w-full flex-col gap-4">
          <InputGroup
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
          />

          <InputGroup
            label="Website"
            name="website"
            type="text"
            value={formData.website}
            onChange={handleInputChange}
            placeholder="Enter website URL"
          />

          <InputGroup
            label="Contact Number"
            name="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={handleInputChange}
            required
            placeholder="Enter contact number"
            maxLength={10}
          />

          {/* <InputGroup
            label="Position"
            name="position"
            type="text"
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Enter position"
          /> */}

          <InputGroup
            label="Lead Cost"
            name="leadCost"
            type="number"
            value={formData.leadCost}
            onChange={handleInputChange}
            placeholder="Enter lead cost"
          />
        </div>
      </div>

      <div className="flex w-full justify-center">
        <ButtonDefault
          onClick={handleSubmit}
          label={isLoading ? "Updating..." : "Update Details"}
          variant="primary"
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default AllDetailsFields;
