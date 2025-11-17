import React, { useState } from "react";
import { toast } from "react-toastify";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import InputGroup from "../../components/FormElements/InputGroup";
import { API } from "../../api";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import { useNavigate } from "react-router-dom";
import TextAreaCustom from "../../components/FormElements/TextArea/TextAreaCustom";

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const initialFormState: StudentFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export default function AddStudent() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>(initialFormState);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!formData.email.trim() || !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Replace with actual API endpoint
      // const { data, error } = await API.postAuthAPI(formData, "students", true);
      // if (error || !data) throw new Error(error);
      
      toast.success("Student added successfully!");
      navigate("/students");
    } catch (error: any) {
      toast.error(error.message || "Failed to add student");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <MiniLoader />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Student</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputGroup
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter student name"
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

            <TextAreaCustom
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter address"
              rows={4}
            />

            <div className="flex gap-4 mt-6">
              <ButtonDefault
                type="submit"
                label="Add Student"
                variant="primary"
                loading={isLoading}
              />
              <ButtonDefault
                type="button"
                label="Cancel"
                variant="outline"
                onClick={() => navigate("/students")}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
