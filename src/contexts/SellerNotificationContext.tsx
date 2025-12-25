import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useMemo,
} from "react";
import { Snackbar, Alert, type AlertColor } from "@mui/material";


interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor; 
  duration?: number;
}

interface SellerNotificationContextType {
  showNotification: (
    message: string,
    severity?: AlertColor,
    duration?: number
  ) => void;
  hideNotification: () => void;
}


const SellerNotificationContext = createContext<
  SellerNotificationContextType | undefined
>(undefined);


interface SellerNotificationProviderProps {
  children: ReactNode;
}

export const SellerNotificationProvider: React.FC<
  SellerNotificationProviderProps
> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
    duration: 3000,
  });

  const showNotification = useCallback(
    (
      message: string,
      severity: AlertColor = "info",
      duration: number = 3000
    ) => {
      setNotification({
        open: true,
        message,
        severity,
        duration,
      });
    },
    []
  );

  
  const hideNotification = useCallback(
    (_event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") {
        return;
      }
      setNotification((prev) => ({ ...prev, open: false }));
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      showNotification,
      hideNotification,
    }),
    [showNotification, hideNotification]
  );

  return (
    <SellerNotificationContext.Provider value={contextValue}>
      {children}

      <Snackbar
        open={notification.open}
        autoHideDuration={notification.duration}
        onClose={hideNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={hideNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </SellerNotificationContext.Provider>
  );
};

export const useSellerNotification = (): SellerNotificationContextType => {
  const context = useContext(SellerNotificationContext);

  if (!context) {
    throw new Error(
      "useSellerNotification must be used within a SellerNotificationProvider"
    );
  }

  return context;
};