import api from "../api/axios";
import type {
  GetMyOrdersResponse,
  ApiOrderData,
  CreateOrderRequest,
  CancelOrderResponse,
  OrderQueryParams,
} from "../types/order";
import type { ApiResponse } from "../types";

export const getMyOrders = (
  params?: OrderQueryParams
): Promise<GetMyOrdersResponse> => {
  return api
    .get<GetMyOrdersResponse>("/api/orders/my-orders", {
      params: {
        pageNo: params?.pageNo || 1,
        pageSize: params?.pageSize || 10,
        sortBy: params?.sortBy || "orderDate",
        sortDir: params?.sortDir || "DESC",
      },
    })
    .then((res) => res.data);
};

export const createOrder = (
  data: CreateOrderRequest
): Promise<ApiResponse<ApiOrderData[]>> => {
  return api
    .post<ApiResponse<ApiOrderData[]>>("/api/orders", data)
    .then((res) => res.data);
};

export const getOrderByUuid = (
  orderUuid: string
): Promise<ApiResponse<ApiOrderData>> => {
  return api
    .get<ApiResponse<ApiOrderData>>(`/api/orders/uuid/${orderUuid}`)
    .then((res) => res.data);
};

export const cancelOrder = (
  orderUuid: string
): Promise<CancelOrderResponse> => {
  return api
    .patch<CancelOrderResponse>(
      `/api/orders/uuid/${orderUuid}/cancel`
    )
    .then((res) => res.data);
};