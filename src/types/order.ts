import type { ApiResponse } from "./index";
import type { UserData } from "./auth";

interface ApiAddress {
  id: number;
  address: string;
  ward?: string;
  district: string;
  province: string;
  country: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  isDefault?: boolean;
  note?: string | null;
}

interface ApiVariant {
  id: number;
  sku: string;
  color: string;
  size: string;
  quantity: number;
}

interface ApiProduct {
  id: number;
  title: string;
  images: string[];
}

export interface ApiOrderItem {
  id: number;
  product: ApiProduct;
  variant: ApiVariant;
  productTitle: string;
  variantSku: string;
  color: string;
  size: string;
  imageUrl: string | null;
  quantity: number;
  priceAtPurchase: number;
  sellingPriceAtPurchase: number;
  isReviewed?: boolean;
}

export type ApiOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "CONFIRMED";

export interface ApiOrderData {
  id: number;
  orderId: string;
  user: UserData;
  shippingAddress: ApiAddress;
  totalPrice: number;
  orderStatus: ApiOrderStatus;
  totalItem: number;
  orderDate: string;
  deliverDate: string | null;
  orderItems: ApiOrderItem[];
}

export interface OrderPageData {
  pageContent: ApiOrderData[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// Updated: Response is now a paginated object
export type GetMyOrdersResponse = ApiResponse<OrderPageData>;

export interface CreateOrderRequest {
  addressId?: number;
  shippingAddress?: {
    fullName: string;
    phoneNumber: string;
    email: string;
    address: string;
    district: string;
    province: string;
    country: string;
    note?: string | null;
  };
}

export interface ApiPaymentLinkData {
  paymentUrl: string;
}

export type CancelOrderResponse = ApiResponse<ApiOrderData>;

export type GetAdminOrdersResponse = ApiResponse<OrderPageData>;

// Added: Query parameters for order list
export interface OrderQueryParams {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
  // Optional: status parameter if backend supports it in the future
  status?: string; 
}