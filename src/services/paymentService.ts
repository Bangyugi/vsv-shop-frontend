import api from "../api/axios";
import type { ApiResponse } from "../types";
import type { ApiPaymentLinkData } from "../types/order";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const createVnpayPayment = (
  orderUuid: string
): Promise<ApiResponse<ApiPaymentLinkData>> => {
  return api
    .post<ApiResponse<ApiPaymentLinkData>>(
      `${BASE_URL}/api/payments/vnpay/${orderUuid}`
    )
    .then((res) => res.data);
};
