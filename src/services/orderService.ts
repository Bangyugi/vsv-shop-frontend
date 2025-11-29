import api from "../api/axios";
import type {
  GetMyOrdersResponse,
  ApiOrderData,
  CreateOrderRequest,
  CancelOrderResponse,
} from "../types/order";
import type { ApiResponse } from "../types"; // <-- Thêm

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getMyOrders = (): Promise<GetMyOrdersResponse> => {
  return api
    .get<GetMyOrdersResponse>(`${BASE_URL}/api/orders/my-orders`)
    .then((res) => res.data);
};

export const createOrder = (
  data: CreateOrderRequest
): Promise<ApiResponse<ApiOrderData[]>> => {
  return api
    .post<ApiResponse<ApiOrderData[]>>(`${BASE_URL}/api/orders`, data)
    .then((res) => res.data);
};

export const getOrderByUuid = (
  orderUuid: string
): Promise<ApiResponse<ApiOrderData>> => {
  return api
    .get<ApiResponse<ApiOrderData>>(`${BASE_URL}/api/orders/uuid/${orderUuid}`)
    .then((res) => res.data);
};

export const cancelOrder = (
  orderUuid: string
): Promise<CancelOrderResponse> => {
  return api
    .patch<CancelOrderResponse>(
      `${BASE_URL}/api/orders/uuid/${orderUuid}/cancel`
    )
    .then((res) => res.data);
};
