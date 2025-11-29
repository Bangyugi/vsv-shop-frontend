// src/types/order.ts
// --- THAY ĐỔI: Import từ index.ts và auth.ts ---
import type { ApiResponse } from "./index";
import type { UserData } from "./auth";
// --- KẾT THÚC THAY ĐỔI ---

// Basic Address structure from API
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

// Basic Product Variant structure from API
interface ApiVariant {
  id: number;
  sku: string;
  color: string;
  size: string;
  quantity: number; // Available quantity, not quantity in order
}

// Basic Product structure from API (simplified)
interface ApiProduct {
  id: number;
  title: string;
  images: string[];
  // Add other relevant product fields if necessary
}

// Structure for Order Items from API
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
  isReviewed?: boolean; // <-- THÊM TRƯỜNG NÀY (Giả định backend trả về)
}

// Backend Order Status Mapping
export type ApiOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "CONFIRMED"; // Add other statuses from backend

// Structure for Order Data from API
export interface ApiOrderData {
  id: number; // Internal DB ID
  orderId: string; // The user-facing Order ID (UUID)
  user: UserData;
  shippingAddress: ApiAddress;
  totalPrice: number; // This seems to be the final total price
  orderStatus: ApiOrderStatus;
  totalItem: number;
  orderDate: string; // ISO Date string
  deliverDate: string | null; // ISO Date string or null
  orderItems: ApiOrderItem[];
}

// Response type for the getMyOrders API call
export type GetMyOrdersResponse = ApiResponse<ApiOrderData[]>;

/**
 * Request body cho việc tạo đơn hàng mới (Checkout)
 */
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

/**
 * Dữ liệu trả về khi tạo link thanh toán VNPAY
 */
export interface ApiPaymentLinkData {
  paymentUrl: string;
}

/**
 * Dữ liệu trả về khi hủy đơn hàng
 */
export type CancelOrderResponse = ApiResponse<ApiOrderData>;

/**
 * Dữ liệu trả về cho API lấy danh sách order (phân trang)
 * (Tương tự ProductPageData và SellerPageData)
 */
export interface OrderPageData {
  pageContent: ApiOrderData[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export type GetAdminOrdersResponse = ApiResponse<OrderPageData>;
