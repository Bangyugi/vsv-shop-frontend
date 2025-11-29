import {
  Box,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowBack } from "@mui/icons-material";
import OrderHeader from "../components/OrderHeader";
import OrderCustomerInfo from "../components/OrderCustomerInfo";
import OrderItemsList from "../components/OrderItemList";
import OrderPaymentSummary from "../components/OrderPaymentSummary";
import ShippingTimeline from "../components/ShippingTimeline";
import OrderActions from "../components/OrderAction";

import { useState, useEffect, useCallback } from "react";

import * as orderService from "../../../services/orderService";
import type { ApiOrderData, ApiOrderItem } from "../../../types/order";
import ReviewDialog from "../components/ReviewDialog";

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<ApiOrderData | null>(null);
  const navigate = useNavigate();

  const [reviewingItem, setReviewingItem] = useState<ApiOrderItem | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setError("Order ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderByUuid(orderId);
      if (response.code === 200 && response.data) {
        setOrder(response.data);
      } else {
        throw new Error(response.message || "Order not found");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleOpenReview = (item: ApiOrderItem) => {
    setReviewingItem(item);
  };

  const handleCloseReview = () => {
    setReviewingItem(null);
  };

  const handleReviewSubmitted = () => {
    handleCloseReview();
    setSnackbar({
      open: true,
      message: "Review submitted successfully! Thank you.",
      severity: "success",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[60vh]">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container
        maxWidth="sm"
        className="flex flex-col items-center text-center"
        sx={{ py: 8 }}
      >
        <Typography variant="h4" className="font-bold" gutterBottom>
          {error ? "Error Loading Order" : "404 - Order Not Found"}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {error
            ? error
            : `The order with ID "${orderId}" does not exist or you do not have access to it.`}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
        >
          Back to Order History
        </Button>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ bgcolor: "background.default", py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBack />}
            sx={{ mb: 2, color: "text.secondary", fontWeight: 600 }}
          >
            Back
          </Button>

          <OrderHeader
            orderId={order.orderId}
            orderDate={order.orderDate}
            status={order.orderStatus}
          />

          <Grid container spacing={4}>
            <Grid item xs={12} lg={8}>
              <Box className="space-y-4">
                <OrderItemsList
                  items={order.orderItems}
                  status={order.orderStatus}
                  onOpenReview={handleOpenReview}
                />
                <ShippingTimeline status={order.orderStatus} />
              </Box>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Box className="space-y-4 sticky top-24">
                <OrderCustomerInfo
                  shippingAddress={order.shippingAddress}
                  paymentMethod={"N/A (Data not provided)"}
                  status={order.orderStatus}
                />
                <OrderPaymentSummary order={order} />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <OrderActions
                status={order.orderStatus}
                orderId={order.orderId}
                onOrderUpdate={fetchOrderDetails}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- CẬP NHẬT: Truyền `orderItem` thay vì `product` --- */}
      {reviewingItem && (
        <ReviewDialog
          open={!!reviewingItem}
          onClose={handleCloseReview}
          orderItem={reviewingItem}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
      {/* --- KẾT THÚC CẬP NHẬT --- */}

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
    </motion.div>
  );
};

export default OrderDetailPage;
