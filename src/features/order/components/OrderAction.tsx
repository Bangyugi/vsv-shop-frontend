import { useState } from "react";
import {
  Button,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import type { ApiOrderStatus } from "../../../types/order";
import CancelOrderDialog from "./CancelOrderDialog";
import RequestRefundDialog from "./RequestRefundDialog";

import * as orderService from "../../../services/orderService";

interface OrderActionsProps {
  status: ApiOrderStatus;
  orderId: string;
  onOrderUpdate: () => void;
}

const OrderActions = ({
  status,
  orderId,
  onOrderUpdate,
}: OrderActionsProps) => {
  const [openCancel, setOpenCancel] = useState(false);
  const [openRefund, setOpenRefund] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const canCancel = status === "PENDING" || status === "CONFIRMED";
  const canRequestRefund = status === "DELIVERED";
  const canBuyAgain =
    status === "DELIVERED" || status === "CANCELLED" || status === "RETURNED";

  const handleCancelSubmit = async (reason: string) => {
    console.log("Reason for cancellation:", reason);
    setIsSubmitting(true);
    setSnackbar(null);
    try {
      const response = await orderService.cancelOrder(orderId);
      if (response.code === 200) {
        setSnackbar({
          open: true,
          message: "Order cancelled successfully!",
          severity: "success",
        });
        onOrderUpdate();
      } else {
        throw new Error(response.message || "Failed to cancel order");
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "An error occurred.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
      setOpenCancel(false);
    }
  };

  const handleRefundSubmit = (reason: string) => {
    console.log("Reason for refund:", reason);

    setSnackbar({
      open: true,
      message: "Refund request submitted (demo).",
      severity: "success",
    });
    setOpenRefund(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mt: 4 }}
        justifyContent="flex-end"
      >
        {canBuyAgain && (
          <Button variant="outlined" color="primary" disabled={isSubmitting}>
            Buy Again
          </Button>
        )}
        {canRequestRefund && (
          <Button
            variant="outlined"
            color="warning"
            onClick={() => setOpenRefund(true)}
            disabled={isSubmitting}
          >
            Request Refund/Return
          </Button>
        )}
        {canCancel && (
          <Button
            variant="contained"
            color="error"
            onClick={() => setOpenCancel(true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Cancel Order"
            )}
          </Button>
        )}
      </Stack>

      <CancelOrderDialog
        open={openCancel}
        onClose={() => setOpenCancel(false)}
        onSubmit={handleCancelSubmit}
      />
      <RequestRefundDialog
        open={openRefund}
        onClose={() => setOpenRefund(false)}
        onSubmit={handleRefundSubmit}
      />

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};

export default OrderActions;
