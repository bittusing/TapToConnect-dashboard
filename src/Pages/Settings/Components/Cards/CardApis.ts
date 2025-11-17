import { API } from "../../../../api";
import { CompanyData, CompanySettings, PrimaryContact } from "../../../../types/companyDetailsTypes";

export const updateCompanyInfo = async (companyData: Partial<CompanyData>) => {
  const response = await API.updateAuthAPI(
    companyData,
    null,
    "updateCompanyDetails",
    true
  );
  return response;
};

export const updateContactInfo = async (contactData: {
  primaryContact: PrimaryContact;
  website?: string;
  billingAddress?: string;
}) => {
  const response = await API.updateAuthAPI(
    contactData,
    null,
    "updateCompanyDetails",
    true
  );
  return response;
};

export const updateSystemSettings = async (settings: CompanySettings) => {
  const response = await API.updateAuthAPI(
    { settings },
    null,
    "updateCompanyDetails",
    true
  );
  return response;
};