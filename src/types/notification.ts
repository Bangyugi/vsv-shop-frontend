import type { ApiResponse } from "./index";

/**
 * Dữ liệu trả về từ API tóm tắt thông báo.
 * (Giả định API trả về số đơn hàng đang chờ xử lý)
 */
export interface ApiNotificationSummary {
  pendingOrderCount: number;
}

export type GetNotificationSummaryResponse =
  ApiResponse<ApiNotificationSummary>;

/**
 * Kiểu dữ liệu cho SellerNotificationContext
 */
export interface SellerNotificationContextType {
  summary: ApiNotificationSummary | null;
  isLoading: boolean;
  fetchSummary: () => Promise<void>;
}
