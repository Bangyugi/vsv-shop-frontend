import type { ApiResponse } from "./index";

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

export interface NotificationContextType {
  notifications: NotificationMessage[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}
