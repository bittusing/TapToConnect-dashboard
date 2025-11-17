import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import InputGroup from "../../components/FormElements/InputGroup";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import SwitcherTwo from "../../components/FormElements/Switchers/SwitcherTwo";

interface InstructorFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  isActive: boolean;
}

const initialFormState: InstructorFormData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "Tutor",
  isActive: true,
};

export default function EditInstructor() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState<InstructorFormData>(initialFormState);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchInstructorData(id);
    }
  }, [id]);

  const fetchInstructorData = async (instructorId: string) => {
    setIsLoadingData(true);
    try {
      const { data, error } = await API.getAuthAPI(`${END_POINT.USERS}/${instructorId}`, true,{ role: "Tutor" });
      if (error || !data) throw new Error(error || "Failed to fetch instructor data");
      
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        password: "", // Don't fetch password - leave empty for optional update
        role: data.role || "Tutor",
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
    } catch (error: any) {
      console.error("Error fetching instructor data:", error);
      toast.error(error.message || "Failed to fetch instructor data");
      navigate("/instructors");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    // Password is optional for edit - only validate if provided
    if (formData.password && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData?.password || "",
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Only include password if it's provided
      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      console.log("Updating instructor payload:", payload);
      const { data, error } = await API.updateAuthAPI(payload, id!, END_POINT.USERS, true);
      
      if (error) {
        console.error("API Error:", error);
        throw new Error(error || "Failed to update instructor");
      }
      
      if (!data) {
        console.error("No data received from API");
        throw new Error("No data received from server");
      }
      
      console.log("Instructor updated successfully:", data);
      toast.success("Instructor updated successfully!");
      navigate("/instructors");
    } catch (error: any) {
      console.error("Error updating instructor:", error);
      toast.error(error?.message || error?.error || "Failed to update instructor. Please check all required fields.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) return <MiniLoader />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Instructor</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputGroup
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter instructor name"
              required
            />

            <InputGroup
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              required
            />

            <InputGroup
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              required
            />

            <InputGroup
              label="Password (Leave empty to keep current password)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter new password (optional, min 6 characters)"
            />

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Active Status
              </label>
              <SwitcherTwo
                id="active-status-switch"
                defaultChecked={formData?.isActive}
                onChange={(checked: boolean) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <ButtonDefault
                type="submit"
                label="Update Instructor"
                variant="primary"
                loading={isLoading}
              />
              <ButtonDefault
                type="button"
                label="Cancel"
                variant="outline"
                onClick={() => navigate("/instructors")}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

