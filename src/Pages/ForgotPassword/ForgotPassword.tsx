import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputGroup from "../../components/FormElements/InputGroup";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import { toast } from "react-toastify";
import { API } from "../../api";

type Step = "email" | "otp" | "reset";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: any;
    if (timeLeft > 0 && currentStep === "otp") {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, currentStep]);

  const handleRequestOTP = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await API.postAuthAPI(
        { email: formData.email },
        "forget-password/request-otp"
      );

      if (error) return;

     // setFormData((prev) => ({ ...prev, otp: data.otp }));
      setCurrentStep("otp");
      setTimeLeft(30);
      setCanResend(false);
    } catch (error: any) {
      console.error(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setIsLoading(true);
      const { error } = await API.postAuthAPI(
        { email: formData.email, otp: formData.otp },
        "forget-password/verify-otp"
      );

      if (error) return;

      setCurrentStep("reset");
    } catch (error: any) {
      console.error(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await API.postAuthAPI(
        {
          email: formData.email,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
        "forget-password/reset-password"
      );

      if (error) return;

      toast.success("Password reset successful!");
      navigate("/login");
    } catch (error: any) {
      console.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "email":
        return (
          <>
            <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
              Forgot your password?
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a verification code.
            </p>
            <InputGroup
              label=""
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              required
            />
            <ButtonDefault
              label={isLoading ? "Sending..." : "Send OTP"}
              onClick={handleRequestOTP}
              disabled={isLoading || !formData.email}
              customClasses="w-full"
            />
          </>
        );

      case "otp":
        return (
          <>
            <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
              Enter Verification Code
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter the verification code we just sent to your email address.
            </p>
            <InputGroup
              label=""
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleInputChange}
              placeholder="Enter verification code"
              required
            />
            <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {timeLeft > 0 ? (
                `Resend OTP in ${Math.floor(timeLeft / 60)}:${String(
                  timeLeft % 60
                ).padStart(2, "0")}`
              ) : (
                <button
                  onClick={handleRequestOTP}
                  disabled={!canResend}
                  className="text-primary hover:text-primary/80"
                >
                  Resend OTP
                </button>
              )}
            </div>
            <ButtonDefault
              label={isLoading ? "Verifying..." : "Verify"}
              onClick={handleVerifyOTP}
              disabled={isLoading || !formData.otp}
              customClasses="w-full"
            />
          </>
        );

      case "reset":
        return (
          <>
            <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Enter your new password below.
            </p>
            <div className="space-y-4">
              <InputGroup
                label="New Password"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                required
              />
              <InputGroup
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                required
              />
            </div>
            <ButtonDefault
              label={isLoading ? "Resetting..." : "Reset Password"}
              onClick={handleResetPassword}
              disabled={
                isLoading || !formData.newPassword || !formData.confirmPassword
              }
              customClasses="w-full"
            />
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Illustration */}
        <div className="flex justify-center">
          <div className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/5">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              className="text-primary"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="currentColor"
                fillOpacity="0.1"
              />
              <path
                d="M45 40C45 37.2386 47.2386 35 50 35H70C72.7614 35 75 37.2386 75 40V80C75 82.7614 72.7614 85 70 85H50C47.2386 85 45 82.7614 45 80V40Z"
                fill="currentColor"
                fillOpacity="0.2"
              />
              <path
                d="M55 50H65M55 60H65M55 70H65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="60" cy="30" r="10" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
          <div className="space-y-6">{renderStepContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
