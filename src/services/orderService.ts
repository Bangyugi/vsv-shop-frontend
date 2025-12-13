import api from "../api/axios";
import type {
  GetMyOrdersResponse,
  ApiOrderData,
  CreateOrderRequest,
  CancelOrderResponse,
  OrderQueryParams,
} from "../types/order";
import type { ApiResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getMyOrders = (
  params?: OrderQueryParams
): Promise<GetMyOrdersResponse> => {
  return api
    .get<GetMyOrdersResponse>(`${BASE_URL}/api/orders/my-orders`, {
      params: {
        pageNo: params?.pageNo || 1,
        pageSize: params?.pageSize || 10,
        sortBy: params?.sortBy || "orderDate",
        sortDir: params?.sortDir || "DESC",
        // status: params?.status // Uncomment if backend supports status filtering
      },
    })
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