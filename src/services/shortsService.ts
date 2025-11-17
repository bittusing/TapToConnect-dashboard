import { API } from "../api";
import { END_POINT } from "../api/UrlProvider";
import {
  ShortItem,
  ShortPayload,
  ShortsFilters,
  ShortsListResponse,
} from "../types/shorts";

type ApiResult<T> = {
  data?: T;
  message?: string;
  error?: string | boolean;
  options?: unknown;
};

const buildFilters = (filters: Partial<ShortsFilters>) => {
  const cleanedFilters: Record<string, unknown> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleanedFilters[key] = value;
    }
  });
  return cleanedFilters;
};

export const fetchShorts = async (
  filters: Partial<ShortsFilters>
): Promise<ApiResult<ShortsListResponse>> => {
  const response = await API.getAuthAPI<ShortsListResponse>(
    END_POINT.SHORTS,
    true,
    buildFilters(filters)
  );

  return response;
};

export const fetchShortById = async (
  shortId: string
): Promise<ApiResult<ShortItem>> => {
  const response = await API.getAuthAPI<ShortItem>(
    `${END_POINT.SHORTS}/${shortId}`,
    true
  );

  return response;
};

export const createShort = async (
  payload: ShortPayload
): Promise<ApiResult<ShortItem>> => {
  const response = await API.postAuthAPI<ShortItem>(
    payload,
    END_POINT.SHORTS,
    true
  );

  return response;
};

export const updateShort = async (
  shortId: string,
  payload: Partial<ShortPayload>
): Promise<ApiResult<ShortItem>> => {
  const response = await API.updateAuthAPI<ShortItem>(
    payload,
    shortId,
    END_POINT.SHORTS,
    true
  );

  return response;
};

export const deleteShort = async (
  shortId: string
): Promise<ApiResult<{ success: boolean }>> => {
  const response = await API.DeleteAuthAPI<{ success: boolean }>(
    shortId,
    END_POINT.SHORTS,
    true
  );

  return response;
};

export default {
  fetchShorts,
  fetchShortById,
  createShort,
  updateShort,
  deleteShort,
};




