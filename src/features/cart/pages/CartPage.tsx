import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Alert,
  Paper,
  TextField,
  CircularProgress,
  // FIX: Xóa InputAdornment
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";

import OrderSummary from "../components/OrderSummary";
import CartItemCard from "../components/CartItemCard";
import EmptyCart from "../components/EmptyCart";

import { useCart } from "../../../contexts/CartContext";
import type { CartItemFE, ApiCartItem } from "../../../types/cart";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const mapApiCartItemToFE = (apiItem: ApiCartItem): CartItemFE => ({
  id: apiItem.id,
  productId: apiItem.product.id,
  variantId: apiItem.variant.id,
  name: apiItem.product.title,
  color: apiItem.variant.color,
  size: apiItem.variant.size,
  price: apiItem.sellingPrice,
  quantity: apiItem.quantity,
  image: apiItem.product.images?.[0] || "/placeholder.png",
});

const CartPage = () => {
  const {
    cartData,
    isInitialLoading,
    updateQuantity,
    removeItem,
    applyCoupon,
    fetchCart,
  } = useCart();

  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState<
    Record<number, boolean>
  >({});
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCart(true);
  }, [fetchCart]);

  useEffect(() => {
    if (cartData?.couponCode) {
      setCouponCodeInput(cartData.couponCode);
    }
  }, [cartData?.couponCode]);

  const cartItems = useMemo(
    () => cartData?.cartItems.map(mapApiCartItemToFE) || [],
    [cartData]
  );

  const totalItemsCount = useMemo(() => cartData?.totalItem || 0, [cartData]);

  const apiOriginalSubtotal = useMemo(
    () => cartData?.totalPrice || 0,
    [cartData]
  );

  const apiSellingSubtotal = useMemo(
    () => cartData?.totalSellingPrice || 0,
    [cartData]
  );

  const apiCouponPercentage = useMemo(
    () => cartData?.discount || 0,
    [cartData]
  );

  const hasCoupon = apiCouponPercentage > 0;

  const preCouponSellingTotal = useMemo(() => {
    if (hasCoupon && apiCouponPercentage < 100) {
      return apiSellingSubtotal / (1 - apiCouponPercentage / 100);
    }
    return apiSellingSubtotal;
  }, [apiSellingSubtotal, apiCouponPercentage, hasCoupon]);

  const apiCouponDiscountAmount = useMemo(() => {
    if (hasCoupon) {
      return preCouponSellingTotal - apiSellingSubtotal;
    }
    return 0;
  }, [preCouponSellingTotal, apiSellingSubtotal, hasCoupon]);

  const shipping = 0;
  const total = apiSellingSubtotal + shipping;

  const handleQuantityChange = async (cartItemId: number, quantity: number) => {
    const currentItem = cartItems.find((item) => item.id === cartItemId);
    if (!currentItem || currentItem.quantity === quantity) {
      return;
    }

    setIsUpdatingQuantity((prev) => ({ ...prev, [cartItemId]: true }));
    try {
      await updateQuantity(cartItemId, quantity);
    } catch (err) {
      // Error handled in context
    } finally {
      setIsUpdatingQuantity((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    setIsUpdatingQuantity((prev) => ({ ...prev, [cartItemId]: true }));
    try {
      await removeItem(cartItemId);
    } catch (err) {
      setIsUpdatingQuantity((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponCodeInput.trim();
    if (!code) {
      setLocalError("Vui lòng nhập mã giảm giá.");
      return;
    }

    setLocalError(null);
    setLocalSuccess(null);
    setIsApplyingCoupon(true);

    try {
      await applyCoupon(code);
      setLocalSuccess("Áp dụng mã thành công!");
    } catch (err: any) {
      let message = "Có lỗi xảy ra, vui lòng thử lại.";
      const backendError = err.response?.data;

      if (backendError) {
        if (backendError.code === 1031) {
          const msg = backendError.message || "";
          if (msg.toLowerCase().includes("minimum order value")) {
            message = "Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này.";
          } else if (msg.toLowerCase().includes("already used")) {
            message = "Bạn đã sử dụng mã này rồi.";
          } else {
            message = "Mã giảm giá không tồn tại hoặc đã hết hạn.";
          }
        } else if (err.response.status === 404) {
          message = "Mã giảm giá không đúng.";
        } else {
          message = backendError.message || message;
        }
      } else if (err.message) {
        message = err.message;
      }

      setLocalError(message);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const renderContent = () => {
    if (isInitialLoading) {
      return (
        <Box className="flex justify-center items-center min-h-[60vh]">
          <CircularProgress />
        </Box>
      );
    }

    if (cartItems.length === 0) {
      return <EmptyCart />;
    }

    return (
      <>
        <Box className="flex flex-col sm:flex-row justify-between items-baseline mb-6">
          <Typography variant="h4" component="h1" className="font-bold">
            Your Shopping Cart
          </Typography>
          <Box className="flex items-baseline gap-4 mt-2 sm:mt-0">
            <Typography variant="body1" color="text.secondary">
              {totalItemsCount} item{totalItemsCount > 1 ? "s" : ""}
            </Typography>
            <Button
              component={RouterLink}
              to="/"
              variant="text"
              sx={{ color: "primary.main" }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box className="space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                    formatCurrency={formatCurrency}
                    isUpdating={isUpdatingQuantity[item.id] || false}
                  />
                ))}
              </AnimatePresence>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "12px",
                border: "1px solid #e0e0e0",
                mb: 4,
              }}
            >
              <Box className="flex items-center gap-2 mb-3">
                <LocalOfferOutlinedIcon color="primary" />
                <Typography variant="h6" className="font-semibold">
                  Mã Giảm Giá
                </Typography>
              </Box>

              {localError && (
                <Alert
                  severity="error"
                  onClose={() => setLocalError(null)}
                  sx={{ mb: 2 }}
                >
                  {localError}
                </Alert>
              )}
              
              {localSuccess && (
                <Alert 
                  severity="success" 
                  onClose={() => setLocalSuccess(null)}
                  sx={{ mb: 2 }}
                >
                  {localSuccess}
                </Alert>
              )}

              <Box className="flex gap-2">
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Nhập mã voucher"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  disabled={isApplyingCoupon}
                  InputProps={{
                    sx: { borderRadius: "50px" }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCodeInput}
                  sx={{ borderRadius: "50px", px: 3, whiteSpace: "nowrap" }}
                >
                  {isApplyingCoupon ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Áp Dụng"
                  )}
                </Button>
              </Box>

              {cartData?.couponCode && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: "success.light", borderRadius: "8px", bgOpacity: 0.1 }}>
                  <Typography variant="body2" sx={{ color: "#1b5e20", fontWeight: 600 }}>
                    Đã áp dụng: {cartData.couponCode}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#2e7d32" }}>
                    Bạn được giảm {apiCouponPercentage}% (-{formatCurrency(apiCouponDiscountAmount)})
                  </Typography>
                </Box>
              )}
            </Paper>

            <OrderSummary
              originalSubtotal={apiOriginalSubtotal}
              preCouponSellingTotal={preCouponSellingTotal}
              sellingSubtotal={apiSellingSubtotal}
              shipping={shipping}
              couponDiscount={apiCouponDiscountAmount}
              total={total}
              itemCount={cartItems.length}
              formatCurrency={formatCurrency}
            />
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <Box sx={{ bgcolor: "background.default", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">{renderContent()}</Container>
    </Box>
  );
};

export default CartPage;