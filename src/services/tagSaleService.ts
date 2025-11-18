import { API } from "../api";
import { END_POINT } from "../api/UrlProvider";
import {
  TagSale,
  TagSaleListResponse,
  TagSaleFilters,
  SaleType,
  PaymentStatus,
  VerificationStatus,
  SalesPersonRole,
} from "../types/qr";

const sanitizeParams = (params: Record<string, unknown>) => {
  const sanitized = Object.entries(params).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "all"
      ) {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );
  return sanitized;
};

const normalizeSale = (itemObj: Record<string, unknown>): TagSale => {
  const paymentImage = itemObj.paymentImageOrScreenShot;
  const normalizedPaymentImage =
    typeof paymentImage === "string" ? paymentImage : undefined;

  return {
    _id: itemObj._id as string | undefined,
    tag: itemObj.tag as TagSale["tag"],
    SalesPerson: itemObj.SalesPerson as TagSale["SalesPerson"],
    owner: itemObj.owner as TagSale["owner"],
    saleDate: itemObj.saleDate as string | undefined,
    saleType: itemObj.saleType as SaleType | undefined,
    salesPersonRole: itemObj.salesPersonRole as SalesPersonRole | undefined,
    totalSaleAmount: itemObj.totalSaleAmount as number | undefined,
    commisionAmountOfSalesPerson:
      itemObj.commisionAmountOfSalesPerson as number | undefined,
    commisionAmountOfOwner:
      itemObj.commisionAmountOfOwner as number | undefined,
    castAmountOfProductAndServices:
      itemObj.castAmountOfProductAndServices as number | undefined,
    paymentStatus: itemObj.paymentStatus as PaymentStatus | undefined,
    varificationStatus: itemObj.varificationStatus as VerificationStatus | undefined,
    message: itemObj.message as TagSale["message"],
    paymentImageOrScreenShot: normalizedPaymentImage,
    createdBy: itemObj.createdBy as TagSale["createdBy"],
    updatedBy: itemObj.updatedBy as TagSale["updatedBy"],
    createdAt: itemObj.createdAt as string | undefined,
    updatedAt: itemObj.updatedAt as string | undefined,
  };
};

const extractEntityId = (value: TagSale["tag"] | TagSale["SalesPerson"] | TagSale["owner"] | string | undefined): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value && value?._id) {
    return value._id as string;
  }
  return "";
};

export const getTagSales = async (
  filters: TagSaleFilters = {}
): Promise<TagSaleListResponse> => {
  // Build query parameters
  const params = sanitizeParams({
    saleType: filters.saleType,
    paymentStatus: filters.paymentStatus,
    varificationStatus: filters.varificationStatus,
    salesPersonRole: filters.salesPersonRole,
    affiliatePartnerId: filters.affiliatePartnerId,
    search: filters.search,
    page: filters.page,
    limit: filters.limit,
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const response = await API.getAuthAPI<any>(
    END_POINT.QR_SALE_LIST,
    true,
    params
  );

  if (response.error) {
    throw new Error(response.error);
  }

  const data = response.data || {};
  
  if (!data || typeof data !== 'object') {
    console.warn("No data received from sale list API");
    return { sales: [], pagination: { total: 0, page: filters.page ?? 1, limit: filters.limit ?? 10 } };
  }

  const dataObj = data as Record<string, unknown>;
  console.log("Sale List API Response.data:", dataObj);

  // Backend returns 'items' array
  const rawItems: unknown[] = Array.isArray(dataObj.items)
    ? dataObj.items as unknown[]
    : [];

  console.log("Raw sale items found:", rawItems.length);

  // Normalize sales from API response
  const sales: TagSale[] = rawItems.map((item: unknown) => {
    if (typeof item === "object" && item !== null) {
      return normalizeSale(item as Record<string, unknown>);
    }
    return item as TagSale;
  });

  console.log("Normalized sales count:", sales.length);

  // Pagination from API response
  const rootPagination = dataObj as { total?: number; page?: number; pages?: number };
  const page = rootPagination.page ?? filters.page ?? 1;
  const limit = filters.limit ?? 10;

  return {
    sales,
    pagination: {
      total: rootPagination.total ?? sales.length,
      page,
      pages: rootPagination.pages ?? Math.ceil((rootPagination.total ?? sales.length) / limit),
      limit,
    },
  };
};

export const getTagSaleById = async (saleId: string): Promise<TagSale> => {
  if (!saleId) {
    throw new Error("Sale ID is required");
  }

  const response = await API.getAuthAPI<
    { data?: Record<string, unknown> } | Record<string, unknown>
  >(`${END_POINT.QR_SALE_DETAIL}/${saleId}`, true);

  if (response.error) {
    throw new Error(response.error);
  }

  const rawData =
    (response.data as { data?: Record<string, unknown> })?.data ||
    (response.data as Record<string, unknown>);

  if (!rawData || typeof rawData !== "object") {
    throw new Error("Sale not found");
  }

  return normalizeSale(rawData);
};

export const createTagSale = async (
  payload: Omit<TagSale, "_id" | "createdAt" | "updatedAt">
): Promise<TagSale> => {
  // Extract IDs from payload
  const tagId = typeof payload.tag === "object" && payload.tag?._id
    ? payload.tag._id
    : typeof payload.tag === "string"
    ? payload.tag
    : "";

  const salesPersonId = typeof payload.SalesPerson === "object" && payload.SalesPerson?._id
    ? payload.SalesPerson._id
    : typeof payload.SalesPerson === "string"
    ? payload.SalesPerson
    : "";

  const ownerId = typeof payload.owner === "object" && payload.owner?._id
    ? payload.owner._id
    : typeof payload.owner === "string"
    ? payload.owner
    : "";

  // Build API payload
  const apiPayload: Record<string, unknown> = {
    tagId,
    salesPersonId,
    ownerId,
    saleDate: payload.saleDate,
    saleType: payload.saleType,
    totalSaleAmount: payload.totalSaleAmount,
    commisionAmountOfSalesPerson: payload.commisionAmountOfSalesPerson,
    commisionAmountOfOwner: payload.commisionAmountOfOwner,
    castAmountOfProductAndServices: payload.castAmountOfProductAndServices,
    paymentStatus: payload.paymentStatus,
    varificationStatus: payload.varificationStatus,
  };

  // Add message if provided
  if (payload.message && Array.isArray(payload.message) && payload.message.length > 0) {
    apiPayload.message = payload.message;
  }

  // Add payment image if provided
  if (payload.paymentImageOrScreenShot) {
    apiPayload.paymentImageOrScreenShot = payload.paymentImageOrScreenShot;
  }

  const response = await API.postAuthAPI<any>(
    apiPayload,
    END_POINT.QR_SALE_CREATE,
    true
  );

  if (response.error) {
    throw new Error(response.error);
  }

  const data = response.data || {};
  
  // Map API response back to TagSale format
  const paymentImage = data.paymentImageOrScreenShot;
  const normalizedPaymentImage =
    typeof paymentImage === "string" ? paymentImage : undefined;

  const sale: TagSale = {
    _id: data._id as string | undefined,
    tag: data.tag as TagSale["tag"],
    SalesPerson: data.SalesPerson as TagSale["SalesPerson"],
    owner: data.owner as TagSale["owner"],
    saleDate: data.saleDate as string | undefined,
    saleType: data.saleType as SaleType | undefined,
    salesPersonRole: data.salesPersonRole as SalesPersonRole | undefined,
    totalSaleAmount: data.totalSaleAmount as number | undefined,
    commisionAmountOfSalesPerson: data.commisionAmountOfSalesPerson as number | undefined,
    commisionAmountOfOwner: data.commisionAmountOfOwner as number | undefined,
    castAmountOfProductAndServices: data.castAmountOfProductAndServices as number | undefined,
    paymentStatus: data.paymentStatus as PaymentStatus | undefined,
    varificationStatus: data.varificationStatus as VerificationStatus | undefined,
    message: data.message as TagSale["message"],
    paymentImageOrScreenShot: normalizedPaymentImage,
    createdBy: data.createdBy as TagSale["createdBy"],
    updatedBy: data.updatedBy as TagSale["updatedBy"],
    createdAt: data.createdAt as string | undefined,
    updatedAt: data.updatedAt as string | undefined,
  };

  return sale;
};

export const updateTagSale = async (
  saleId: string,
  payload: Partial<TagSale>
): Promise<TagSale> => {
  if (!saleId) {
    throw new Error("Sale ID is required");
  }

  const tagId = extractEntityId(payload.tag);
  const salesPersonId = extractEntityId(payload.SalesPerson);
  const ownerId = extractEntityId(payload.owner);

  const apiPayload: Record<string, unknown> = {};

  if (tagId) apiPayload.tagId = tagId;
  if (salesPersonId) apiPayload.salesPersonId = salesPersonId;
  if (ownerId) apiPayload.ownerId = ownerId;
  if (payload.saleDate) apiPayload.saleDate = payload.saleDate;
  if (payload.saleType) apiPayload.saleType = payload.saleType;
  if (payload.totalSaleAmount !== undefined) {
    apiPayload.totalSaleAmount = payload.totalSaleAmount;
  }
  if (payload.commisionAmountOfSalesPerson !== undefined) {
    apiPayload.commisionAmountOfSalesPerson = payload.commisionAmountOfSalesPerson;
  }
  if (payload.commisionAmountOfOwner !== undefined) {
    apiPayload.commisionAmountOfOwner = payload.commisionAmountOfOwner;
  }
  if (payload.castAmountOfProductAndServices !== undefined) {
    apiPayload.castAmountOfProductAndServices = payload.castAmountOfProductAndServices;
  }
  if (payload.paymentStatus) {
    apiPayload.paymentStatus = payload.paymentStatus;
  }
  if (payload.varificationStatus) {
    apiPayload.varificationStatus = payload.varificationStatus;
  }
  if (payload.message && payload.message.length > 0) {
    apiPayload.message = payload.message;
  }
  if (payload.paymentImageOrScreenShot) {
    apiPayload.paymentImageOrScreenShot = payload.paymentImageOrScreenShot;
  }

  const response = await API.updateAuthAPI<any>(
    apiPayload,
    saleId,
    END_POINT.QR_SALE_UPDATE,
    true
  );

  if (response.error) {
    throw new Error(response.error);
  }

  const rawData =
    (response.data as { data?: Record<string, unknown> })?.data ||
    (response.data as Record<string, unknown>);

  if (!rawData || typeof rawData !== "object") {
    throw new Error("Invalid response from sale update API");
  }

  return normalizeSale(rawData);
};

export const deleteTagSale = async (saleId: string): Promise<void> => {
  if (!saleId) {
    throw new Error("Sale ID is required");
  }

  const response = await API.DeleteAuthAPI<{ message?: string }>(
    saleId,
    END_POINT.QR_SALE_DELETE,
    true
  );

  if (response.error) {
    throw new Error(response.error || "Failed to delete sale");
  }
};

