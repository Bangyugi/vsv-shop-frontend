import type { ApiResponse } from "./index";

export interface ApiNotificationSummary {
  pendingOrderCount: number;
}

export type GetNotificationSummaryResponse =
  ApiResponse<ApiNotificationSummary>;

export interface SellerNotificationContextType {
  summary: ApiNotificationSummary | null;
  isLoading: boolean;
  fetchSummary: () => Promise<void>;
}
