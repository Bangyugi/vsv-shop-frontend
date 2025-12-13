import { useState } from "react";
import { Button, Stack, CircularProgress } from "@mui/material";

import type { ApiOrderData, ApiOrderStatus } from "../../../types/order";
import CancelOrderDialog from "./CancelOrderDialog";
import RequestRefundDialog from "./RequestRefundDialog";

import * as orderService from "../../../services/orderService";

interface OrderActionsProps {
  status: ApiOrderStatus;
  orderId: string;
  onOrderUpdate: (newOrderData?: ApiOrderData) => void;
  
  onShowNotification: (
    message: string,
    severity: "success" | "error" | "info"
  ) => void;
}

const OrderActions = ({
  status,
  orderId,
  onOrderUpdate,
  onShowNotification,
}: OrderActionsProps) => {
  const [openCancel, setOpenCancel] = useState(false);
  const [openRefund, setOpenRefund] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCancel = status === "PENDING" || status === "CONFIRMED";
  const canRequestRefund = status === "DELIVERED";
  const canBuyAgain =
    status === "DELIVERED" || status === "CANCELLED" || status === "RETURNED";

  const handleCancelSubmit = async (reason: string) => {
    console.log("Reason for cancellation:", reason);
    setIsSubmitting(true);

    try {
      const response = await orderService.cancelOrder(orderId);
      if (response.code === 200 && response.data) {
        
        onShowNotification("Order cancelled successfully!", "success");
        
        onOrderUpdate(response.data);
      } else {
        throw new Error(response.message || "Failed to cancel order");
      }
    } catch (error: any) {
      onShowNotification(
        error.response?.data?.message || error.message || "An error occurred.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
      setOpenCancel(false);
    }
  };

  const handleRefundSubmit = (reason: string) => {
    console.log("Reason for refund:", reason);
    onShowNotification("Refund request submitted (demo).", "success");
    setOpenRefund(false);
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

      {/* Đã xóa Snackbar nội bộ */}
    </>
  );
};

export default OrderActions;
