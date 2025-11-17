import { toast } from "react-toastify";

export const handleLogout = () => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedMenu");
    localStorage.removeItem("crm_status");
    localStorage.removeItem("crm_sources");
    localStorage.removeItem("crm_agents");
    localStorage.removeItem("crm_lostReason");
    localStorage.removeItem("crm_products_services");
    localStorage.removeItem("crm_countries");
    localStorage.removeItem("fcmWebToken");
    toast.success("Logout successfully");
    window.location.href = "/login";
  } catch (err: any) {
    console.log(err);
    toast.error(err || "Unable to logout!");
  }
};
