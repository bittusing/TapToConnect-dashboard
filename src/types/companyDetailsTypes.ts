
export interface CompanySettings {
    dateFormat: string;
    timezone: string;
    currency: string;
    language: string;
    fiscalYearStart: string;
  }
  
  export interface PrimaryContact {
    name: string;
    email: string;
    phone: string;
  }
  
  export interface Subscription {
    plan: string;
    startDate: string;
    endDate: string;
    status: string;
    features?: string[];
  }
  
  export interface CompanyData {
    name: string;
    industry: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    status: string;
    settings: CompanySettings;
    logo: string;
    size: string;
    taxId: string;
    billingAddress: string;
    primaryContact: PrimaryContact;
    subscription?: Subscription;
  }
  
  export interface UserData {
    _id: string;
    name: string;
    email: string;
    phone: string;
    companyCode: string;
    role: string;
    company: CompanyData;
  }