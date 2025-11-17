import { API } from "../api";
import { END_POINT } from "../api/UrlProvider";
import {
  AdminDashboardSummary,
  ConfirmActivationRequest,
  ConfirmActivationResponse,
  GenerateBulkRequest,
  GenerateBulkResponse,
  PaymentStatus,
  RequestOtpRequest,
  RequestOtpResponse,
  SaleType,
  TagAssignmentDetails,
  TagAssignmentPreferences,
  TagAssignmentVehicle,
  TagItem,
  TagListFilters,
  TagListResponse,
  TagOwnerDetails,
  TagStatus,
  TagVerifyResult,
  UpdateTagStatusRequest,
  UserListResponse,
  UserListItem,
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

const MOCK_DASHBOARD_SUMMARY: AdminDashboardSummary = {
  totals: {
    tags: {
      total: 8450,
      generated: 520,
      assigned: 7120,
      activated: 5630,
      archived: 140,
    },
    messages: {
      total: 3120,
      unread: 42,
      last24h: 86,
    },
    activations: {
      total: 5630,
      pending: 220,
      completed: 5280,
    },
    users: {
      total: 215,
      admins: 12,
      owners: 203,
    },
    sales: {
      totalSales: 1285,
      totalRevenue: 1_875_000,
      averageOrderValue: 1_459,
      revenueToday: 48_500,
      revenueYesterday: 52_300,
      salesYesterday: 42,
      pendingPayments: 34,
      onlineSales: 740,
      offlineSales: 380,
      affiliateSales: 165,
    },
  },
  tagHealth: {
    generatedToday: 68,
    assignedToday: 54,
    activatedToday: 49,
    pendingActivation: 210,
  },
  salesChannels: [
    { label: "Online", value: 740, amount: 1_120_000 },
    { label: "Offline", value: 380, amount: 540_000 },
    { label: "Affiliate", value: 165, amount: 215_000 },
  ],
  trends: [
    { label: "Jun", tagsGenerated: 280, tagsActivated: 220, messagesReceived: 55 },
    { label: "Jul", tagsGenerated: 320, tagsActivated: 250, messagesReceived: 70 },
    { label: "Aug", tagsGenerated: 360, tagsActivated: 300, messagesReceived: 82 },
    { label: "Sep", tagsGenerated: 410, tagsActivated: 340, messagesReceived: 95 },
    { label: "Oct", tagsGenerated: 460, tagsActivated: 390, messagesReceived: 120 },
    { label: "Nov", tagsGenerated: 520, tagsActivated: 430, messagesReceived: 140 },
  ],
  recentActivations: [
    {
      title: "Tag activated successfully",
      description: "hs48qq3s assigned to Abhilekh Singh",
      shortCode: "hs48qq3s",
      occurredAt: "2025-11-15T14:17:09.011Z",
      status: "completed",
    },
    {
      title: "Activation pending verification",
      description: "hedkgcbg waiting for OTP confirmation",
      shortCode: "hedkgcbg",
      occurredAt: "2025-11-15T14:07:25.113Z",
      status: "pending",
    },
    {
      title: "Tag assigned to affiliate",
      description: "ybozekg9 assigned to Abhishek Singh",
      shortCode: "ybozekg9",
      occurredAt: "2025-11-15T14:05:10.160Z",
      status: "assigned",
    },
  ],
  affiliateLeaders: [
    {
      partnerId: "AP-101",
      name: "Abhishek Singh",
      activatedTags: 420,
      totalTags: 560,
      salesAmount: 680_000,
      commissionAmount: 74_000,
      conversionRate: 75,
    },
    {
      partnerId: "AP-083",
      name: "Sudhanshu Kasyap",
      activatedTags: 310,
      totalTags: 420,
      salesAmount: 540_000,
      commissionAmount: 52_000,
      conversionRate: 71,
    },
    {
      partnerId: "AP-064",
      name: "Dinesh Gupta",
      activatedTags: 265,
      totalTags: 360,
      salesAmount: 410_000,
      commissionAmount: 36_000,
      conversionRate: 68,
    },
  ],
  recentSales: [
    {
      saleId: "SAL-001",
      shortCode: "hs48qq3s",
      buyerName: "Abhilekh Singh",
      affiliateName: "Sudhanshu Kasyap",
      saleType: "online",
      amount: 2_499,
      status: "completed",
      date: "2025-11-15T14:17:09.011Z",
    },
    {
      saleId: "SAL-002",
      shortCode: "hedkgcbg",
      buyerName: "Aditya Kasyap",
      affiliateName: "Gopal Singh",
      saleType: "offline",
      amount: 1_999,
      status: "pending",
      date: "2025-11-15T14:07:25.113Z",
    },
    {
      saleId: "SAL-003",
      shortCode: "ybozekg9",
      buyerName: "Dinesh Gupta",
      affiliateName: "Abhishek Singh",
      saleType: "online",
      amount: 2_799,
      status: "completed",
      date: "2025-11-15T14:13:35.886Z",
    },
    {
      saleId: "SAL-004",
      shortCode: "05n_pgmb",
      buyerName: "Kiran Desai",
      affiliateName: "Support Team",
      saleType: "offline",
      amount: 1_599,
      status: "cancelled",
      date: "2025-11-15T13:22:20.328Z",
    },
  ],
};

export const getAdminDashboardSummary = async (): Promise<AdminDashboardSummary> => {
  try {
    const response = await API.getAuthAPI<AdminDashboardSummary>(
      END_POINT.ADMIN_DASHBOARD_SUMMARY,
      true
    );

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      return {
        ...MOCK_DASHBOARD_SUMMARY,
        ...response.data,
        totals: {
          ...MOCK_DASHBOARD_SUMMARY.totals,
          ...response.data.totals,
          sales:
            response.data.totals?.sales ??
            MOCK_DASHBOARD_SUMMARY.totals?.sales,
        },
        tagHealth: response.data.tagHealth ?? MOCK_DASHBOARD_SUMMARY.tagHealth,
        salesChannels:
          response.data.salesChannels ?? MOCK_DASHBOARD_SUMMARY.salesChannels,
        affiliateLeaders:
          response.data.affiliateLeaders ??
          MOCK_DASHBOARD_SUMMARY.affiliateLeaders,
        recentSales:
          response.data.recentSales ?? MOCK_DASHBOARD_SUMMARY.recentSales,
      };
    }
  } catch (error) {
    console.warn("Failed to load admin dashboard summary:", error);
  }

  return MOCK_DASHBOARD_SUMMARY;
};

const normalizeTagItem = (raw: Record<string, unknown>): TagItem => {
  const assigned = raw?.["assignedTo"] as Record<string, unknown> | undefined;
  const ownerAssigned = raw?.["ownerAssignedTo"] as Record<string, unknown> | undefined;
  const activation = raw?.["activation"] as Record<string, unknown> | undefined;

  // assignedTo contains affiliate user details - keep as is (can be full object)
  const assignedDetails = assigned || undefined;

  // ownerAssignedTo contains vehicle owner details - normalize to TagOwnerDetails
  const ownerAssignedDetails: TagOwnerDetails | undefined = ownerAssigned
    ? {
        id:
          (ownerAssigned["_id"] as string | undefined) ??
          (ownerAssigned["id"] as string | undefined),
        fullName: ownerAssigned["fullName"] as string | undefined,
        email: ownerAssigned["email"] as string | undefined,
        phone: ownerAssigned["phone"] as string | undefined,
        city: ownerAssigned["city"] as string | undefined,
        preferences: ownerAssigned["preferences"] as
          | TagAssignmentPreferences
          | undefined,
        vehicle: ownerAssigned["vehicle"] as TagAssignmentVehicle | undefined,
        isActive: ownerAssigned["isActive"] as boolean | undefined,
        createdAt: ownerAssigned["createdAt"] as string | undefined,
        updatedAt: ownerAssigned["updatedAt"] as string | undefined,
      }
    : undefined;

  // Legacy owner field (for backward compatibility)
  const owner: TagOwnerDetails | undefined = ownerAssignedDetails;

  const status = (raw["status"] as TagStatus | undefined) ?? "generated";

  return {
    tagId: (raw["tagId"] as string | undefined) ?? (raw["_id"] as string | undefined),
    _id: (raw["_id"] as string | undefined) ?? (raw["id"] as string | undefined),
    shortCode: raw["shortCode"] as string,
    shortUrl: raw["shortUrl"] as string | undefined,
    qrUrl: raw["qrUrl"] as string | undefined,
    status,
    batchName: raw["batchName"] as string | undefined,
    metadata: (raw["metadata"] as Record<string, unknown>) ?? {},
    owner,
    assignedTo: assignedDetails,
    ownerAssignedTo: ownerAssignedDetails,
    createdAt: raw["createdAt"] as string | undefined,
    updatedAt: raw["updatedAt"] as string | undefined,
    activatedAt:
      (activation?.["activatedAt"] as string | undefined) ??
      (raw["activatedAt"] as string | undefined) ??
      (activation?.["verifiedAt"] as string | undefined),
  };
};

export const getAdminTags = async (
  filters: TagListFilters = {}
): Promise<TagListResponse> => {
  const params = sanitizeParams({
    status: filters.status,
    batchName: filters.batchName,
    search: filters.search,
    page: filters.page,
    limit: filters.limit,
  });

  const response = await API.getAuthAPI<TagListResponse>(
    END_POINT.ADMIN_TAGS,
    true,
    params
  );
  
  if (response.error) {
    throw new Error(response.error);
  }

  // API wrapper now handles both wrapped and direct responses
  // response.data will contain the actual data (either { items: [...] } or the wrapped data)
  const data = response.data;
  
  if (!data || typeof data !== 'object') {
    console.warn("No data received from API");
    return { tags: [], pagination: { total: 0, page: filters.page ?? 1, limit: filters.limit ?? 10 } };
  }
  
  const dataObj = data as unknown as Record<string, unknown>;
  console.log("API Response.data:", dataObj);
  console.log("Response.data keys:", Object.keys(dataObj));
  
  // Backend returns 'items' array, not 'tags'
  const rawItems: unknown[] = Array.isArray(dataObj.items)
    ? dataObj.items as unknown[]
    : Array.isArray((dataObj as unknown as TagListResponse).tags)
    ? (dataObj as unknown as TagListResponse).tags
    : [];

  console.log("Raw items found:", rawItems.length);

  const tags = rawItems.map((item: unknown) => {
    if (typeof item === "object" && item !== null) {
      const itemObj = item as Record<string, unknown>;
      // Check if it's already normalized (has 'owner' property) or needs normalization
      if (!("owner" in itemObj)) {
        return normalizeTagItem(itemObj);
      }
    }
    return item as TagItem;
  });

  // Pagination is at root level: total, page, pages
  const rootPagination = dataObj as { total?: number; page?: number; pages?: number };
  const existingPagination = (dataObj as unknown as TagListResponse).pagination;

  const pagination = existingPagination || {
    total: rootPagination.total,
    page: rootPagination.page ?? filters.page ?? 1,
    pages: rootPagination.pages,
    limit: filters.limit ?? 10,
  };

  console.log("Final tags count:", tags.length);
  console.log("Pagination:", pagination);

  return {
    tags,
    pagination,
  };
};

export const updateTagStatus = async (
  shortCode: string,
  payload: UpdateTagStatusRequest
): Promise<TagItem> => {
  if (!shortCode) {
    throw new Error("Tag short code is required");
  }

  const response = await API.patchAuthAPI<TagItem>(
    payload,
    `${END_POINT.ADMIN_TAGS}/${shortCode}/status`,
    true,
    {}
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data || ({} as TagItem);
};

export const generateBulkTags = async (
  payload: GenerateBulkRequest
): Promise<GenerateBulkResponse> => {
  if (!payload?.count || payload.count < 1) {
    throw new Error("Count must be a positive number");
  }

  const response = await API.postAuthAPI<any>(
    payload,
    END_POINT.QR_GENERATE_BULK,
    true
  );

  if (response.error) {
    throw new Error(response.error);
  }

  const data = response.data;
  
  if (!data || typeof data !== 'object') {
    console.warn("No data received from generateBulkTags API");
    return { tags: [] };
  }

  const dataObj = data as Record<string, unknown>;
  console.log("GenerateBulkTags API Response.data:", dataObj);
  console.log("GenerateBulkTags Response.data keys:", Object.keys(dataObj));

  // Handle different response formats: items, tags, or direct array
  let rawTags: unknown[] = [];
  
  if (Array.isArray(dataObj.items)) {
    rawTags = dataObj.items as unknown[];
  } else if (Array.isArray(dataObj.tags)) {
    rawTags = dataObj.tags as unknown[];
  } else if (Array.isArray(dataObj)) {
    rawTags = dataObj as unknown[];
  }

  console.log("Raw tags found:", rawTags.length);

  // Normalize tags if needed
  const tags: TagItem[] = rawTags.map((item: unknown) => {
    if (typeof item === "object" && item !== null) {
      const itemObj = item as Record<string, unknown>;
      // Check if it's already normalized (has 'shortCode' and proper structure) or needs normalization
      if ("shortCode" in itemObj && typeof itemObj.shortCode === "string") {
        // Already in TagItem format, but might need normalization for assignedTo/ownerAssignedTo
        if (!("owner" in itemObj) && !("ownerAssignedTo" in itemObj)) {
          return normalizeTagItem(itemObj);
        }
        return item as TagItem;
      }
      return normalizeTagItem(itemObj);
    }
    return item as TagItem;
  });

  console.log("Normalized tags count:", tags.length);

  // Extract batchName and other metadata
  const batchName = (dataObj.batchName as string | undefined) || payload.batchName;
  const totalGenerated = (dataObj.totalGenerated as number | undefined) || tags.length;

  return {
    tags,
    batchName,
    totalGenerated,
    createdAt: (dataObj.createdAt as string | undefined) || new Date().toISOString(),
  };
};

export const requestActivationOtp = async (
  payload: RequestOtpRequest
): Promise<RequestOtpResponse> => {
  if (!payload.shortCode || !payload.phone) {
    throw new Error("Short code and phone are required");
  }

  const response = await API.postAuthAPI<RequestOtpResponse>(
    payload,
    END_POINT.ACTIVATE_TAG_REQUEST_OTP,
    true
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data || {};
};

export const confirmTagActivation = async (
  payload: ConfirmActivationRequest
): Promise<ConfirmActivationResponse> => {
  if (!payload.shortCode || !payload.otp || !payload.fullName || !payload.phone) {
    throw new Error("Short code, OTP, full name, and phone are required");
  }

  const response = await API.postAuthAPI<ConfirmActivationResponse>(
    payload,
    END_POINT.ACTIVATE_TAG_CONFIRM,
    true
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data || {};
};

export const verifyTagByShortCode = async (
  shortCode: string
): Promise<TagVerifyResult> => {
  if (!shortCode) {
    throw new Error("Tag short code is required");
  }

  const response = await API.getAuthAPI<
    { data?: Record<string, unknown> } | Record<string, unknown>
  >(`${END_POINT.QR_TAG_VERIFY}/${encodeURIComponent(shortCode)}`, true);

  if (response.error) {
    throw new Error(response.error);
  }

  const rawData =
    (response.data as { data?: Record<string, unknown> })?.data ||
    (response.data as Record<string, unknown>);

  if (!rawData || typeof rawData !== "object") {
    throw new Error("Invalid response from tag verification API");
  }

  const normalized: TagVerifyResult = {
    _id: (rawData._id as string) ?? "",
    shortCode: (rawData.shortCode as string) ?? "",
    shortUrl: rawData.shortUrl as string | undefined,
    qrUrl: rawData.qrUrl as string | undefined,
    status: rawData.status as TagStatus | undefined,
    batchName: rawData.batchName as string | undefined,
    assignedTo: rawData.assignedTo as string | undefined,
    ownerId: rawData.ownerId as string | undefined,
    ownerFullName: rawData.fullName as string | undefined,
    ownerPhone: rawData.phone as string | undefined,
    ownerEmail: rawData.email as string | undefined,
    vehicleNumber: rawData.vehicleNumber as string | undefined,
    vehicleType: rawData.vehicleType as string | undefined,
    createdAt: rawData.createdAt as string | undefined,
    updatedAt: rawData.updatedAt as string | undefined,
  };

  if (!normalized._id) {
    throw new Error("Tag ID missing in verification response");
  }

  return normalized;
};

export const getUserListForAssignment = async (): Promise<UserListResponse> => {
  const response = await API.getAuthAPI<UserListResponse>(
    END_POINT.USER_LIST_ADMIN_SUPPORT_AFFILIATE,
    true
  );

  if (response.error) {
    throw new Error(response.error);
  }

  // Handle both direct response and wrapped response
  const data = response.data || {};
  
  // Check if users array exists directly or nested
  if (Array.isArray((data as { users?: UserListItem[] }).users)) {
    return data as UserListResponse;
  }
  
  // If response.data itself has users array
  if (Array.isArray((data as UserListResponse).users)) {
    return data as UserListResponse;
  }

  // Return empty array if structure is unexpected
  return { users: [] };
};


