// api.d.ts
import { NavigateFunction } from "react-router-dom";
import { AxiosResponse } from "axios";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  options?: T;
}

export interface ApiConfig {
  method: string;
  url: string;
  headers: Record<string, string>;
  maxBodyLength?: number;
  data?: any;
  params?: Record<string, any>;
  timeout?: number;
}

export interface ApiMethods {
  getAuthAPI: <T = any>(
    endPoint: string,
    tokenRequired?: boolean,
    // Token?: string,
    // navigate?: NavigateFunction,
    params?: Record<string, any>,
    customHeaders?: Record<string, string>
  ) => Promise<ApiResponse<T>>;

  postAuthAPI: <T = any>(
    body: any,
    endPoint: string,
    // navigate?: NavigateFunction | null,
    tokenRequired?: boolean,
    customHeaders?: Record<string, string>
  ) => Promise<ApiResponse<T>>;

  postAuthAPI1: <T = any>(
    body: any,
    endPoint: string,
    Token?: string,
    navigate?: NavigateFunction | null,
    isFormData?: boolean,
    config?: any
  ) => Promise<ApiResponse<T>>;

  DeleteAuthAPI: <T = any>(
    id: string | number,
    endPoint: string,
    tokenRequired: boolean,
    body?: any,
    idInUrl?: boolean,
    customHeaders?: Record<string, string>
    // Token?: string,
    // navigate?: NavigateFunction
  ) => Promise<ApiResponse<T>>;

  updateAuthAPI: <T = any>(
    body: any,
    id: string | number | null,
    endPoint: string,
    tokenRequired?: boolean,
    customHeaders?: Record<string, string>
    // Token?: string,
    // navigate?: NavigateFunction
  ) => Promise<ApiResponse<T>>;

  patchAuthAPI: <T = any>(
    body: any,
    endPoint: string,
    tokenRequired?: boolean,
    customHeaders?: Record<string, string>
  ) => Promise<ApiResponse<T>>;

  PutAuthAPI: <T = any>(
    body: any | null,
    id: string | null,
    endPoint: string,
    tokenRequired?: boolean,
    customHeaders?: Record<string, string>
    // navigate?: NavigateFunction
  ) => Promise<ApiResponse<T>>;
}

