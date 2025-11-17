import { useFormik } from "formik";
import { useState } from "react";
import * as Yup from "yup";
import { FaRegEye } from "react-icons/fa6";
import { IoEyeOffOutline } from "react-icons/io5";

const validationSchema = Yup.object().shape({
  companyName: Yup.string()
    .min(2, "Company name must be at least 2 characters")
    .max(50, "Company name must be less than 50 characters")
    .required("Organization name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

interface FormValues {
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpForm({
  initialValue,
  setSignUpData,
  setIsFinalStep,
}: any) {
  const formik = useFormik<FormValues>({
    initialValues: initialValue,
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      // Handle form submission here
      setSignUpData(values);
      setIsFinalStep(true);
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Organization Name */}
      <div className="mb-4">
        <label
          htmlFor="companyName"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Organization name
        </label>
        <div className="relative">
          <input
            type="text"
            id="companyName"
            name="companyName"
            placeholder="Enter organization / company name"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.companyName}
            className={`w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium outline-none transition focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
              formik.touched.companyName && formik.errors.companyName
                ? "border-red-500"
                : ""
            }`}
          />
          <span className="absolute right-4.5 top-1/2 -translate-y-1/2">
            <svg
              className="fill-current"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.9975 1.146C8.59278 1.146 6.64335 3.09542 6.64335 5.50016C6.64335 7.9049 8.59278 9.85433 10.9975 9.85433C13.4023 9.85433 15.3517 7.9049 15.3517 5.50016C15.3517 3.09542 13.4023 1.146 10.9975 1.146ZM8.01835 5.50016C8.01835 3.85481 9.35217 2.521 10.9975 2.521C12.6429 2.521 13.9767 3.85481 13.9767 5.50016C13.9767 7.14551 12.6429 8.47933 10.9975 8.47933C9.35217 8.47933 8.01835 7.14551 8.01835 5.50016Z"
                fill=""
              ></path>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.9975 11.2293C8.87676 11.2293 6.92287 11.7114 5.47501 12.5258C4.04871 13.3281 2.97669 14.5441 2.97669 16.0418L2.97662 16.1353C2.97559 17.2003 2.97429 18.537 4.14673 19.4917C4.72374 19.9616 5.53096 20.2958 6.62154 20.5165C7.71518 20.7379 9.14056 20.8543 10.9975 20.8543C12.8545 20.8543 14.2799 20.7379 15.3735 20.5165C16.4641 20.2958 17.2713 19.9616 17.8483 19.4917C19.0207 18.537 19.0194 17.2003 19.0184 16.1353L19.0184 16.0418C19.0184 14.5441 17.9463 13.3281 16.52 12.5258C15.0722 11.7114 13.1183 11.2293 10.9975 11.2293ZM4.35169 16.0418C4.35169 15.2614 4.92128 14.4149 6.14912 13.7242C7.35542 13.0457 9.06819 12.6043 10.9975 12.6043C12.9269 12.6043 14.6396 13.0457 15.8459 13.7242C17.0738 14.4149 17.6434 15.2614 17.6434 16.0418C17.6434 17.2406 17.6064 17.9155 16.9801 18.4255C16.6404 18.7021 16.0726 18.9721 15.1007 19.1688C14.1318 19.3649 12.8072 19.4793 10.9975 19.4793C9.18781 19.4793 7.8632 19.3649 6.89433 19.1688C5.92242 18.9721 5.35463 18.7021 5.01498 18.4255C4.38864 17.9155 4.35169 17.2406 4.35169 16.0418Z"
                fill=""
              ></path>
            </svg>
          </span>
        </div>
        {formik.touched.companyName && formik.errors.companyName && (
          <div className="mt-1 text-sm text-red-500">
            {formik.errors.companyName}
          </div>
        )}
      </div>

      {/* Email */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Email
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            className={`w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium outline-none transition focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
              formik.touched.email && formik.errors.email
                ? "border-red-500"
                : ""
            }`}
          />
          <span className="absolute right-4.5 top-1/2 -translate-y-1/2">
            <svg
              className="fill-current"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.11756 2.979H12.8877C14.5723 2.97899 15.9066 2.97898 16.9509 3.11938C18.0256 3.26387 18.8955 3.56831 19.5815 4.25431C20.2675 4.94031 20.5719 5.81018 20.7164 6.8849C20.8568 7.92918 20.8568 9.26351 20.8568 10.9481V11.0515C20.8568 12.7362 20.8568 14.0705 20.7164 15.1148C20.5719 16.1895 20.2675 17.0594 19.5815 17.7454C18.8955 18.4314 18.0256 18.7358 16.9509 18.8803C15.9066 19.0207 14.5723 19.0207 12.8876 19.0207H9.11756C7.43295 19.0207 6.09861 19.0207 5.05433 18.8803C3.97961 18.7358 3.10974 18.4314 2.42374 17.7454C1.73774 17.0594 1.4333 16.1895 1.28881 15.1148C1.14841 14.0705 1.14842 12.7362 1.14844 11.0516V10.9481C1.14842 9.26351 1.14841 7.92918 1.28881 6.8849C1.4333 5.81018 1.73774 4.94031 2.42374 4.25431C3.10974 3.56831 3.97961 3.26387 5.05433 3.11938C6.09861 2.97898 7.43294 2.97899 9.11756 2.979ZM5.23755 4.48212C4.3153 4.60611 3.78396 4.83864 3.39602 5.22658C3.00807 5.61452 2.77554 6.14587 2.65155 7.06812C2.5249 8.01014 2.52344 9.25192 2.52344 10.9998C2.52344 12.7478 2.5249 13.9895 2.65155 14.9316C2.77554 15.8538 3.00807 16.3852 3.39602 16.7731C3.78396 17.161 4.3153 17.3936 5.23755 17.5176C6.17957 17.6442 7.42135 17.6457 9.16927 17.6457H12.8359C14.5839 17.6457 15.8256 17.6442 16.7677 17.5176C17.6899 17.3936 18.2213 17.161 18.6092 16.7731C18.9971 16.3852 19.2297 15.8538 19.3537 14.9316C19.4803 13.9895 19.4818 12.7478 19.4818 10.9998C19.4818 9.25192 19.4803 8.01014 19.3537 7.06812C19.2297 6.14587 18.9971 5.61452 18.6092 5.22658C18.2213 4.83864 17.6899 4.60611 16.7677 4.48212C15.8256 4.35546 14.5839 4.354 12.8359 4.354H9.16927C7.42135 4.354 6.17958 4.35546 5.23755 4.48212ZM4.97445 6.89304C5.21753 6.60135 5.65104 6.56194 5.94273 6.80502L7.92172 8.45418C8.77693 9.16685 9.37069 9.66005 9.87197 9.98246C10.3572 10.2945 10.6863 10.3993 11.0026 10.3993C11.3189 10.3993 11.648 10.2945 12.1332 9.98246C12.6345 9.66005 13.2283 9.16685 14.0835 8.45417L16.0625 6.80502C16.3542 6.56194 16.7877 6.60135 17.0308 6.89304C17.2738 7.18473 17.2344 7.61825 16.9427 7.86132L14.9293 9.5392C14.1168 10.2163 13.4582 10.7651 12.877 11.1389C12.2716 11.5283 11.6819 11.7743 11.0026 11.7743C10.3233 11.7743 9.73364 11.5283 9.12818 11.1389C8.54696 10.7651 7.88843 10.2163 7.07594 9.5392L5.06248 7.86132C4.77079 7.61825 4.73138 7.18473 4.97445 6.89304Z"
                fill=""
              />
            </svg>
          </span>
        </div>
        {formik.touched.email && formik.errors.email && (
          <div className="mt-1 text-sm text-red-500">{formik.errors.email}</div>
        )}
      </div>

      {/* Password */}
      <div className="mb-4">
        <label
          htmlFor="password"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Enter your password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            className={`w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium outline-none transition focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
              formik.touched.password && formik.errors.password
                ? "border-red-500"
                : ""
            }`}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-4.5 top-1/2 -translate-y-1/2 focus:outline-none"
          >
            {!showPassword ? (
              <IoEyeOffOutline className="h-5 w-5 text-[#6b7280]" />
            ) : (
              <FaRegEye className="h-5 w-5 text-[#6b7280]" />
            )}
          </button>
        </div>
        {formik.touched.password && formik.errors.password && (
          <div className="mt-1 text-sm text-red-500">
            {formik.errors.password}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="mb-4">
        <label
          htmlFor="confirmPassword"
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm your password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.confirmPassword}
            className={`w-full rounded-lg border border-stroke bg-transparent py-[15px] pl-6 pr-11 font-medium outline-none transition focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
              formik.touched.confirmPassword && formik.errors.confirmPassword
                ? "border-red-500"
                : ""
            }`}
          />
          <button
            type="button"
            onClick={toggleConfirmPasswordVisibility}
            className="absolute right-4.5 top-1/2 -translate-y-1/2 focus:outline-none"
          >
            {!showConfirmPassword ? (
              <IoEyeOffOutline className="h-5 w-5 text-[#6b7280]" />
            ) : (
              <FaRegEye className="h-5 w-5 text-[#6b7280]" />
            )}
          </button>
        </div>
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <div className="mt-1 text-sm text-red-500">
            {formik.errors.confirmPassword}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="mb-4.5 mt-6">
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70"
        >
          {formik.isSubmitting ? "Submitting..." : "Next"}
        </button>
      </div>
    </form>
  );
}
