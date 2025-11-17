const leadStatus = [
  {
    value: "Call Back",
    label: "Call Back",
  },
  {
    value: "Call Back-Re-visit",
    label: "Call Back-Re-visit",
  },
  {
    value: "Call Back-Schedule-visit",
    label: "Call Back-Schedule-visit",
  },
  {
    value: "Call Back-Visit",
    label: "Call Back-Visit",
  },
  {
    value: "Fake lead",
    label: "Fake lead",
  },
  {
    value: "Lost",
    label: "Lost",
  },
  {
    value: "Meeting",
    label: "Meeting",
  },
  {
    value: "Not Attempt",
    label: "Not Attempt",
  },
  {
    value: "Pending",
    label: "Pending",
  },
  {
    value: "SMS & Whatsapp Shoots",
    label: "SMS & Whatsapp Shoots",
  },
  {
    value: "Won",
    label: "Won",
  },
];

const lostReasonOptions = [
  { value: "notInterested", label: "Not Interested" },
  { value: "noRequirement", label: "No Requirement" },
  { value: "budgetIssue", label: "Budget Issue" },
  { value: "already_using", label: "Already Using" },
  { value: "noBusiness", label: "No Business" },
  { value: "noTeam", label: "No Team" },
];
const AGEND_NAMES = [
  {
    label: "Shashank",
    value: 8948492799,
  },
  {
    label: "Kiran",
    value: 9321220039,
  },
  {
    label: "Abhilekh",
    value: 33098938928,
  },
];

const serviceOptions = [
  { value: "Bhutani", label: "Bhutani" },
  { value: "Delhi NCR", label: "Delhi NCR" },
  { value: "Mumbai", label: "Mumbai" },
  { value: "Chennai", label: "Chennai" },
  { value: "Kolkata", label: "Kolkata" },
  { value: "Fairfox", label: "Fairfox" },
];

const leadSourceOptions = [
  { value: "Just Dial", label: "Just Dial" },
  { value: "Website", label: "Website" },
  { value: "Referral", label: "Referral" },
  { value: "Other", label: "Other" },
];

const leadStatusNewFormat = [
  {
    _id: "Call Back",
    name: "Call Back",
  },
  {
    _id: "Call Back-Re-visit",
    name: "Call Back-Re-visit",
  },
  {
    _id: "Call Back-Schedule-visit",
    name: "Call Back-Schedule-visit",
  },
  {
    _id: "Call Back-Visit",
    name: "Call Back-Visit",
  },
  {
    _id: "Fake lead",
    name: "Fake lead",
  },
  {
    _id: "Lost",
    name: "Lost",
  },
  {
    _id: "Meeting",
    name: "Meeting",
  },
  {
    _id: "Not Attempt",
    name: "Not Attempt",
  },
  {
    _id: "Pending",
    name: "Pending",
  },
  {
    _id: "SMS & Whatsapp Shoots",
    name: "SMS & Whatsapp Shoots",
  },
  {
    _id: "Won",
    name: "Won",
  },
];

const lostReasonOptionsNewFormat = [
  { _id: "notInterested", name: "Not Interested" },
  { _id: "noRequirement", name: "No Requirement" },
  { _id: "budgetIssue", name: "Budget Issue" },
  { _id: "already_using", name: "Already Using" },
  { _id: "noBusiness", name: "No Business" },
  { _id: "noTeam", name: "No Team" },
];
const AGEND_NAMESNewFormat = [
  {
    name: "Shashank",
    _id: 8948492799,
  },
  {
    name: "Kiran",
    _id: 9321220039,
  },
  {
    name: "Abhilekh",
    _id: 33098938928,
  },
];

const serviceOptionsNewFormat = [
  { _id: "Bhutani", name: "Bhutani" },
  { _id: "Delhi NCR", name: "Delhi NCR" },
  { _id: "Mumbai", name: "Mumbai" },
  { _id: "Chennai", name: "Chennai" },
  { _id: "Kolkata", name: "Kolkata" },
  { _id: "Fairfox", name: "Fairfox" },
];

const leadSourceOptionsNewFormat = [
  { _id: "Just Dial", name: "Just Dial" },
  { _id: "Website", name: "Website" },
  { _id: "Referral", name: "Referral" },
  { _id: "Other", name: "Other" },
];

const countryOptions = [
  {
    name: "Afghanistan",
    isoCode: "AF",
  },
  {
    name: "Aland Islands",
    isoCode: "AX",
  },
  {
    name: "Albania",
    isoCode: "AL",
  },
  {
    name: "Algeria",
    isoCode: "DZ",
  },
  {
    name: "American Samoa",
    isoCode: "AS",
  },
  {
    name: "Andorra",
    isoCode: "AD",
  },
  {
    name: "Angola",
    isoCode: "AO",
  },
];

interface IndustryOption {
  value: string;
  label: string;
  category?: string;
}

const INDUSTRY_TYPES: IndustryOption[] = [
  // Technology & IT
  {
    value: "software_development",
    label: "Software Development",
    category: "Technology",
  },
  {
    value: "it_services",
    label: "IT Services & Consulting",
    category: "Technology",
  },
  { value: "cybersecurity", label: "Cybersecurity", category: "Technology" },
  {
    value: "cloud_computing",
    label: "Cloud Computing",
    category: "Technology",
  },
  {
    value: "ai_ml",
    label: "Artificial Intelligence & Machine Learning",
    category: "Technology",
  },

  // Manufacturing & Industry
  { value: "manufacturing", label: "Manufacturing", category: "Manufacturing" },
  { value: "automotive", label: "Automotive", category: "Manufacturing" },
  {
    value: "aerospace",
    label: "Aerospace & Defense",
    category: "Manufacturing",
  },
  { value: "construction", label: "Construction", category: "Manufacturing" },
  {
    value: "electronics",
    label: "Electronics Manufacturing",
    category: "Manufacturing",
  },

  // Services
  {
    value: "financial_services",
    label: "Financial Services",
    category: "Services",
  },
  { value: "healthcare", label: "Healthcare & Medical", category: "Services" },
  { value: "education", label: "Education & Training", category: "Services" },
  { value: "consulting", label: "Business Consulting", category: "Services" },
  { value: "legal_services", label: "Legal Services", category: "Services" },

  // Retail & Consumer
  { value: "retail", label: "Retail & Consumer Goods", category: "Retail" },
  { value: "ecommerce", label: "E-commerce", category: "Retail" },
  { value: "food_beverage", label: "Food & Beverage", category: "Retail" },
  { value: "hospitality", label: "Hospitality & Tourism", category: "Retail" },
  { value: "luxury_goods", label: "Luxury Goods", category: "Retail" },

  // Media & Entertainment
  { value: "media", label: "Media & Entertainment", category: "Media" },
  { value: "advertising", label: "Advertising & Marketing", category: "Media" },
  { value: "gaming", label: "Gaming & Interactive Media", category: "Media" },
  { value: "publishing", label: "Publishing", category: "Media" },
  { value: "broadcasting", label: "Broadcasting", category: "Media" },

  // Energy & Resources
  { value: "energy", label: "Energy & Utilities", category: "Energy" },
  { value: "oil_gas", label: "Oil & Gas", category: "Energy" },
  { value: "mining", label: "Mining & Metals", category: "Energy" },
  { value: "renewable_energy", label: "Renewable Energy", category: "Energy" },
  { value: "agriculture", label: "Agriculture & Farming", category: "Energy" },

  // Transportation & Logistics
  {
    value: "logistics",
    label: "Logistics & Supply Chain",
    category: "Transportation",
  },
  {
    value: "transportation",
    label: "Transportation",
    category: "Transportation",
  },
  { value: "warehousing", label: "Warehousing", category: "Transportation" },
  { value: "shipping", label: "Shipping & Marine", category: "Transportation" },
  { value: "aviation", label: "Aviation", category: "Transportation" },

  // Professional Services
  { value: "real_estate", label: "Real Estate", category: "Professional" },
  { value: "insurance", label: "Insurance", category: "Professional" },
  { value: "banking", label: "Banking", category: "Professional" },
  {
    value: "accounting",
    label: "Accounting & Bookkeeping",
    category: "Professional",
  },
  { value: "hr_services", label: "HR Services", category: "Professional" },

  // Healthcare & Life Sciences
  {
    value: "pharmaceuticals",
    label: "Pharmaceuticals",
    category: "Healthcare",
  },
  { value: "biotech", label: "Biotechnology", category: "Healthcare" },
  {
    value: "medical_devices",
    label: "Medical Devices",
    category: "Healthcare",
  },
  { value: "healthcare_it", label: "Healthcare IT", category: "Healthcare" },
  { value: "telemedicine", label: "Telemedicine", category: "Healthcare" },

  // Non-Profit & Government
  { value: "non_profit", label: "Non-Profit Organization", category: "Other" },
  {
    value: "government",
    label: "Government & Public Sector",
    category: "Other",
  },
  {
    value: "education_institution",
    label: "Educational Institution",
    category: "Other",
  },
  { value: "research", label: "Research & Development", category: "Other" },
  { value: "other", label: "Other", category: "Other" },
];

export const ROLES = [
  "Employee",
  "Team Leader",
  "AGM",
  "GM",
  "AVP",
  "VP",
  "AS",
  "Vertical",
  "Super Admin",
];

// Helper function to get industries by category
export const getIndustriesByCategory = (category: string): IndustryOption[] => {
  return INDUSTRY_TYPES.filter((industry) => industry.category === category);
};

// Helper function to get all unique categories
export const getIndustryCategories = (): string[] => {
  return Array.from(
    new Set(INDUSTRY_TYPES.map((industry) => industry.category || ""))
  );
};

// Helper function to find industry label by value
export const getIndustryLabel = (value: string): string => {
  const industry = INDUSTRY_TYPES.find((industry) => industry.value === value);
  return industry ? industry.label : "";
};

export {
  leadStatus,
  lostReasonOptions,
  AGEND_NAMES,
  INDUSTRY_TYPES,
  serviceOptions,
  leadSourceOptions,
  countryOptions,
  leadStatusNewFormat,
  lostReasonOptionsNewFormat,
  AGEND_NAMESNewFormat,
  serviceOptionsNewFormat,
  leadSourceOptionsNewFormat,
};
