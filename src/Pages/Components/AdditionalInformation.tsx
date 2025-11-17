import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import InputGroup from "../../components/FormElements/InputGroup";
import SelectGroupOne from "../../components/FormElements/SelectGroup/SelectGroupOne";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import { getStoredCountries } from "../../api/commonAPI";
import { API } from "../../api";

interface LeadData {
  _id: string;
  country: string;
  fullAddress: string;
  state: string;
  pinCode: string;
  city: string;
}

interface AdditionalInformationProps {
  leadData?: LeadData;
  onUpdate: (data: any) => Promise<void>;
  leadStatus?: string;
}

interface StateOption {
  value: string;
  label: string;
}

const AdditionalInformation: React.FC<AdditionalInformationProps> = ({
  leadData,
  onUpdate,
  leadStatus,
}) => {
  const countryOptions = getStoredCountries(true);

  const [isLoading, setIsLoading] = useState(false);
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [formData, setFormData] = useState({
    country: "",
    fullAddress: "",
    state: "",
    pinCode: "",
    city: "",
  });

  useEffect(() => {
    if (leadData) {
      setFormData({
        country: leadData.country || "",
        fullAddress: leadData.fullAddress || "",
        state: leadData.state || "",
        pinCode: leadData.pinCode || "",
        city: leadData.city || "",
      });
    }
  }, [leadData]);

  const fetchStates = async (countryCode: string) => {
    try {
      const response = await API.getAuthAPI(
        `locations/states/${countryCode}`,
        true
      );

      if (response.error) throw new Error(response.error);

      const states = response.data.map(
        (state: { name: string; _id: string }) => ({
          value: state._id,
          label: state.name,
        })
      );

      setStateOptions(states);
    } catch (error: any) {
      console.error(error.message || "Failed to fetch states");
      setStateOptions([]);
    }
  };

  useEffect(() => {
    if (formData.country) {
      fetchStates(formData.country);
    }
  }, [formData.country]);

  const validateForm = () => {
    const errors: string[] = [];

    // if (!formData.country) errors.push("Country is required");
    // if (!formData.fullAddress.trim()) errors.push("Full address is required");
    // if (!formData.state) errors.push("State is required");
    // if (!formData.city.trim()) errors.push("City is required");
    // if (!formData.pinCode.trim()) errors.push("Pincode is required");
    // if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
    //   errors.push("Pincode must be 6 digits");
    // }

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
      // Reset state when country changes
      ...(name === "country" ? { state: "" } : {}),
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      setIsLoading(true);
      const updatePayload = {
        country: formData.country,
        fullAddress: formData.fullAddress,
        state: formData.state,
        pinCode: formData.pinCode,
        city: formData.city,
        leadStatus,
        comment: "System Comment: Additional details updated!",
      };

      await onUpdate(updatePayload);
    } catch (error: any) {
      console.error(error.message || "Failed to update address details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white dark:bg-gray-dark dark:text-white">
      <div className="flex w-full items-center border-b-2 border-solid border-gray py-2">
        <span className="w-[220px] text-lg font-medium">Address Details</span>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row w-full justify-between gap-4 sm:gap-8">
        <div className="flex w-full flex-col gap-4 pt-3 border-r-0 pr-0 sm:border-r-2 sm:pr-8 text-dark dark:text-white">
          {/* Left Fields */}
          <SelectGroupOne
            label="Country"
            options={countryOptions}
            selectedOption={formData.country}
            setSelectedOption={(value) => handleSelectChange("country", value)}
            
          />

          <div>
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Full Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="fullAddress"
              value={formData.fullAddress}
              onChange={(e) => handleInputChange(e as any)}
              placeholder="Enter complete address"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              rows={3}
              
            />
          </div>

          <SelectGroupOne
            label="State"
            options={stateOptions}
            selectedOption={formData.state}
            setSelectedOption={(value) => handleSelectChange("state", value)}
            
            // isLoading={stateOptions.length === 0}
          />
        </div>

        {/* Right Fields */}
        <div className="flex w-full flex-col pt-3 gap-4">
          <InputGroup
            label="City"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Enter city name"
            
          />

          <InputGroup
            label="Pincode"
            name="pinCode"
            type="text"
            value={formData.pinCode}
            onChange={handleInputChange}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            pattern="\d*"
            
          />
        </div>
      </div>

      <div className="flex w-full justify-center">
        <ButtonDefault
          onClick={handleSubmit}
          label={isLoading ? "Updating..." : "Update Address"}
          variant="primary"
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default AdditionalInformation;
