import { jwtDecode } from "jwt-decode";
import { postAuthAPI } from "../api";
import { END_POINT } from "../api/UrlProvider";

interface TokenPayload {
  _id?: string;
  role?: string;
  companyId?: string;
  iat: number;
  exp: number;
}

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return false;
    }

    // TODO: Temporarily relaxed validation - remove when API is ready
    // Validate required fields exist
    // if (!decoded._id || !decoded.role || !decoded.companyId) {
    //   return false;
    // }

    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    // TODO: Temporarily return true for development
    return true;
  }
};

export const getValidToken = async () => {
  // export const getValidToken = async (): Promise<string | null> => {
  try {
    // Get current access token from localStorage
    const accessToken = localStorage.getItem("accessToken");

    // Check if current token is valid
    if (!accessToken || !isTokenValid(accessToken)) {
      // No refresh token available, user needs to login again
      localStorage.clear();
      window.location.href = "/login";
      return null;
    }

    return accessToken;

    // If token is invalid, try to refresh
    // const refreshToken = localStorage.getItem('refreshToken');

    // if (!refreshToken) {
    //   // No refresh token available, user needs to login again
    //   localStorage.clear();
    //   window.location.href = '/login';
    //   return null;
    // }

    // Make refresh token API call
    // const response = await postAuthAPI(
    //   { refreshToken },
    //   END_POINT.REFRESH_TOKEN
    // );

    // if (response.error) {
    //   // Refresh token is invalid or expired
    //   localStorage.clear();
    //   window.location.href = '/login';
    //   return null;
    // }

    // Store new tokens
    // const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
    // localStorage.setItem('accessToken', newAccessToken);
    // localStorage.setItem('refreshToken', newRefreshToken);

    // return newAccessToken;
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error in getValidToken:", error);
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
};

// Optional: Helper function to use in API calls
export const getAuthHeader = async () => {
  const token = await getValidToken();
  return token ? `${token}` : "";
};
