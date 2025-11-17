import { useFormik } from "formik";
import * as Yup from "yup";
import InputGroup from "../FormElements/InputGroup";
import SelectGroupOne from "../FormElements/SelectGroup/SelectGroupOne";
import {
  getIndustriesByCategory,
  getIndustryCategories,
} from "../../utils/Constants/UsefullJSON";

// Common timezones array
const timezones = [
  { value: "UTC", label: "(UTC+00:00) UTC" },
  {
    value: "America/New_York",
    label: "(UTC-05:00) Eastern Time (US & Canada)",
  },
  { value: "America/Chicago", label: "(UTC-06:00) Central Time (US & Canada)" },
  { value: "America/Denver", label: "(UTC-07:00) Mountain Time (US & Canada)" },
  {
    value: "America/Los_Angeles",
    label: "(UTC-08:00) Pacific Time (US & Canada)",
  },
  { value: "Asia/Dubai", label: "(UTC+04:00) Dubai" },
  { value: "Asia/Kolkata", label: "(UTC+05:30) India Standard Time" },
  { value: "Asia/Singapore", label: "(UTC+08:00) Singapore" },
  { value: "Europe/London", label: "(UTC+00:00) London" },
  { value: "Europe/Paris", label: "(UTC+01:00) Paris" },
];

// Common currencies array
const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "CHF", label: "Swiss Franc (CHF)" },
  { value: "CNY", label: "Chinese Yuan (CNY)" },
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "SGD", label: "Singapore Dollar (SGD)" },
];

// Country codes for phone numbers
const countryCodes = [
  { value: "+1", label: "United States (+1)" },
  { value: "+44", label: "United Kingdom (+44)" },
  { value: "+91", label: "India (+91)" },
  { value: "+86", label: "China (+86)" },
  { value: "+81", label: "Japan (+81)" },
  { value: "+971", label: "UAE (+971)" },
  { value: "+65", label: "Singapore (+65)" },
  { value: "+33", label: "France (+33)" },
  { value: "+49", label: "Germany (+49)" },
  { value: "+61", label: "Australia (+61)" },
];

const validationSchema = Yup.object().shape({
  adminName: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .required("Admin name is required"),
  timezone: Yup.string().required("Timezone is required"),
  currency: Yup.string().required("Currency is required"),
  countryCode: Yup.string().required("Country code is required"),
  mobileNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Mobile number is required"),
});

interface FormValues {
  adminName: string;
  timezone: string;
  currency: string;
  countryCode: string;
  mobileNumber: string;
  industry: string;
}

export default function OnBoardingForm({
  initialValue = {
    adminName: "",
    timezone: "",
    currency: "",
    countryCode: "",
    mobileNumber: "",
    industry: "",
  },
  setOnBoardingData,
  setIsFinalStep,
  isLoading,
}: {
  initialValue?: FormValues;
  setOnBoardingData: (values: FormValues) => void;
  setIsFinalStep: (value: boolean) => void;
  isLoading: boolean;
}) {
  const formik = useFormik<FormValues>({
    initialValues: initialValue,
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      setOnBoardingData(values);
      setIsFinalStep(true);
      setSubmitting(false);
    },
  });

  const categories = getIndustryCategories();
  const groupedOptions = categories.map((category) => ({
    label: category,
    value: category,
    options: getIndustriesByCategory(category).map((industry) => ({
      value: industry.value,
      label: industry.label,
    })),
  }));

  return (
    <form onSubmit={formik.handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Admin Name */}
        <InputGroup
          label="Admin name"
          name="adminName"
          type="text"
          placeholder="Enter admin/owner name"
          required
          value={formik.values.adminName}
          onChange={formik.handleChange}
        />
        {formik.touched.adminName && formik.errors.adminName && (
          <div className="mt-1 text-sm text-red-500">
            {formik.errors.adminName}
          </div>
        )}

        {/* Industry Types */}
        <SelectGroupOne
          label="Industry Type"
          options={groupedOptions}
          required
          selectedOption={formik.values.industry}
          setSelectedOption={(value) => formik.setFieldValue("industry", value)}
          isGrouped
        />
        {formik.touched.timezone && formik.errors.timezone && (
          <div className="mt-1 text-sm text-red-500">
            {formik.errors.timezone}
          </div>
        )}

        {/* Timezone */}
        <SelectGroupOne
          label="Timezone"
          options={timezones}
          required
          selectedOption={formik.values.timezone}
          setSelectedOption={(value) => formik.setFieldValue("timezone", value)}
        />
        {formik.touched.timezone && formik.errors.timezone && (
          <div className="mt-1 text-sm text-red-500">
            {formik.errors.timezone}
          </div>
        )}

        {/* Currency */}
        <SelectGroupOne
          label="Currency"
          options={currencies}
          required
          selectedOption={formik.values.currency}
          setSelectedOption={(value) => formik.setFieldValue("currency", value)}
        />
        {formik.touched.currency && formik.errors.currency && (
          <div className="mt-1 text-sm text-red-500">
            {formik.errors.currency}
          </div>
        )}

        {/* Mobile Number */}
        <div className="flex gap-4">
          <div className="w-1/3">
            <SelectGroupOne
              label="Country Code"
              options={countryCodes}
              required
              selectedOption={formik.values.countryCode}
              setSelectedOption={(value) =>
                formik.setFieldValue("countryCode", value)
              }
            />
          </div>
          <div className="w-2/3">
            <InputGroup
              label="Mobile number"
              name="mobileNumber"
              type="tel"
              placeholder="Enter mobile number"
              required
              value={formik.values.mobileNumber}
              onChange={formik.handleChange}
            />
          </div>
        </div>
        {(formik.touched.countryCode && formik.errors.countryCode) ||
          (formik.touched.mobileNumber && formik.errors.mobileNumber && (
            <div className="mt-1 text-sm text-red-500">
              {formik.errors.countryCode || formik.errors.mobileNumber}
            </div>
          ))}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70"
          >
            {formik.isSubmitting ? "Submitting..." : "Create Account"}
          </button>
        </div>
      </div>
    </form>
  );
}
