// api.ts
import axios, { AxiosError } from "axios";
import { NavigateFunction } from "react-router-dom";
import { BASE_URL } from "./UrlProvider";
import { LocalStorage } from "../utils/localStorage";
import { toast } from "react-toastify";
import { ApiResponse, ApiConfig, ApiMethods } from "../types/api";
import { getAuthHeader } from "../utils/TokenVerify";
import { handleApiError } from "../utils/handleApiError";
import { ADMIN_API_KEY } from "./UrlProvider";

export const getAuthAPI = async <T>(
  endPoint: string,
  tokenRequired: boolean = false,
  // Token: string = "",
  // navigate?: NavigateFunction,
  params: Record<string, any> = {},
  customHeaders: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  const header = tokenRequired ? await getAuthHeader() : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(header ? { Authorization: header } : {}),
    ...(ADMIN_API_KEY ? { "X-Admin-Api-Key": ADMIN_API_KEY } : {}),
    ...customHeaders,
  };
  const config: ApiConfig = {
    method: "get",
    url: `${BASE_URL}${endPoint}`,
    headers,
    params,
    timeout: 10000,
  };

  try {
    const response = await axios.request<T>(config);
    const axiosData = response?.data;
    
    // Check if backend wrapped response in { data, message, error } format
    if (axiosData && typeof axiosData === 'object' && 'data' in axiosData) {
      const { data, message, error, options }: any = axiosData;
      return { data, message, error, options };
    }
    
    // Backend returned data directly (e.g., { items: [...], total: 4 })
    // Use the entire response as data
    return { data: axiosData, message: undefined, error: undefined, options: undefined };
  } catch (error) {
    return handleApiError(error);
  }
};

export const postAuthAPI = async <T>(
  body: any,
  endPoint: string,
  tokenRequired: boolean = false,
  customHeaders: Record<string, string> = {}
  //   navigate: NavigateFunction | null = null
): Promise<ApiResponse<T>> => {
  const header = tokenRequired ? await getAuthHeader() : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(header ? { Authorization: header } : {}),
    ...(ADMIN_API_KEY ? { "X-Admin-Api-Key": ADMIN_API_KEY } : {}),
    ...customHeaders,
  };
  const config: ApiConfig = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${BASE_URL}${endPoint}`,
    headers,
    data: JSON.stringify(body),
    timeout: 10000,
  };

  try {
    const response = await axios.request<T>(config);
    const { data, message, error }: any = response?.data;
    return { data, message, error };
  } catch (error) {
    return handleApiError(error);
  }
};

export const postAuthAPI1 = async <T>(
  body: any,
  endPoint: string,
  Token: string = "",
  navigate: NavigateFunction | null = null,
  isFormData: boolean = false,
  config: any = {}
): Promise<ApiResponse<T>> => {
  // TODO: Temporarily disabled
  console.log('API Call Disabled (POST1):', endPoint, body);
  return { data: {} as any, message: '', error: '' };
  
  /* ORIGINAL CODE - UNCOMMENT WHEN READY
  try {
    const response = await axios({
      method: "post",
      url: `${BASE_URL}${endPoint}`,
      data: body,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        Authorization: Token,
        ...config.headers,
      },
    });

    const { data, message, error } = response?.data;
    return { data, message, error };
  } catch (error) {
    return handleApiError(error);
  }
  */
};

export const DeleteAuthAPI = async <T>(
  id: string | number,
  endPoint: string,
  tokenRequired: boolean = false,
  body?: any,
  idInUrl: boolean = true,
  customHeaders: Record<string, string> = {}
  // Token: string = "",
  // navigate?: NavigateFunction
): Promise<ApiResponse<T>> => {
  const header = tokenRequired ? await getAuthHeader() : "";
  const headers: Record<string, string> = {
    ...(header ? { Authorization: header } : {}),
    ...(ADMIN_API_KEY ? { "X-Admin-Api-Key": ADMIN_API_KEY } : {}),
    ...customHeaders,
  };
  const config: ApiConfig = {
    method: "delete",
    maxBodyLength: Infinity,
    url: idInUrl ? `${BASE_URL}${endPoint}/${id}` : `${BASE_URL}${endPoint}`,
    headers,
    data: body,
    timeout: 10000,
  };

  try {
    const response = await axios.request<T>(config);
    const { data, message, error }: any = response?.data;
    return { data, message, error };
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateAuthAPI = async <T>(
  body: any,
  id: string | number | null,
  endPoint: string,
  tokenRequired: boolean = false,
  customHeaders: Record<string, string> = {}
  // Token: string = "",
  // navigate?: NavigateFunction
): Promise<ApiResponse<T>> => {
  const header = tokenRequired ? await getAuthHeader() : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(header ? { Authorization: header } : {}),
    ...(ADMIN_API_KEY ? { "X-Admin-Api-Key": ADMIN_API_KEY } : {}),
    ...customHeaders,
  };
  const config: ApiConfig = {
    method: "put",
    maxBodyLength: Infinity,
    url:
      id !== null ? `${BASE_URL}${endPoint}/${id}` : `${BASE_URL}${endPoint}`,
    headers,
    data: JSON.stringify(body),
    timeout: 10000,
  };

  try {
    const response = await axios.request<T>(config);
    const { data, message, error }: any = response?.data;
    return { data, message, error };
  } catch (error) {
    return handleApiError(error);
  }
};

export const patchAuthAPI = async <T>(
  body: any,
  endPoint: string,
  tokenRequired: boolean = false,
  customHeaders: Record<string, string> = {}
): Promise<ApiResponse<T>> => {
  const header = tokenRequired ? await getAuthHeader() : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(header ? { Authorization: header } : {}),
    ...(ADMIN_API_KEY ? { "X-Admin-Api-Key": ADMIN_API_KEY } : {}),
    ...customHeaders,
  };

  const config: ApiConfig = {
    method: "patch",
    maxBodyLength: Infinity,
    url: `${BASE_URL}${endPoint}`,
    headers,
    data: JSON.stringify(body),
    timeout: 10000,
  };

  try {
    const response = await axios.request<T>(config);
    const { data, message, error }: any = response?.data;
    return { data, message, error };
  } catch (error) {
    return handleApiError(error);
  }
};

export const PutAuthAPI = async <T>(
  body: any | null,
  id: string | null,
  endPoint: string,
  tokenRequired: boolean = false,
  customHeaders: Record<string, string> = {}
  // navigate?: NavigateFunction
): Promise<ApiResponse<T>> => {
  // TODO: Temporarily disabled
  console.log('API Call Disabled (PUT):', endPoint, id, body);
  return { data: {} as any, message: '', error: '' };
  
  /* ORIGINAL CODE - UNCOMMENT WHEN READY
  const header = tokenRequired ? await getAuthHeader() : "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(header ? { Authorization: header } : {}),
    ...(ADMIN_API_KEY ? { "X-Admin-Api-Key": ADMIN_API_KEY } : {}),
    ...customHeaders,
  };
  const config: ApiConfig = {
    method: "put",
    maxBodyLength: Infinity,
    url: `${BASE_URL}${endPoint}${id ? "/" + id : ""}`,
    headers,
    timeout: 10000,
  };

  if (body !== null) {
    config.data = JSON.stringify(body);
  }

  try {
    const response = await axios.request<T>(config);
    const { data, message, error }: any = response?.data;
    return { data, message, error };
  } catch (error) {
    return handleApiError(error);
  }
  */
};

export const networkErrorAlert = (callback: () => void) => {
  // Implementation here if needed
};

export const API: ApiMethods = {
  getAuthAPI,
  postAuthAPI,
  postAuthAPI1,
  DeleteAuthAPI,
  updateAuthAPI,
  patchAuthAPI,
  PutAuthAPI,
};
