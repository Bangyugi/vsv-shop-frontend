import api from "../api/axios";
import type { ApiResponse } from "../types";
import type { ApiPaymentLinkData } from "../types/order";

export const createVnpayPayment = (
  orderUuid: string
): Promise<ApiResponse<ApiPaymentLinkData>> => {
  return api
    .post<ApiResponse<ApiPaymentLinkData>>(
      `/api/payments/vnpay/${orderUuid}`
    )
    .then((res) => res.data);
};