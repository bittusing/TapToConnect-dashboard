import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import GoogleSigninButton from "../GoogleSigninButton";
import SignUPForm from "../SignUpForm";
import WelcomePage from "../WelcomePage";
import { Steps } from "antd";
import OnBoardingForm from "../OnBoardingForm";
import { API } from "../../../api";
import { END_POINT } from "../../../api/UrlProvider";
import { LocalStorage } from "../../../utils/localStorage";

const items = [
  {
    title: "Sign up",
  },
  {
    title: "Almost there",
  },
];

export default function SignUp() {
  const navigate = useNavigate();
  const [signUpData, setSignUpData] = useState({
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [onBoardingData, setOnBoardingData] = useState({
    adminName: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
    countryCode: "+91",
    mobileNumber: "",
    industry: "",
  });

  const [isFinalStep, setIsFinalStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnBoardingData = async (formData: any) => {
    setIsLoading(true);
    try {
      // Format the data according to the API payload structure
      const payload = {
        companyData: {
          name: signUpData.companyName,
          industry: "Software industry", // You might want to add this to your form
          phone: formData.countryCode + formData.mobileNumber,
          email: signUpData.email,
          settings: {
            timezone: formData.timezone,
            currency: formData.currency,
            language: "en", // Default language
          },
        },
        userData: {
          name: formData.adminName,
          email: signUpData.email,
          password: signUpData.password,
          phone: formData.countryCode + formData.mobileNumber,
        },
      };

      const { data, error } = await API.postAuthAPI(payload, END_POINT.SIGNUP);

      if (error || !data) throw Error(error);

      // Handle successful signup
      toast.success("Account created successfully!");
      LocalStorage.setStringData("refreshToken", data.refreshToken);
      LocalStorage.setStringData("accessToken", data.token);
      LocalStorage.setStringData("user", JSON.stringify(data.user));
      navigate("/");
    } catch (error: any) {
      toast.error(error || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="linePattern_Container dark overflow-auto p-5 md:p-0">
      <div
        className={`m-auto flex h-screen w-full overflow-hidden md:items-center md:justify-center ${
          isFinalStep ? "max-w-md" : "md:max-w-xl xl:max-w-4xl"
        }`}
      >
        <div className="flex w-full flex-col justify-center gap-5 bg-transparent">
          {isFinalStep && (
            <div className="w-full rounded-md bg-transparent px-5 py-3 shadow-card xl:bg-gray-dark">
              <Steps current={1} items={items} />
            </div>
          )}

          <div className="flex items-center bg-transparent shadow-1 shadow-card xl:bg-gray-dark">
            {!isFinalStep ? (
              <div className="w-full p-5 xl:w-1/2 xl:p-9.5 xl:pr-0">
                <GoogleSigninButton text="Sign up" />

                <div className="my-6 flex items-center justify-center">
                  <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
                  <div className="block w-full min-w-fit bg-white px-3 text-center font-medium dark:bg-gray-dark">
                    Or sign up with email
                  </div>
                  <span className="block h-px w-full bg-stroke dark:bg-dark-3"></span>
                </div>

                <SignUPForm
                  initialValue={signUpData}
                  setSignUpData={setSignUpData}
                  setIsFinalStep={setIsFinalStep}
                />
                <div className="mt-6 text-center">
                  <p>
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary">
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="xl:p-9.5">
                <OnBoardingForm
                  setOnBoardingData={handleOnBoardingData}
                  setIsFinalStep={setIsFinalStep}
                  initialValue={onBoardingData}
                  isLoading={isLoading}
                />
              </div>
            )}
            {!isFinalStep && <WelcomePage />}
          </div>
        </div>
        <style>{`
          // Basic dark mode styles for Steps
          .dark .ant-steps .ant-steps-item-title {
            color: rgba(255, 255, 255, 0.85) !important;
          }

          // Current step styles
          .dark .ant-steps .ant-steps-item-process .ant-steps-item-icon {
            background-color: #5750f1 !important;
            border-color: #5750f1 !important;
          }
          .dark
            .ant-steps
            .ant-steps-item-process
            .ant-steps-item-icon
            .ant-steps-icon {
            color: #fff !important;
          }
          .dark .ant-steps .ant-steps-item-process .ant-steps-item-title {
            color: #fff !important;
          }

          // Completed step styles
          .dark .ant-steps .ant-steps-item-finish .ant-steps-item-icon {
            background-color: transparent !important;
            border-color: #5750f1 !important;
          }
          .dark
            .ant-steps
            .ant-steps-item-finish
            .ant-steps-item-icon
            .ant-steps-icon {
            color: #5750f1 !important;
          }
          .dark .ant-steps .ant-steps-item-finish .ant-steps-item-title {
            color: rgba(255, 255, 255, 0.85) !important;
          }

          // Waiting step styles
          .dark .ant-steps .ant-steps-item-wait .ant-steps-item-icon {
            background-color: transparent !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
          }
          .dark
            .ant-steps
            .ant-steps-item-wait
            .ant-steps-item-icon
            .ant-steps-icon {
            color: rgba(255, 255, 255, 0.3) !important;
          }
          .dark .ant-steps .ant-steps-item-wait .ant-steps-item-title {
            color: rgba(255, 255, 255, 0.45) !important;
          }

          // Step connector styles
          .dark
            .ant-steps
            .ant-steps-item:not(.ant-steps-item-process)
            .ant-steps-item-container[role="button"]:hover
            .ant-steps-item-title {
            color: #5750f1 !important;
          }
          .dark
            .ant-steps
            .ant-steps-item-finish
            > .ant-steps-item-container
            > .ant-steps-item-tail::after {
            background-color: #5750f1 !important;
          }
          .dark
            .ant-steps
            .ant-steps-item-wait
            > .ant-steps-item-container
            > .ant-steps-item-tail::after {
            background-color: rgba(255, 255, 255, 0.3) !important;
          }

          // Description text styles if you have descriptions
          .dark .ant-steps .ant-steps-item-description {
            color: rgba(255, 255, 255, 0.45) !important;
          }
        `}</style>
      </div>
    </div>
  );
}
