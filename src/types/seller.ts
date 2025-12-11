import type { UserData } from "./auth";
import type { ApiResponse } from "./index";
import type { ApiAddress, AddAddressRequest } from "./address";

export type SellerStatus =
  | "ACTIVE"
  | "PENDING_VERIFICATION"
  | "BANNED"
  | "DEACTIVATED"
  | "CLOSED"
  | "REJECTED";

export interface SellerBusinessDetails {
  businessName: string;
  businessEmail: string;
  businessMobile: string;
  businessAddress: string;
  logo: string | null;
  banner: string | null;
}

export interface SellerBankDetails {
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
}

export interface ApiSellerData {
  user: UserData;
  avatar: string | null;
  businessDetails: SellerBusinessDetails;
  bankDetails: SellerBankDetails;
  pickupAddress: ApiAddress;
  gstin: string;
  isEmailVerified: boolean;
  accountStatus: SellerStatus;
}

export interface SellerPageData {
  pageContent: ApiSellerData[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export type GetSellersResponse = ApiResponse<SellerPageData>;

export interface UpdateSellerStatusRequest {
  status: SellerStatus;
  reason?: string;
}

export type UpdateSellerStatusResponse = ApiResponse<ApiSellerData>;

export interface SellerBusinessDetailsRequest {
  businessName: string;
  businessEmail: string;
  businessMobile: string;
  businessAddress: string;
  logo: string;
  banner: string;
}

export interface SellerBankDetailsRequest {
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
}

export interface SellerRegistrationRequest {
  businessDetails: SellerBusinessDetailsRequest;
  bankDetails: SellerBankDetailsRequest;
  pickupAddress: AddAddressRequest;
  gstin: string;
}

export type SellerRegistrationResponse = ApiResponse<ApiSellerData>;

// --- New Types for Seller Dashboard API ---

export interface RevenueAnalyticsItem {
  month: string;
  revenue: number;
}

export interface SellerDashboardData {
  totalRevenue: number;
  newOrders: number;
  productsInStock: number;
  pendingOrders: number;
  revenueAnalytics: RevenueAnalyticsItem[];
}

export type GetSellerDashboardResponse = ApiResponse<SellerDashboardData>;