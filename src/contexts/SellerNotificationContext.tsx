import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import * as sellerService from "../services/sellerService";
import type {
  ApiNotificationSummary,
  SellerNotificationContextType,
} from "../types/notification";
import { useAuth } from "./AuthContext";

const POLLING_INTERVAL_MS = 30000;

const SellerNotificationContext = createContext<
  SellerNotificationContextType | undefined
>(undefined);

export const SellerNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [summary, setSummary] = useState<ApiNotificationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const isSeller =
    user?.roles.some(
      (role) =>
        role.name === "ROLE_SELLER" ||
        role.name === "ROLE_ADMIN" ||
        role.name === "ROLE_SUPERADMIN"
    ) || false;

  const fetchSummary = useCallback(async () => {
    if (!isAuthenticated || !isSeller) {
      setSummary(null);
      return;
    }

    try {
      const response = await sellerService.getNotificationSummary();
      if (response.code === 200 && response.data) {
        setSummary(response.data);
      } else {
        setSummary(null);
        console.error("Failed to fetch notifications:", response.message);
      }
    } catch (error) {
      setSummary(null);
      console.error("Error fetching notifications:", error);
    } finally {
    }
  }, [isAuthenticated, isSeller]);

  useEffect(() => {
    if (isAuthenticated && isSeller) {
      fetchSummary();

      const intervalId = setInterval(fetchSummary, POLLING_INTERVAL_MS);

      return () => clearInterval(intervalId);
    } else {
      setSummary(null);
    }
  }, [isAuthenticated, isSeller, fetchSummary]);

  const contextValue = useMemo(
    () => ({
      summary,
      isLoading,
      fetchSummary,
    }),
    [summary, isLoading, fetchSummary]
  );

  return (
    <SellerNotificationContext.Provider value={contextValue}>
      {children}
    </SellerNotificationContext.Provider>
  );
};

export const useSellerNotification = (): SellerNotificationContextType => {
  const context = useContext(SellerNotificationContext);
  if (context === undefined) {
    throw new Error(
      "useSellerNotification must be used within a SellerNotificationProvider"
    );
  }
  return context;
};
