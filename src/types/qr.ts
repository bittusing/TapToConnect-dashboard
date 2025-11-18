export type TagStatus =
  | "generated"
  | "assigned"
  | "activated"
  | "archived";

export interface TagOwnerDetails {
  id?: string;
  fullName?: string;
  email?: string;
  role?: string;
  phone?: string;
  city?: string;
  preferences?: TagAssignmentPreferences;
  vehicle?: TagAssignmentVehicle;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagAssignmentPreferences {
  sms?: boolean;
  whatsapp?: boolean;
  call?: boolean;
}

export interface TagAssignmentVehicle {
  number?: string;
  type?: string;
}

export interface TagAssignmentDetails {
  id?: string;
  fullName?: string;
  email?: string;
  role?: string;
  phone?: string;
  city?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagItem {
  _id?: string;
  tagId?: string;
  shortCode: string;
  shortUrl?: string;
  qrUrl?: string;
  stickerUrl?: string;
  status: TagStatus;
  batchName?: string;
  metadata?: Record<string, unknown>;
  owner?: TagOwnerDetails;
  assignedTo?: TagAssignmentDetails | any; // Can be affiliate user object
  ownerAssignedTo?: TagOwnerDetails; // Vehicle owner details
  createdAt?: string;
  updatedAt?: string;
  activatedAt?: string;
}

export interface TagVerifyResult {
  _id: string;
  shortCode: string;
  shortUrl?: string;
  qrUrl?: string;
  stickerUrl?: string;
  status?: TagStatus;
  batchName?: string;
  assignedTo?: string;
  ownerId?: string;
  ownerFullName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  vehicleNumber?: string;
  vehicleType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagListPagination {
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
}

export interface TagListResponse {
  tags: TagItem[];
  pagination?: TagListPagination;
}

export interface TagListFilters {
  status?: TagStatus | "all";
  batchName?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UserListItem {
  _id: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role: string;
}

export interface UserListResponse {
  users: UserListItem[];
}

export interface GenerateBulkRequest {
  count: number;
  batchName?: string;
  metadata?: Record<string, unknown>;
  assignedTo?: string;
  qrConfig?: {
    margin?: number;
    scale?: number;
    darkColor?: string;
    lightColor?: string;
  };
}

export interface GenerateBulkResponse {
  tags: TagItem[];
  batchName?: string;
  createdAt?: string;
  totalGenerated?: number;
}

export interface UpdateTagStatusRequest {
  status: TagStatus;
}

export interface DashboardTagTotals {
  total?: number;
  generated?: number;
  assigned?: number;
  activated?: number;
  archived?: number;
}

export interface DashboardMessageTotals {
  total?: number;
  unread?: number;
  last24h?: number;
}

export interface DashboardActivationTotals {
  total?: number;
  pending?: number;
  completed?: number;
}

export interface DashboardUserTotals {
  total?: number;
  admins?: number;
  owners?: number;
}

export interface DashboardSalesTotals {
  totalSales?: number;
  totalRevenue?: number;
  averageOrderValue?: number;
  revenueToday?: number;
  revenueYesterday?: number;
  salesYesterday?: number;
  pendingPayments?: number;
  onlineSales?: number;
  offlineSales?: number;
  affiliateSales?: number;
}

export interface DashboardTagHealth {
  generatedToday?: number;
  assignedToday?: number;
  activatedToday?: number;
  pendingActivation?: number;
}

export interface DashboardSalesChannel {
  label: string;
  value: number;
  amount?: number;
}

export interface DashboardTrendPoint {
  label: string;
  tagsGenerated?: number;
  tagsActivated?: number;
  messagesReceived?: number;
}

export interface DashboardActivityItem {
  shortCode?: string;
  title?: string;
  description?: string;
  occurredAt?: string;
  status?: string;
}

export interface DashboardAffiliateLeader {
  partnerId: string;
  name: string;
  avatar?: string;
  totalTags?: number;
  activatedTags?: number;
  salesAmount?: number;
  commissionAmount?: number;
  conversionRate?: number;
}

export interface DashboardSaleRecord {
  saleId?: string;
  shortCode?: string;
  buyerName?: string;
  affiliateName?: string;
  saleType?: SaleType;
  amount?: number;
  status?: PaymentStatus;
  date?: string;
}

export interface AdminDashboardSummary {
  totals?: {
    tags?: DashboardTagTotals;
    messages?: DashboardMessageTotals;
    activations?: DashboardActivationTotals;
    users?: DashboardUserTotals;
    sales?: DashboardSalesTotals;
  };
  trends?: DashboardTrendPoint[];
  recentActivations?: DashboardActivityItem[];
  tagHealth?: DashboardTagHealth;
  salesChannels?: DashboardSalesChannel[];
  affiliateLeaders?: DashboardAffiliateLeader[];
  recentSales?: DashboardSaleRecord[];
}

// Tag Activation Types
export interface RequestOtpRequest {
  shortCode: string;
  phone: string;
}

export interface RequestOtpResponse {
  message?: string;
  expiresAt?: string;
  otp?: string;
  tagId?: string;
  shortCode?: string;
}

export interface ConfirmActivationRequest {
  shortCode: string;
  otp: string;
  fullName: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  email?: string;
  city?: string;
  preferences?: TagAssignmentPreferences;
}

export interface ConfirmActivationResponse {
  message?: string;
  tagId?: string;
  shortCode?: string;
  shortUrl?: string;
  assignedTo?: {
    fullName?: string;
    phone?: string;
    vehicle?: TagAssignmentVehicle;
  };
}

// Affiliate Partner Types
export interface AffiliatePartner {
  _id?: string;
  partnerId?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  companyName?: string; // API uses companyName
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  commissionRate?: number;
  commissionPercentage?: number; // API uses commissionPercentage
  status?: "active" | "inactive" | "suspended";
  isActive?: boolean;
  role?: string;
  password?: string; // For create/update
  createdAt?: string;
  updatedAt?: string;
  totalCardsActivated?: number;
  totalSales?: number;
  totalRevenue?: number;
  // Stats from API
  cardsActivated?: number;
  totalSalesAmount?: number;
  totalCommissionEarned?: number;
  totalCost?: number;
  totalOwnerCommission?: number;
}

export interface AffiliatePartnerListResponse {
  partners: AffiliatePartner[];
  pagination?: TagListPagination;
}

export interface AffiliatePartnerFilters {
  status?: "active" | "inactive" | "suspended" | "all";
  search?: string;
  page?: number;
  limit?: number;
}

export interface AffiliatePartnerStats {
  totalPartners?: number;
  activePartners?: number;
  totalCardsActivated?: number;
  totalSales?: number;
  totalRevenue?: number;
  recentActivations?: Array<{
    partnerName?: string;
    shortCode?: string;
    activatedAt?: string;
    revenue?: number;
  }>;
  monthlyStats?: Array<{
    month?: string;
    cardsActivated?: number;
    sales?: number;
    revenue?: number;
  }>;
}

// Tag Sale Types
export type SaleType = "online" | "offline" | "not-confirmed";
export type SalesPersonRole = "Affiliate" | "Support Admin" | "Admin" | "Super Admin";
export type PaymentStatus = "pending" | "completed" | "cancelled";
export type VerificationStatus = "pending" | "completed" | "cancelled";

export interface TagSaleMessage {
  message?: string;
}

export interface TagSale {
  _id?: string;
  tag?: string | { _id: string; shortCode?: string; shortUrl?: string };
  SalesPerson?: string | { _id: string; name?: string; email?: string; phone?: string };
  owner?: string | { _id: string; fullName?: string; phone?: string; email?: string };
  saleDate?: string;
  saleType?: SaleType;
  salesPersonRole?: SalesPersonRole;
  totalSaleAmount?: number;
  commisionAmountOfSalesPerson?: number;
  commisionAmountOfOwner?: number;
  castAmountOfProductAndServices?: number;
  paymentStatus?: PaymentStatus;
  varificationStatus?: VerificationStatus;
  message?: TagSaleMessage[];
  paymentImageOrScreenShot?: string;
  createdBy?: string | { _id: string; name?: string };
  updatedBy?: string | { _id: string; name?: string };
  deletedBy?: string | { _id: string; name?: string };
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface TagSaleListResponse {
  sales: TagSale[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

export interface TagSaleFilters {
  saleType?: SaleType | "all";
  paymentStatus?: PaymentStatus | "all";
  varificationStatus?: VerificationStatus | "all";
  salesPersonRole?: SalesPersonRole | "all";
  affiliatePartnerId?: string | "all";
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

// Wallet System Types
export type WalletTransactionType = "credit" | "debit";
export type WalletTransactionStatus = "pending" | "completed" | "cancelled";

export interface WalletTransaction {
  _id?: string;
  user?: string | { _id: string; name?: string; email?: string };
  sale?: string | { _id: string; shortCode?: string };
  type: WalletTransactionType;
  amount: number;
  status: WalletTransactionStatus;
  description?: string;
  notes?: string;
  balanceSnapshot?: number;
  meta?: Record<string, unknown>;
  createdBy?: string | { _id: string; name?: string };
  approvedBy?: string | { _id: string; name?: string };
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletCompletedSales {
  totalCommission?: number;
  totalSalesAmount?: number;
  totalCost?: number;
  totalOwnerCommission?: number;
  cardsActivated?: number;
}

export interface WalletPendingSales {
  pendingCommission?: number;
  pendingSalesAmount?: number;
  pendingCards?: number;
}

export interface WalletSummary {
  completedSales?: WalletCompletedSales;
  pendingSales?: WalletPendingSales;
  totalWithdrawn?: number;
  pendingWithdrawals?: number;
  availableBalance?: number;
}

export interface WalletResponse {
  summary?: WalletSummary;
  transactions?: WalletTransaction[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

export interface WithdrawRequest {
  amount: number;
  notes?: string;
}

export interface ManualCreditRequest {
  userId: string;
  amount: number;
  description?: string;
  notes?: string;
  saleId?: string;
}

export interface UpdateTransactionRequest {
  status: WalletTransactionStatus;
  notes?: string;
}


