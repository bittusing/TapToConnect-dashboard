import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { LocalStorage } from "../utils/localStorage";

export const handleApiError = (
  error: unknown,
  navigatePath?: string
): { error: string } => {
  const axiosError = error as AxiosError<{ message: string }>;

  console.error(axiosError);

  // Temporarily disable error toasts for 401/404 during development
  // TODO: Remove this when all APIs are properly integrated
  if (axiosError.response?.status === 401) {
    const errorMessage = axiosError.response?.data?.message || "Error 401: Unauthorized";
    // toast.error(errorMessage); // Temporarily disabled
    console.log('401 Error suppressed:', errorMessage);
    // Don't logout on 401 errors - user should stay on dashboard
    if (navigatePath) {
      window.location.href = "/" + navigatePath;
    }
    return { error: errorMessage };
  }

  if (axiosError.response?.status === 404) {
    const errorMessage = axiosError.response?.data?.message || "Error 404: Not Found";
    // toast.error(errorMessage); // Temporarily disabled
    console.log('404 Error suppressed:', errorMessage);
    // Don't logout on 404 errors - user should stay on dashboard
    if (navigatePath) {
      window.location.href = "/" + navigatePath;
    }
    return { error: errorMessage };
  }

  if (navigatePath) {
    window.location.href = "/" + navigatePath;
  }

  const errorMessage =
    axiosError.response?.data?.message ||
    axiosError.message ||
    "An unexpected error occurred";
  toast.error(errorMessage);

  return { error: errorMessage };
};
