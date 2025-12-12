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
} from "../types/notification";

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
  const [isConnected, setIsConnected] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const handleNewMessage = useCallback((message: IMessage) => {
    try {
      const notification: NotificationMessage = JSON.parse(message.body);

      setNotifications((prev) => [notification, ...prev]);
    } catch (error) {
      console.error("Error parsing notification:", error);
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
      debug: (str) => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log("Connected to WebSocket");
      setIsConnected(true);

      client.subscribe("/user/queue/notifications", handleNewMessage);

      const isAdmin = user.roles.some((r) => r.name === "ROLE_ADMIN");
      if (isAdmin) {
        client.subscribe("/topic/admin/notifications", handleNewMessage);
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
  }, [isAuthenticated, accessToken, user, handleNewMessage]);

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
