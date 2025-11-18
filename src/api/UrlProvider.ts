// export const TEST_URL = "http://13.49.49.9:3000/api";
// export const LIVE_URL = "http://13.49.49.9:3000/api";
// export const TEST_URL = "http://localhost:9000/api";
// export const LIVE_URL = "http://localhost:9000/api";

import { EndPointType } from "../types/UrlProvider";

// UrlProvider.ts
declare global {
  interface ImportMetaEnv {
    VITE_API_URL: string;
    VITE_ADMIN_API_KEY?: string;
  }
}
const env = import.meta.env;

export const BASE_URL: string = env.VITE_API_URL;
export const ADMIN_API_KEY: string = env.VITE_ADMIN_API_KEY || "";

export const END_POINT: EndPointType = {
  AUTH_SIGNIN: "auth/login",
  AUTH_REFRESH: "refresh",
  LOGIN: "auth/login",
  SIGNUP: "register",
  USER_REGISTER: "register/users-register",
  PRODUCT_SERVICE: "product-service",
  LEAD_SOURCES: "lead-sources",
  LEAD_STATUS: "lead-status",
  LOST_REASON: "lost-reason",
  FACEBOOK_PAGE: "facebook-page",
  GENERAL_DATA: "lead-types",
  EMPLOYEE_REPORT: "call-report",
  LEADS_DATA: "lead",
  LEADS_FOLLOWUP_DATA: "lead/follow-up",
  CALL_LIST: "getCallList",
  PRODUCT_SALE_REPORT: "product-sale-report",
  CALENDAR: "calendar",
  GET_CURL: "getCurlApi",
  BULK_UPDATE: "bulkUpdate",
  BULK_DELETE: "bulkDelete",
  USERS: "user",
  GET_ROLE_WISE_USER_LIST: "user/get-role-wise-user-list",
  CREATE_ADMIN: "user/create-admin",
  UPDATE_NOTIFICATION: "updateNotification",
  Funnel: "survey",
  Crefunel: "survey",
  SubscrPlane: "v1/subscription",
  Faq: "faq",
  PolicyQ: "policy",
  PolicyA: "policy/all",
  Policyf: "policy",
  planget: "subscription",
  Notifi: "notification",
  Notifiborad: "notification/broadcast",
  UserapiAl: "users/user",
  Userme: "v1/users/me",
  UPDATE_USER: "user/update-profile",
  Userapi: "users",
  UserapiA: "users/admin",
  UserapiS: "users/support",
  Rsetpas: "users/set-password",
  Videoapi: "admin-content",
  Tages: "tag",
  Setintags: "tag-setting",
  UserPost: "user-post",
  Permission: "permission",
  feature: "feature",
  GET_BOOKING_DETAILS: 'get-booking-details',
  UPDATE_BOOKING: 'update-booking',
  GET_USER_TREE: "get-user-tree",
  // LMS Endpoints (v1)
  COURSES: "courses",
  STUDENTS: "students",
  INSTRUCTORS: "instructors",
  ENROLLMENTS: "enrollments",
  DASHBOARD_METRICS: "dashboard/metrics",
  TAGS: "tags",
  TAG_GROUPS: "tag-groups",
  TOPICS: "topics",
  VIDEOS: "videos",
  EBOOKS: "ebooks",
  ROLES: "roles",
  JOBS: "jobs",
  SHORTS: "shorts",
  // TapTag Admin Endpoints
  ADMIN_DASHBOARD_SUMMARY: "admin/dashboard/summary",
  ADMIN_TAGS: "admin/tags",
  QR_GENERATE_BULK: "qr/generate-bulk",
  // Tag Activation Endpoints
  ACTIVATE_TAG_REQUEST_OTP: "activate-tag/request-otp",
  ACTIVATE_TAG_CONFIRM: "activate-tag/confirm",
  // Affiliate Partner Endpoints
  AFFILIATE_PARTNERS: "affiliate-partners",
  AFFILIATE_PARTNER_STATS: "affiliate-partners/stats",
  AFFILIATE_LIST_WITH_STATS: "user/affiliate-list-with-stats",
  CREATE_AFFILIATE_USER: "user/create-affiliate-user",
  UPDATE_AFFILIATE_USER: "user/affiliate",
  // User List Endpoints
  USER_LIST_ADMIN_SUPPORT_AFFILIATE: "user/list-of-admin-support-admin-super-admin-affiliate-list",
  AFFILIATE_ASSIGNED_TAGS: "user/tag-assign-to-affiliate",
  // Tag Sale Endpoints
  QR_SALE_LIST: "qr/saleList",
  QR_SALE_CREATE: "qr/saleCreate",
  QR_TAG_VERIFY: "qr/tagVarify",
  QR_SALE_DETAIL: "qr/saleDetail",
  QR_SALE_UPDATE: "qr/saleUpdate",
  QR_SALE_DELETE: "qr/saleDelete",
  // Wallet Endpoints
  WALLET_ME: "v1/wallet/me",
  WALLET_WITHDRAW: "v1/wallet/withdraw",
  WALLET_USER: "v1/wallet",
  WALLET_TRANSACTION: "v1/wallet/transaction",
  WALLET_MANUAL_CREDIT: "v1/wallet/manual-credit",
} as const;
