import { useState, useEffect, useMemo, useCallback, forwardRef } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  Divider,
  Tabs,
  Tab,
  Pagination,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import * as orderService from "../../../services/orderService";
import type {
  ApiOrderData,
  ApiOrderStatus,
  ApiOrderItem,
} from "../../../types/order";
import ReviewDialog from "../../order/components/ReviewDialog";

const mapApiStatusToTab = (apiStatus: ApiOrderStatus): OrderStatusTab => {
  switch (apiStatus) {
    case "PENDING":
    case "CONFIRMED":
    case "PROCESSING":
      return "Processing";
    case "SHIPPED":
      return "Shipped";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    case "RETURNED":
      return "Returned";
    default:
      return "all";
  }
};
type OrderStatusTab =
  | "all"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";
const tabConfig: Record<OrderStatusTab, string> = {
  all: "All",
  Processing: "Processing",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  Returned: "Returned",
};
const validStatuses: OrderStatusTab[] = [
  "all",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];
const getStatusChipColor = (
  status: ApiOrderStatus
): "success" | "info" | "default" | "error" | "warning" => {
  switch (status) {
    case "DELIVERED":
      return "success";
    case "SHIPPED":
      return "info";
    case "PENDING":
    case "CONFIRMED":
    case "PROCESSING":
      return "default";
    case "CANCELLED":
      return "error";
    case "RETURNED":
      return "warning";
    default:
      return "default";
  }
};
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const OrderCard = forwardRef<
  HTMLDivElement,
  {
    order: ApiOrderData;
    onOpenReview: (item: ApiOrderItem) => void;
    canReview: boolean;
  }
>(({ order, onOpenReview, canReview }, ref) => (
  <motion.div
    ref={ref}
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ borderRadius: "12px", overflow: "hidden" }}
    >
      <Box
        className="flex flex-col sm:flex-row justify-between items-center gap-2"
        sx={{ p: 2, bgcolor: "background.default" }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Order:{" "}
            <span className="font-semibold text-text-primary">
              #{order.orderId}
            </span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Placed on: {new Date(order.orderDate).toLocaleDateString("en-US")}
          </Typography>
        </Box>
        <Chip
          label={order.orderStatus}
          color={getStatusChipColor(order.orderStatus)}
          size="small"
          variant="outlined"
        />
      </Box>
      <Divider />

      <Box sx={{ p: 2 }}>
        {order.orderItems.map((item) => {
          const isReviewed = item.isReviewed || false;

          return (
            <Box key={item.id}>
              <Box className="flex items-center gap-3 " sx={{ my: 2 }}>
                <Avatar
                  src={
                    item.imageUrl ||
                    item.product?.images?.[0] ||
                    "/placeholder.png"
                  }
                  alt={item.productTitle}
                  variant="rounded"
                  sx={{ width: 64, height: 64 }}
                />
                <Box className="grow">
                  <Typography className="font-semibold">
                    {item.productTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Qty: {item.quantity} |{" "}
                    {formatCurrency(item.sellingPriceAtPurchase)}
                  </Typography>
                </Box>

                {canReview && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => onOpenReview(item)}
                    sx={{ ml: 1, whiteSpace: "nowrap", color: "orange" }}
                    disabled={isReviewed}
                  >
                    {isReviewed ? "Reviewed" : "Write a Review"}
                  </Button>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
      <Divider />

      <Box className="flex justify-between items-center" sx={{ p: 2 }}>
        <Typography variant="body1">
          Total:{" "}
          <span className="font-bold text-lg">
            {formatCurrency(order.totalPrice)}
          </span>
        </Typography>
        <Button
          variant="outlined"
          size="small"
          component={RouterLink}
          to={`/profile/orders/${order.orderId}`}
        >
          View Details
        </Button>
      </Box>
    </Paper>
  </motion.div>
));

const ITEMS_PER_PAGE = 3;

const OrderHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allOrders, setAllOrders] = useState<ApiOrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewingItem, setReviewingItem] = useState<ApiOrderItem | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getMyOrders();
      if (response.code === 200) {
        setAllOrders(response.data || []);
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while fetching orders."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getActiveTabFromUrl = (): OrderStatusTab => {
    const statusFromUrl = searchParams.get("status") as OrderStatusTab;
    return validStatuses.includes(statusFromUrl) ? statusFromUrl : "all";
  };
  const getPageFromUrl = (): number => {
    const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;
  };
  const activeTab = getActiveTabFromUrl();
  const page = getPageFromUrl();

  const handleChangeTab = (
    _event: React.SyntheticEvent,
    newValue: OrderStatusTab
  ) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("status", newValue);
    newParams.set("page", "1");
    setSearchParams(newParams);
  };
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", value.toString());
    setSearchParams(newParams);
  };
  const filteredOrders = useMemo(() => {
    if (activeTab === "all") {
      return allOrders;
    }
    return allOrders.filter(
      (order) => mapApiStatusToTab(order.orderStatus) === activeTab
    );
  }, [activeTab, allOrders]);
  const pageCount = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const validStartIndex = Math.max(0, startIndex);
    if (validStartIndex >= filteredOrders.length) {
      return [];
    }
    return filteredOrders.slice(
      validStartIndex,
      validStartIndex + ITEMS_PER_PAGE
    );
  }, [page, filteredOrders]);
  useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", pageCount.toString());
      setSearchParams(newParams, { replace: true });
    }
  }, [page, pageCount, searchParams, setSearchParams]);

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
    fetchOrders();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography
        variant="h5"
        component="h2"
        className="font-bold"
        sx={{ mb: 4 }}
      >
        My Orders
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleChangeTab}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="order status tabs"
        >
          {(Object.keys(tabConfig) as OrderStatusTab[]).map((key) => (
            <Tab
              key={key}
              label={tabConfig[key]}
              value={key}
              sx={{ textTransform: "none", fontWeight: 500 }}
            />
          ))}
        </Tabs>
      </Box>

      <Box>
        {isLoading ? (
          <Box className="flex justify-center items-center min-h-[300px]">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : filteredOrders.length === 0 ? (
          <Box
            className="flex flex-col items-center justify-center text-center gap-3"
            sx={{ minHeight: 300, color: "text.secondary" }}
          >
            <ShoppingBagOutlinedIcon sx={{ fontSize: "4rem" }} />
            <Typography variant="h6">No orders found</Typography>
            <Typography>
              There are currently no orders in this status.
            </Typography>
          </Box>
        ) : (
          <>
            <Box className="space-y-5">
              <AnimatePresence mode="popLayout">
                {paginatedOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onOpenReview={handleOpenReview}
                    canReview={order.orderStatus === "DELIVERED"}
                  />
                ))}
              </AnimatePresence>
            </Box>

            {pageCount > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                  py: 2,
                }}
              >
                <Pagination
                  count={pageCount}
                  page={Math.min(page, pageCount)}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {reviewingItem && (
        <ReviewDialog
          open={!!reviewingItem}
          onClose={handleCloseReview}
          orderItem={reviewingItem}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}

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

export default OrderHistory;
