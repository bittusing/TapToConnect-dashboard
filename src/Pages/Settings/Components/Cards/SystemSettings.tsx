import { useState, useEffect } from "react";
import { FaGlobeAmericas } from "react-icons/fa";
import { toast } from "react-toastify";
import Card from "../../../../components/CommonUI/Card";
import ButtonDefault from "../../../../components/Buttons/ButtonDefault";
import InputGroup from "../../../../components/FormElements/InputGroup";
import SelectGroupOne from "../../../../components/FormElements/SelectGroup/SelectGroupOne";
import { InfoItem } from "../../../../components/CommonUI/InfoItem";
import { updateSystemSettings } from "./CardApis";

interface SystemSettings {
  dateFormat: string;
  timezone: string;
  currency: string;
  language: string;
  fiscalYearStart: string;
}

const SystemSettingsCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SystemSettings>({
    dateFormat: "DD/MM/YYYY",
    timezone: "Asia/Kolkata",
    currency: "INR",
    language: "en",
    fiscalYearStart: "01-04",
  });

  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "Asia/Kolkata", label: "Asia/Kolkata" },
    { value: "America/New_York", label: "America/New_York" },
    { value: "Europe/London", label: "Europe/London" },
  ];

  const currencies = [
    { value: "INR", label: "Indian Rupee (INR)" },
    { value: "USD", label: "US Dollar (USD)" },
    { value: "EUR", label: "Euro (EUR)" },
    { value: "GBP", label: "British Pound (GBP)" },
  ];

  const dateFormats = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  ];

  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        const settings = userData.company?.settings || {};
        setFormData((prev) => ({
          ...prev,
          ...settings,
        }));
      } catch (error) {
        console.error("Error loading system settings:", error);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // API Update
      const response = await updateSystemSettings(formData);

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
            settings: formData,
          },
        };
        localStorage.setItem("user", JSON.stringify(updatedUserData));
      }

      toast.success("System settings updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error(error.message || "Failed to update system settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FaGlobeAmericas className="text-xl text-primary" />
          <h2 className="text-xl font-semibold dark:text-white">
            System Settings
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
          <SelectGroupOne
            label="Date Format"
            options={dateFormats}
            selectedOption={formData.dateFormat}
            setSelectedOption={(value) =>
              setFormData((prev) => ({ ...prev, dateFormat: value }))
            }
          />
          <SelectGroupOne
            label="Timezone"
            options={timezones}
            selectedOption={formData.timezone}
            setSelectedOption={(value) =>
              setFormData((prev) => ({ ...prev, timezone: value }))
            }
          />
          <SelectGroupOne
            label="Currency"
            options={currencies}
            selectedOption={formData.currency}
            setSelectedOption={(value) =>
              setFormData((prev) => ({ ...prev, currency: value }))
            }
          />
          <InputGroup
            label="Fiscal Year Start"
            name="fiscalYearStart"
            type="text"
            value={formData.fiscalYearStart}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                fiscalYearStart: e.target.value,
              }))
            }
          />
        </div>
      ) : (
        <>
          <InfoItem label="Date Format" value={formData.dateFormat} />
          <InfoItem label="Timezone" value={formData.timezone} />
          <InfoItem label="Currency" value={formData.currency} />
          <InfoItem label="Language" value={formData.language.toUpperCase()} />
          <InfoItem
            label="Fiscal Year Start"
            value={formData.fiscalYearStart}
          />
        </>
      )}
    </Card>
  );
};

export default SystemSettingsCard;
