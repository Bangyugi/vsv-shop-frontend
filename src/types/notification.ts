import type { ApiResponse } from "./index";
import type { ApiOrderData } from "./order";

export interface ApiNotificationSummary {
  pendingOrderCount: number;
}

export interface NotificationMessage {
  id: number;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export type GetNotificationSummaryResponse =
  ApiResponse<ApiNotificationSummary>;

// --- WebSocket Types ---
export type WebSocketEventType =
  | "SELLER_NEW_ORDER"
  | "SELLER_ORDER_CANCELLED"
  | "BUYER_ORDER_UPDATE";

export interface WebSocketOrderResponse {
  type: WebSocketEventType;
  payload: ApiOrderData;
  timestamp: string;
}

export interface NotificationContextType {
  notifications: NotificationMessage[];
  unreadCount: number;
  isConnected: boolean;
  // Data đơn hàng mới nhất từ socket
  latestOrderUpdate: ApiOrderData | null;
  // Loại sự kiện mới nhất để component biết cách xử lý (Thêm mới hay Update)
  latestOrderEventType: WebSocketEventType | null;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}