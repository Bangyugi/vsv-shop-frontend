// src/services/orderService.ts
import api from "../api/axios";
import type {
  GetMyOrdersResponse,
  ApiOrderData, // <-- Thêm
  CreateOrderRequest, // <-- Thêm
  CancelOrderResponse, // <-- Thêm
} from "../types/order";
import type { ApiResponse } from "../types"; // <-- Thêm

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Fetches the orders for the currently logged-in user.
 * Endpoint: GET /api/orders/my-orders
 */
export const getMyOrders = (): Promise<GetMyOrdersResponse> => {
  return api
    .get<GetMyOrdersResponse>(`${BASE_URL}/api/orders/my-orders`)
    .then((res) => res.data);
};

/**
 * Creates a new order(s) from the user's cart.
 * Endpoint: POST /api/orders
 */
export const createOrder = (
  data: CreateOrderRequest
): Promise<ApiResponse<ApiOrderData[]>> => {
  return api
    .post<ApiResponse<ApiOrderData[]>>(`${BASE_URL}/api/orders`, data)
    .then((res) => res.data);
};

/**
 * Fetches a single order by its UUID.
 * Endpoint: GET /api/orders/uuid/{orderUuid}
 */
export const getOrderByUuid = (
  orderUuid: string
): Promise<ApiResponse<ApiOrderData>> => {
  // --- THAY ĐỔI: Khôi phục lại endpoint "/uuid/" theo yêu cầu ---
  return api
    .get<ApiResponse<ApiOrderData>>(`${BASE_URL}/api/orders/uuid/${orderUuid}`)
    .then((res) => res.data);
};

/**
 * Cancels an order by its UUID.
 * Endpoint: PATCH /api/orders/{orderId}/cancel
 */
export const cancelOrder = (
  orderUuid: string
): Promise<CancelOrderResponse> => {
  return api
    .patch<CancelOrderResponse>(
      `${BASE_URL}/api/orders/uuid/${orderUuid}/cancel`
    )
    .then((res) => res.data);
};
