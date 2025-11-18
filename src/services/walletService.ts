import { API } from "../api";
import { END_POINT } from "../api/UrlProvider";
import {
  WalletResponse,
  WalletTransaction,
  WalletSummary,
  WithdrawRequest,
  ManualCreditRequest,
  UpdateTransactionRequest,
} from "../types/qr";

const normalizeTransaction = (itemObj: Record<string, unknown>): WalletTransaction => ({
  _id: itemObj._id as string | undefined,
  user: itemObj.user as WalletTransaction["user"],
  sale: itemObj.sale as WalletTransaction["sale"],
  type: itemObj.type as WalletTransaction["type"],
  amount: itemObj.amount as number,
  status: itemObj.status as WalletTransaction["status"],
  description: itemObj.description as string | undefined,
  notes: itemObj.notes as string | undefined,
  balanceSnapshot: itemObj.balanceSnapshot as number | undefined,
  meta: itemObj.meta as Record<string, unknown> | undefined,
  createdBy: itemObj.createdBy as WalletTransaction["createdBy"],
  approvedBy: itemObj.approvedBy as WalletTransaction["approvedBy"],
  approvedAt: itemObj.approvedAt as string | undefined,
  createdAt: itemObj.createdAt as string | undefined,
  updatedAt: itemObj.updatedAt as string | undefined,
});

const normalizeWalletResponse = (data: Record<string, unknown>): WalletResponse => {
  const summary = data.summary as Record<string, unknown> | undefined;
  const transactions = Array.isArray(data.transactions)
    ? (data.transactions as unknown[]).map((t) =>
        normalizeTransaction(t as Record<string, unknown>)
      )
    : [];
  const pagination = data.pagination as WalletResponse["pagination"];

  return {
    summary: summary ? (summary as WalletSummary) : undefined,
    transactions,
    pagination,
  };
};

/**
 * Get current user's wallet details
 */
export const getMyWallet = async (
  page: number = 1,
  limit: number = 20
): Promise<WalletResponse> => {
  const params = { page, limit };

  const response = await API.getAuthAPI<{ data?: Record<string, unknown> } | Record<string, unknown>>(
    END_POINT.WALLET_ME,
    true,
    params
  );

  if (response.error) {
    throw new Error(response.error);
  }

  const rawData =
    (response.data as { data?: Record<string, unknown> })?.data ||
    (response.data as Record<string, unknown>);

  if (!rawData || typeof rawData !== "object") {
    throw new Error("Invalid wallet response");
  }

  return normalizeWalletResponse(rawData);
};

/**
 * Request withdrawal
 */
export const requestWithdrawal = async (
  request: WithdrawRequest
): Promise<WalletTransaction> => {
  if (!request.amount || request.amount <= 0) {
    throw new Error("Withdrawal amount must be greater than zero");
  }

  const response = await API.postAuthAPI<
    { data?: Record<string, unknown> } | Record<string, unknown>
  >(END_POINT.WALLET_WITHDRAW, request);

  if (response.error) {
    throw new Error(response.error || "Failed to request withdrawal");
  }

  const rawData =
    (response.data as { data?: Record<string, unknown> })?.data ||
    (response.data as Record<string, unknown>);

  if (!rawData || typeof rawData !== "object") {
    throw new Error("Invalid withdrawal response");
  }

  return normalizeTransaction(rawData);
};

/**
 * Get user wallet (Admin only)
 */
export const getUserWallet = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<WalletResponse> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const params = { page, limit };

  const response = await API.getAuthAPI<{ data?: Record<string, unknown> } | Record<string, unknown>>(
    `${END_POINT.WALLET_USER}/${userId}`,
    true,
    params
  );

  if (response.error) {
    throw new Error(response.error);
  }

  const rawData =
    (response.data as { data?: Record<string, unknown> })?.data ||
    (response.data as Record<string, unknown>);

  if (!rawData || typeof rawData !== "object") {
    throw new Error("Invalid wallet response");
  }

  return normalizeWalletResponse(rawData);
};

/**
 * Update transaction status (Admin only)
 */
export const updateTransactionStatus = async (
  transactionId: string,
  request: UpdateTransactionRequest
): Promise<WalletTransaction> => {
  if (!transactionId) {
    throw new Error("Transaction ID is required");
  }

  const response = await API.patchAuthAPI<
    { data?: Record<string, unknown> } | Record<string, unknown>
  >(request, `${END_POINT.WALLET_TRANSACTION}/${transactionId}`, true);

  if (response.error) {
    throw new Error(response.error || "Failed to update transaction");
  }

  const rawData =
    (response.data as { data?: Record<string, unknown> })?.data ||
    (response.data as Record<string, unknown>);

  if (!rawData || typeof rawData !== "object") {
    throw new Error("Invalid transaction response");
  }

  return normalizeTransaction(rawData);
};

/**
 * Create manual credit (Admin only)
 */
export const createManualCredit = async (
  request: ManualCreditRequest
): Promise<WalletTransaction> => {
  if (!request.userId) {
    throw new Error("User ID is required");
  }
  if (!request.amount || request.amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const response = await API.postAuthAPI<
    { data?: Record<string, unknown> } | Record<string, unknown>
  >(END_POINT.WALLET_MANUAL_CREDIT, request);

  if (response.error) {
    throw new Error(response.error || "Failed to create manual credit");
  }

  const rawData =
    (response.data as { data?: Record<string, unknown> })?.data ||
    (response.data as Record<string, unknown>);

  if (!rawData || typeof rawData !== "object") {
    throw new Error("Invalid credit response");
  }

  return normalizeTransaction(rawData);
};

