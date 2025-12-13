import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import SockJS from "sockjs-client";
import { Client, type IMessage } from "@stomp/stompjs";
import { useAuth } from "./AuthContext";
import {
  type NotificationMessage,
  type NotificationContextType,
  type WebSocketOrderResponse,
  type WebSocketEventType,
} from "../types/notification";
import type { ApiOrderData } from "../types/order";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { accessToken, user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  
  // State cho Real-time Order
  const [latestOrderUpdate, setLatestOrderUpdate] =
    useState<ApiOrderData | null>(null);
  const [latestOrderEventType, setLatestOrderEventType] =
    useState<WebSocketEventType | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [_stompClient, setStompClient] = useState<Client | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const handleNewNotification = useCallback((message: IMessage) => {
    try {
      const notification: NotificationMessage = JSON.parse(message.body);
      setNotifications((prev) => [notification, ...prev]);
    } catch (error) {
      console.error("Error parsing notification:", error);
    }
  }, []);

  // Xử lý khi nhận được update đơn hàng (Payload là ApiOrderData)
  const handleOrderUpdate = useCallback((message: IMessage) => {
    try {
      const response: WebSocketOrderResponse = JSON.parse(message.body);
      console.log("Real-time order event:", response.type, response.payload);
      
      setLatestOrderUpdate(response.payload);
      setLatestOrderEventType(response.type);
    } catch (error) {
      console.error("Error parsing order update:", error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !user) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      // debug: (str) => console.log(str), // Uncomment for debug
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

   // FIX: đổi frame -> _frame để tránh lỗi unused variable
   client.onConnect = (_frame) => {
      console.log("Connected to WebSocket");
      setIsConnected(true);

      // 1. Subscribe Notifications (General notifications)
      client.subscribe("/user/queue/notifications", handleNewNotification);

      // 2. Subscribe Order Updates (Private updates for Buyer/Seller)
      client.subscribe("/user/queue/updates", handleOrderUpdate);

      const isAdmin = user.roles.some((r) => r.name === "ROLE_ADMIN");
      if (isAdmin) {
        // 3. Subscribe Admin Global Notifications (Text)
        client.subscribe("/topic/admin/notifications", handleNewNotification);

        // 4. Subscribe Admin Global Order Updates (Data)
        client.subscribe("/topic/admin/orders", handleOrderUpdate); 
      }
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
      setIsConnected(false);
    };

    client.onWebSocketClose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };

    client.activate();
    setStompClient(client);

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [
    isAuthenticated,
    accessToken,
    user,
    handleNewNotification,
    handleOrderUpdate,
  ]);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        latestOrderUpdate,
        latestOrderEventType,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};