import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import InputGroup from "../../components/FormElements/InputGroup";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import SelectGroupAntd from "../../components/FormElements/SelectGroup/SelectGroupAntd";
import SwitcherTwo from "../../components/FormElements/Switchers/SwitcherTwo";

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  isActive: boolean;
}

const initialFormState: UserFormData = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  isActive: true,
};

const USER_ROLES = [
  { label: "Super Admin", value: "Super Admin" },
  { label: "Support Admin", value: "Support Admin" },
  { label: "Admin", value: "Admin" },
  { label: "Tutor", value: "Tutor" },
  { label: "Employee", value: "Employee" },
  { label: "HR", value: "HR" },
  { label: "Finance", value: "Finance" },
  { label: "Project Manager", value: "Project Manager" },
  { label: "Sales", value: "Sales" },
  { label: "User", value: "User" },
];

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState<UserFormData>(initialFormState);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchUserData(id);
    }
  }, [id]);

  const fetchUserData = async (userId: string) => {
    setIsLoadingData(true);
    try {
      const { data, error } = await API.getAuthAPI(`${END_POINT.USERS}/${userId}`, true);
      if (error || !data) throw new Error(error);
      
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        password: "", // Don't fetch password
        role: data.role || "",
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch user data");
      navigate("/users");
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
    if (!formData.email.includes("@")) {
      toast.error("Invalid email format");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!formData.role) {
      toast.error("Please select a role");
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
        phone: formData.phone,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Only include password if it's being changed
      if (formData.password.trim()) {
        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setIsLoading(false);
          return;
        }
        payload.password = formData.password;
      }

      const { data, error } = await API.updateAuthAPI(payload, id!, END_POINT.USERS, true);
      if (error || !data) throw new Error(error);
      
      toast.success("User updated successfully!");
      navigate("/users");
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) return <MiniLoader />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit User</h1>
            <ButtonDefault
              type="button"
              label="Back to Users"
              variant="outline"
              onClick={() => navigate("/users")}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputGroup
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
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

            <SelectGroupAntd
              label="Role"
              selectedOption={formData.role}
              setSelectedOption={(value) => setFormData((prev) => ({ ...prev, role: value }))}
              options={USER_ROLES}
              required
            />

            <div className="flex items-center justify-between pt-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Status
                </label>
                <SwitcherTwo
                  id="isActive"
                  defaultChecked={formData.isActive}
                  onChange={(checked: boolean) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <ButtonDefault
                type="submit"
                label="Update User"
                variant="primary"
                loading={isLoading}
              />
              <ButtonDefault
                type="button"
                label="Cancel"
                variant="outline"
                onClick={() => navigate("/users")}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

