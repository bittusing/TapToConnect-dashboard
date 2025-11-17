import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import Card from "../../../../components/CommonUI/Card";
import ButtonDefault from "../../../../components/Buttons/ButtonDefault";
import InputGroup from "../../../../components/FormElements/InputGroup";
import { InfoItem } from "../../../../components/CommonUI/InfoItem";
import { updateContactInfo } from "./CardApis";

interface ContactInfo {
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  website: string;
  billingAddress: string;
}

const ContactInfoCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ContactInfo>({
    primaryContact: {
      name: "-",
      email: "-",
      phone: "-",
    },
    website: "-",
    billingAddress: "-",
  });

  useEffect(() => {
    loadContactData();
  }, []);

  const loadContactData = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setFormData({
          primaryContact: {
            name: userData.name || "-",
            email: userData.email || "-",
            phone: userData.phone || "-",
          },
          website: userData.company?.website || "-",
          billingAddress: userData.company?.billingAddress || "-",
        });
      } catch (error) {
        console.error("Error loading contact data:", error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ContactInfo] as Record<string, string>),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // API Update
      const response = await updateContactInfo({
        primaryContact: formData.primaryContact,
        website: formData.website,
        billingAddress: formData.billingAddress,
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
          name: formData.primaryContact.name,
          email: formData.primaryContact.email,
          phone: formData.primaryContact.phone,
          company: {
            ...userData.company,
            website: formData.website,
            billingAddress: formData.billingAddress,
          },
        };
        localStorage.setItem("user", JSON.stringify(updatedUserData));
      }

      toast.success("Contact information updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error(error.message || "Failed to update contact information");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FaUser className="text-xl text-primary" />
          <h2 className="text-xl font-semibold dark:text-white">
            Contact Information
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
            customClasses="bg-primary hover:bg-primary/90 text-white px-4 !w-fit py-2"
          />
        )}
      </div>

      {isEditing ? (
        <div>
          <InputGroup
            label="Primary Contact Name"
            name="primaryContact.name"
            type="text"
            value={formData.primaryContact.name}
            onChange={handleInputChange}
          />
          <InputGroup
            label="Email"
            name="primaryContact.email"
            type="email"
            value={formData.primaryContact.email}
            onChange={handleInputChange}
          />
          <InputGroup
            label="Phone"
            name="primaryContact.phone"
            type="tel"
            value={formData.primaryContact.phone}
            onChange={handleInputChange}
          />
          <InputGroup
            label="Website"
            name="website"
            type="text"
            value={formData.website}
            onChange={handleInputChange}
          />
          <InputGroup
            label="Billing Address"
            name="billingAddress"
            type="text"
            value={formData.billingAddress}
            onChange={handleInputChange}
          />
        </div>
      ) : (
        <>
          <InfoItem
            label="Primary Contact"
            value={formData.primaryContact.name}
          />
          <InfoItem label="Email" value={formData.primaryContact.email} />
          <InfoItem label="Phone" value={formData.primaryContact.phone} />
          <InfoItem label="Website" value={formData.website} />
          <InfoItem label="Billing Address" value={formData.billingAddress} />
        </>
      )}
    </Card>
  );
};

export default ContactInfoCard;
