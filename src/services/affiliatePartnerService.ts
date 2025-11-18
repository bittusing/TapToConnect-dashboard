import { API } from "../api";
import { END_POINT } from "../api/UrlProvider";
import {
  AffiliatePartner,
  AffiliatePartnerFilters,
  AffiliatePartnerListResponse,
  AffiliatePartnerStats,
  TagAssignmentVehicle,
  TagItem,
  TagListResponse,
  TagListFilters,
  TagStatus,
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

// Mock data for development
const mockPartners: AffiliatePartner[] = [
  {
    _id: "1",
    partnerId: "AP001",
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "9876543210",
    company: "Tech Solutions Pvt Ltd",
    address: "123 Main Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    commissionRate: 15,
    status: "active",
    totalCardsActivated: 245,
    totalSales: 189,
    totalRevenue: 245000,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-11-13T10:00:00Z",
  },
  {
    _id: "2",
    partnerId: "AP002",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "9876543211",
    company: "Digital Marketing Agency",
    address: "456 Park Avenue",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    commissionRate: 12,
    status: "active",
    totalCardsActivated: 189,
    totalSales: 156,
    totalRevenue: 189000,
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2024-11-13T10:00:00Z",
  },
  {
    _id: "3",
    partnerId: "AP003",
    name: "Amit Patel",
    email: "amit@example.com",
    phone: "9876543212",
    company: "Sales Pro",
    address: "789 Business Park",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001",
    commissionRate: 18,
    status: "active",
    totalCardsActivated: 312,
    totalSales: 278,
    totalRevenue: 312000,
    createdAt: "2024-03-10T10:00:00Z",
    updatedAt: "2024-11-13T10:00:00Z",
  },
  {
    _id: "4",
    partnerId: "AP004",
    name: "Sneha Reddy",
    email: "sneha@example.com",
    phone: "9876543213",
    company: "Growth Partners",
    address: "321 Tech Hub",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    commissionRate: 10,
    status: "inactive",
    totalCardsActivated: 98,
    totalSales: 87,
    totalRevenue: 98000,
    createdAt: "2024-04-05T10:00:00Z",
    updatedAt: "2024-11-13T10:00:00Z",
  },
  {
    _id: "5",
    partnerId: "AP005",
    name: "Vikram Singh",
    email: "vikram@example.com",
    phone: "9876543214",
    company: "Elite Sales",
    address: "654 Commerce Street",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    commissionRate: 20,
    status: "active",
    totalCardsActivated: 456,
    totalSales: 412,
    totalRevenue: 456000,
    createdAt: "2024-05-12T10:00:00Z",
    updatedAt: "2024-11-13T10:00:00Z",
  },
];

export const getAffiliatePartners = async (
  filters: AffiliatePartnerFilters = {}
): Promise<AffiliatePartnerListResponse> => {
  // Map status filter: convert lowercase to uppercase for API (API expects "ACTIVE", "INACTIVE", etc.)
  const statusParam = filters.status && filters.status !== "all"
    ? filters.status.toUpperCase()
    : undefined;

  const params = sanitizeParams({
    status: statusParam,
    search: filters.search,
    page: filters.page,
    limit: filters.limit,
  });

  const response = await API.getAuthAPI<any>(
    END_POINT.AFFILIATE_LIST_WITH_STATS,
    true,
    params
  );

  if (response.error) {
    throw new Error(response.error);
  }

  const data = response.data || {};
  
  if (!data || typeof data !== 'object') {
    console.warn("No data received from affiliate list API");
    return { partners: [], pagination: { total: 0, page: filters.page ?? 1, limit: filters.limit ?? 10 } };
  }

  const dataObj = data as Record<string, unknown>;
  console.log("Affiliate List API Response.data:", dataObj);

  // Backend returns 'items' array
  const rawItems: unknown[] = Array.isArray(dataObj.items)
    ? dataObj.items as unknown[]
    : [];

  console.log("Raw affiliate items found:", rawItems.length);

  // Normalize partners from API response
  const partners: AffiliatePartner[] = rawItems.map((item: unknown) => {
    if (typeof item === "object" && item !== null) {
      const itemObj = item as Record<string, unknown>;
      
      // Map API response to our AffiliatePartner format
      const partner: AffiliatePartner = {
        _id: itemObj._id as string | undefined,
        name: (itemObj.name as string) || "",
        email: (itemObj.email as string) || "",
        phone: (itemObj.phone as string) || "",
        companyName: itemObj.companyName as string | undefined,
        company: itemObj.companyName as string | undefined, // Map companyName to company
        address: itemObj.address as string | undefined,
        city: itemObj.city as string | undefined,
        state: itemObj.state as string | undefined,
        pincode: itemObj.pincode as string | undefined,
        commissionPercentage: itemObj.commissionPercentage as number | undefined,
        commissionRate: itemObj.commissionPercentage as number | undefined, // Map commissionPercentage to commissionRate
        isActive: itemObj.isActive as boolean | undefined,
        // Map status: API returns "ACTIVE" in uppercase, convert to lowercase
        status: itemObj.status 
          ? (itemObj.status as string).toLowerCase() as "active" | "inactive" | "suspended"
          : itemObj.isActive 
          ? "active" 
          : "inactive",
        createdAt: itemObj.createdAt as string | undefined,
        updatedAt: itemObj.updatedAt as string | undefined,
        // Stats fields
        cardsActivated: itemObj.cardsActivated as number | undefined,
        totalCardsActivated: itemObj.cardsActivated as number | undefined, // Map for backward compatibility
        totalSalesAmount: itemObj.totalSalesAmount as number | undefined,
        totalSales: itemObj.totalSalesAmount as number | undefined, // Map for backward compatibility
        totalCommissionEarned: itemObj.totalCommissionEarned as number | undefined,
        totalRevenue: itemObj.totalSalesAmount as number | undefined, // Map totalSalesAmount to totalRevenue
        totalCost: itemObj.totalCost as number | undefined,
        totalOwnerCommission: itemObj.totalOwnerCommission as number | undefined,
      };
      
      return partner;
    }
    return item as AffiliatePartner;
  });

  console.log("Normalized partners count:", partners.length);

  // Pagination from API response
  const rootPagination = dataObj as { total?: number; page?: number; pages?: number };
  const page = rootPagination.page ?? filters.page ?? 1;
  const limit = filters.limit ?? 10;

  return {
    partners,
    pagination: {
      total: rootPagination.total ?? partners.length,
      page,
      pages: rootPagination.pages ?? Math.ceil((rootPagination.total ?? partners.length) / limit),
      limit,
    },
  };
};

export const getAffiliatePartnerById = async (
  partnerId: string
): Promise<AffiliatePartner> => {
  if (!partnerId) {
    throw new Error("Partner ID is required");
  }

  // Fetch from the list API - we'll get all and find the matching one
  // In a real scenario, there should be a GET /user/affiliate/:id endpoint
  const response = await API.getAuthAPI<any>(
    END_POINT.AFFILIATE_LIST_WITH_STATS,
    true,
    {}
  );

  if (response.error) {
    throw new Error(response.error);
  }

  const data = response.data || {};
  const dataObj = data as Record<string, unknown>;
  const rawItems: unknown[] = Array.isArray(dataObj.items)
    ? dataObj.items as unknown[]
    : [];

  // Find the partner with matching ID
  const rawPartner = rawItems.find((item: unknown) => {
    if (typeof item === "object" && item !== null) {
      const itemObj = item as Record<string, unknown>;
      return itemObj._id === partnerId;
    }
    return false;
  });

  if (!rawPartner || typeof rawPartner !== "object") {
    throw new Error("Partner not found");
  }

  const itemObj = rawPartner as Record<string, unknown>;

  // Map API response to our AffiliatePartner format
  const partner: AffiliatePartner = {
    _id: itemObj._id as string | undefined,
    name: (itemObj.name as string) || "",
    email: (itemObj.email as string) || "",
    phone: (itemObj.phone as string) || "",
    companyName: itemObj.companyName as string | undefined,
    company: itemObj.companyName as string | undefined,
    address: itemObj.address as string | undefined,
    city: itemObj.city as string | undefined,
    state: itemObj.state as string | undefined,
    pincode: itemObj.pincode as string | undefined,
    commissionPercentage: itemObj.commissionPercentage as number | undefined,
    commissionRate: itemObj.commissionPercentage as number | undefined,
    isActive: itemObj.isActive as boolean | undefined,
    status: itemObj.status
      ? (itemObj.status as string).toLowerCase() as "active" | "inactive" | "suspended"
      : itemObj.isActive
      ? "active"
      : "inactive",
    createdAt: itemObj.createdAt as string | undefined,
    updatedAt: itemObj.updatedAt as string | undefined,
    cardsActivated: itemObj.cardsActivated as number | undefined,
    totalCardsActivated: itemObj.cardsActivated as number | undefined,
    totalSalesAmount: itemObj.totalSalesAmount as number | undefined,
    totalSales: itemObj.totalSalesAmount as number | undefined,
    totalCommissionEarned: itemObj.totalCommissionEarned as number | undefined,
    totalRevenue: itemObj.totalSalesAmount as number | undefined,
    totalCost: itemObj.totalCost as number | undefined,
    totalOwnerCommission: itemObj.totalOwnerCommission as number | undefined,
  };

  return partner;
};

export const createAffiliatePartner = async (
  payload: Omit<AffiliatePartner, "_id" | "partnerId" | "createdAt" | "updatedAt">
): Promise<AffiliatePartner> => {
  if (!payload.name || !payload.email || !payload.phone || !payload.password) {
    throw new Error("Name, email, phone, and password are required");
  }

  // Map fields to API format
  const apiPayload: Record<string, unknown> = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    password: payload.password,
    role: "Affiliate",
    address: payload.address || "",
    city: payload.city || "",
    state: payload.state || "",
    pincode: payload.pincode || "",
    companyName: payload.company || payload.companyName || "",
    commissionPercentage: payload.commissionRate || payload.commissionPercentage || 0,
  };

  const response = await API.postAuthAPI<AffiliatePartner>(
    apiPayload,
    END_POINT.CREATE_AFFILIATE_USER,
    true
  );

  if (response.error) {
    throw new Error(response.error);
  }

  // Map API response back to our format
  const partner = response.data || ({} as AffiliatePartner);
  return {
    ...partner,
    company: partner.companyName || partner.company,
    commissionRate: partner.commissionPercentage || partner.commissionRate,
    status: partner.isActive ? "active" : "inactive",
  };
};

export const updateAffiliatePartner = async (
  partnerId: string,
  payload: Partial<AffiliatePartner>
): Promise<AffiliatePartner> => {
  if (!partnerId) {
    throw new Error("Partner ID is required");
  }

  // Map fields to API format (matching the API request format)
  const apiPayload: Record<string, unknown> = {};
  
  if (payload.name) apiPayload.name = payload.name;
  if (payload.email) apiPayload.email = payload.email;
  if (payload.phone) apiPayload.phone = payload.phone;
  // Only include password if it's provided (not empty)
  if (payload.password && payload.password.trim() !== "") {
    apiPayload.password = payload.password;
  }
  if (payload.address !== undefined) apiPayload.address = payload.address || "";
  if (payload.city !== undefined) apiPayload.city = payload.city || "";
  if (payload.state !== undefined) apiPayload.state = payload.state || "";
  if (payload.pincode !== undefined) apiPayload.pincode = payload.pincode || "";
  if (payload.company !== undefined || payload.companyName !== undefined) {
    apiPayload.companyName = payload.company || payload.companyName || "";
  }
  if (payload.commissionRate !== undefined || payload.commissionPercentage !== undefined) {
    apiPayload.commissionPercentage = payload.commissionRate || payload.commissionPercentage || 0;
  }
  
  // Note: status field is not included in the API payload as per the API example
  // The API doesn't accept status in the update request

  const response = await API.updateAuthAPI<AffiliatePartner>(
    apiPayload,
    partnerId,
    END_POINT.UPDATE_AFFILIATE_USER,
    true
  );

  if (response.error) {
    throw new Error(response.error);
  }

  // Map API response back to our format
  const partner = response.data || ({} as AffiliatePartner);
  return {
    ...partner,
    company: partner.companyName || partner.company,
    commissionRate: partner.commissionPercentage || partner.commissionRate,
    status: partner.isActive ? "active" : "inactive",
  };
};

export const deleteAffiliatePartner = async (
  partnerId: string
): Promise<void> => {
  if (!partnerId) {
    throw new Error("Partner ID is required");
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = mockPartners.findIndex(
    (p) => p._id === partnerId || p.partnerId === partnerId
  );

  if (index === -1) {
    throw new Error("Partner not found");
  }

  mockPartners.splice(index, 1);
};

export const getAffiliatePartnerStats = async (
  partnerId?: string,
  filters?: { startDate?: string; endDate?: string }
): Promise<AffiliatePartnerStats> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  let partner: AffiliatePartner | undefined;
  if (partnerId) {
    partner = mockPartners.find(
      (p) => p._id === partnerId || p.partnerId === partnerId
    );
  }

  // Mock monthly stats
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyStats = months.map((month, index) => ({
    month,
    cardsActivated: partner
      ? Math.floor((partner.totalCardsActivated ?? 0) / 12) + Math.floor(Math.random() * 20)
      : Math.floor(Math.random() * 50) + 10,
    sales: partner
      ? Math.floor((partner.totalSales ?? 0) / 12) + Math.floor(Math.random() * 15)
      : Math.floor(Math.random() * 40) + 8,
    revenue: partner
      ? Math.floor((partner.totalRevenue ?? 0) / 12) + Math.floor(Math.random() * 20000)
      : Math.floor(Math.random() * 50000) + 10000,
  }));

  // Mock recent activations
  const recentActivations = Array.from({ length: 10 }, (_, i) => ({
    partnerName: partner?.name || "Partner",
    shortCode: `tag${String(i + 1).padStart(6, "0")}`,
    activatedAt: new Date(Date.now() - i * 86400000).toISOString(),
    revenue: Math.floor(Math.random() * 5000) + 1000,
  }));

  if (partnerId && partner) {
    // Individual partner stats
    return {
      totalPartners: 1,
      activePartners: partner.status === "active" ? 1 : 0,
      totalCardsActivated: partner.totalCardsActivated ?? 0,
      totalSales: partner.totalSales ?? 0,
      totalRevenue: partner.totalRevenue ?? 0,
      recentActivations,
      monthlyStats,
    };
  }

  // Overall stats (all partners)
  const totalCards = mockPartners.reduce((sum, p) => sum + (p.totalCardsActivated ?? 0), 0);
  const totalSales = mockPartners.reduce((sum, p) => sum + (p.totalSales ?? 0), 0);
  const totalRevenue = mockPartners.reduce((sum, p) => sum + (p.totalRevenue ?? 0), 0);
  const activePartners = mockPartners.filter((p) => p.status === "active").length;

  return {
    totalPartners: mockPartners.length,
    activePartners,
    totalCardsActivated: totalCards,
    totalSales,
    totalRevenue,
    recentActivations,
    monthlyStats,
  };
};

export const getPartnerAssignedTags = async (
  partnerId: string,
  filters: TagListFilters = {}
): Promise<TagListResponse> => {
  if (!partnerId) {
    throw new Error("Partner ID is required");
  }

  const params = sanitizeParams({
    status: filters.status && filters.status !== "all" ? filters.status : undefined,
    search: filters.search,
    page: filters.page,
    limit: filters.limit,
    batchName: filters.batchName,
  });

  const response = await API.getAuthAPI<any>(
    `${END_POINT.AFFILIATE_ASSIGNED_TAGS}/${partnerId}`,
    true,
    params
  );

  if (response.error) {
    throw new Error(response.error);
  }

  const data = response.data || {};
  const items: unknown[] = Array.isArray((data as { items?: unknown[] }).items)
    ? ((data as { items?: unknown[] }).items as unknown[])
    : [];

  const tags: TagItem[] = items.map((item) => {
    if (typeof item !== "object" || item === null) {
      return item as TagItem;
    }
    const itemObj = item as Record<string, unknown>;
    const ownerAssigned = itemObj.ownerAssignedTo as Record<string, unknown> | undefined;
    const ownerAssignedDetails = ownerAssigned
      ? {
          id:
            (ownerAssigned["_id"] as string | undefined) ??
            (ownerAssigned["id"] as string | undefined),
          fullName: ownerAssigned["fullName"] as string | undefined,
          phone: ownerAssigned["phone"] as string | undefined,
          email: ownerAssigned["email"] as string | undefined,
          city: ownerAssigned["city"] as string | undefined,
          vehicle: ownerAssigned["vehicle"] as TagAssignmentVehicle | undefined,
          createdAt: ownerAssigned["createdAt"] as string | undefined,
          updatedAt: ownerAssigned["updatedAt"] as string | undefined,
        }
      : undefined;

    return {
      _id: (itemObj._id as string | undefined) ?? (itemObj.tagId as string | undefined),
      tagId: (itemObj.tagId as string | undefined) ?? (itemObj._id as string | undefined),
      shortCode: itemObj.shortCode as string,
      shortUrl: itemObj.shortUrl as string | undefined,
      qrUrl: itemObj.qrUrl as string | undefined,
      status: ((itemObj.status as string | undefined) ?? "generated") as TagStatus,
      batchName: itemObj.batchName as string | undefined,
      assignedTo: itemObj.assignedTo,
      ownerAssignedTo: ownerAssignedDetails,
      createdAt: itemObj.createdAt as string | undefined,
      updatedAt: itemObj.updatedAt as string | undefined,
      activatedAt: itemObj.activatedAt as string | undefined,
    };
  });

  const total = (data as { total?: number }).total ?? tags.length;
  const page = (data as { page?: number }).page ?? filters.page ?? 1;
  const limit = (data as { limit?: number }).limit ?? filters.limit ?? 10;
  const pages =
    (data as { pages?: number }).pages ??
    (total > 0 ? Math.ceil(total / limit) : 1);

  return {
    tags,
    pagination: {
      total,
      page,
      pages,
      limit,
    },
  };
};

