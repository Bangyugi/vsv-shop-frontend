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
import { useNotification } from "../../../contexts/NotificationContext";

// mock function to map API order status to our tab categories
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

const PAGE_SIZE = 5;

// Người dùng có thể xem lịch sử đơn hàng của họ
const OrderHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { latestOrderUpdate, latestOrderEventType } = useNotification();

  const [orders, setOrders] = useState<ApiOrderData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  // FIX: Xóa biến totalElements không sử dụng

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewingItem, setReviewingItem] = useState<ApiOrderItem | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  } | null>(null);

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

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getMyOrders({
        pageNo: page,
        pageSize: PAGE_SIZE,
        sortBy: "orderDate",
        sortDir: "DESC",
      });

      const responseData = response.data || response.result;

      if (response.code === 200 && responseData) {
        setOrders(responseData.pageContent || []);
        setTotalPages(responseData.totalPages || 1);
        // setTotalElements không còn cần thiết
      } else {
        throw new Error(response.message || "Failed to fetch orders");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred while fetching orders."
      );
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (latestOrderUpdate && latestOrderEventType) {
      if (latestOrderEventType === "BUYER_ORDER_UPDATE") {
        setOrders((prevOrders) => {
          const orderIndex = prevOrders.findIndex(
            (o) => o.orderId === latestOrderUpdate.orderId
          );

          if (orderIndex > -1) {
            const updatedOrders = [...prevOrders];
            updatedOrders[orderIndex] = latestOrderUpdate;
            setSnackbar({
              open: true,
              message: `Order #${latestOrderUpdate.orderId} updated: ${latestOrderUpdate.orderStatus}`,
              severity: "info",
            });
            return updatedOrders;
          }
          return prevOrders;
        });
      }
    }
  }, [latestOrderUpdate, latestOrderEventType]);

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
    if (activeTab !== "all") {
      newParams.set("status", activeTab);
    }
    setSearchParams(newParams);
  };

  const displayedOrders = useMemo(() => {
    if (activeTab === "all") {
      return orders;
    }
    return orders.filter(
      (order) => mapApiStatusToTab(order.orderStatus) === activeTab
    );
  }, [activeTab, orders]);

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
        ) : displayedOrders.length === 0 ? (
          <Box
            className="flex flex-col items-center justify-center text-center gap-3"
            sx={{ minHeight: 300, color: "text.secondary" }}
          >
            <ShoppingBagOutlinedIcon sx={{ fontSize: "4rem" }} />
            <Typography variant="h6">No orders found</Typography>
            <Typography>
              {activeTab === "all"
                ? "You haven't placed any orders yet."
                : `No orders found in this page for '${tabConfig[activeTab]}'.`}
            </Typography>
          </Box>
        ) : (
          <>
            <Box className="space-y-5">
              <AnimatePresence mode="popLayout">
                {displayedOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onOpenReview={handleOpenReview}
                    canReview={order.orderStatus === "DELIVERED"}
                  />
                ))}
              </AnimatePresence>
            </Box>

            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                  py: 2,
                }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
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
