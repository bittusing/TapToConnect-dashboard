import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getStoredCountries } from "../../api/commonAPI";
import InputGroup from "../../components/FormElements/InputGroup";
import SelectGroupOne from "../../components/FormElements/SelectGroup/SelectGroupOne";
import { API } from "../../api";

interface AdditionalDetailsData {
  fullAddress: string;
  country: string;
  state: string;
  city: string;
  website: string;
  companyName: string;
  leadCost: string;
  alternatePhone: string;
  pinCode: string;
}

interface Props {
  onDetailsChange: (details: AdditionalDetailsData) => void;
  initialData?: Partial<AdditionalDetailsData>;
}

interface StateOption {
  value: string;
  label: string;
}

export default function AdditionalLeadDetails({ onDetailsChange, initialData = {} }: Props) {
  const countryOptions = getStoredCountries(true);
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);

  const [formData, setFormData] = useState<AdditionalDetailsData>({
    fullAddress: initialData.fullAddress || "",
    country: initialData.country || "",
    state: initialData.state || "",
    city: initialData.city || "",
    website: initialData.website || "",
    companyName: initialData.companyName || "",
    leadCost: initialData.leadCost || "",
    alternatePhone: initialData.alternatePhone || "",
    pinCode: initialData.pinCode || "",
  });

  const fetchStates = async (countryCode: string) => {
    try {
      setIsLoadingStates(true);
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
    } finally {
      setIsLoadingStates(false);
    }
  };

  useEffect(() => {
    if (formData.country) {
      fetchStates(formData.country);
      // Reset state when country changes
      setFormData((prev) => ({ ...prev, state: "" }));
    }
  }, [formData.country]);

  // Notify parent component whenever form data changes
  useEffect(() => {
    onDetailsChange(formData);
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex w-full flex-col gap-4.5 xl:flex-row">
      <div className="flex w-full flex-col justify-between gap-3.5 xl:w-1/2">
        <div className="w-full">
          <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
            Full address
          </label>
          <textarea
            name="fullAddress"
            rows={5}
            value={formData.fullAddress}
            onChange={handleInputChange}
            placeholder="Enter lead's full address"
            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          />
        </div>

        <SelectGroupOne
          label="Country"
          options={countryOptions}
          selectedOption={formData.country}
          setSelectedOption={(value) => handleSelectChange("country", value)}
        />

        <SelectGroupOne
          label="State"
          options={stateOptions}
          selectedOption={formData.state}
          setSelectedOption={(value) => handleSelectChange("state", value)}
          // isLoading={isLoadingStates}
        />

        <InputGroup
          name="city"
          label="City"
          type="text"
          placeholder="Enter lead's City"
          value={formData.city}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex w-full flex-col justify-between gap-3.5 xl:w-1/2">
        <InputGroup
          label="Website"
          type="text"
          name="website"
          placeholder="Enter lead's website URL"
          value={formData.website}
          onChange={handleInputChange}
        />

        <InputGroup
          label="Company name"
          type="text"
          name="companyName"
          placeholder="Enter lead's company name"
          value={formData.companyName}
          onChange={handleInputChange}
        />

        <InputGroup
          label="Lead cost"
          type="number"
          name="leadCost"
          placeholder="Enter lead acquisition cost"
          value={formData.leadCost}
          onChange={handleInputChange}
        />

        <InputGroup
          label="Alternate phone"
          type="tel"
          name="alternatePhone"
          placeholder="Enter lead's alternate phone"
          value={formData.alternatePhone}
          onChange={handleInputChange}
          maxLength={10}
        />

        <InputGroup
          label="Pin Code"
          name="pinCode"
          type="text"
          placeholder="Enter lead's pin code"
          value={formData.pinCode}
          onChange={handleInputChange}
          maxLength={6}
          pattern="\d*"
        />
      </div>
    </div>
  );
}