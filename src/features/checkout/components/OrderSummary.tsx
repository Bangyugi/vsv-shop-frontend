import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
  Avatar,
} from "@mui/material";
import type { CheckoutCartItem } from "../../../types";

interface OrderSummaryProps {
  items: CheckoutCartItem[];
  shippingFee: number;
  termsAccepted: boolean;
  onTermsChange: (checked: boolean) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  formatCurrency: (amount: number) => string;

  originalSubtotal: number;
  preCouponSellingTotal: number;
  sellingSubtotal: number;
  couponDiscount: number;
  total: number;
}

const OrderSummary = ({
  items,
  shippingFee,
  termsAccepted,
  onTermsChange,
  onSubmit,
  isSubmitting,
  formatCurrency,

  originalSubtotal,
  preCouponSellingTotal,
  sellingSubtotal,
  couponDiscount,
  total,
}: OrderSummaryProps) => {
  const saleDiscount = originalSubtotal - preCouponSellingTotal;
  const hasSaleDiscount = saleDiscount > 0.01;
  const hasCouponDiscount = couponDiscount > 0.01;
  const showOriginalPrice =
    originalSubtotal > 0.01 &&
    Math.abs(originalSubtotal - sellingSubtotal) > 0.01;

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        p: { xs: 2, md: 4 },
        borderRadius: "12px",
        position: "sticky",
        top: 100,
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        className="font-bold"
        sx={{ mb: 4 }}
      >
        Order Summary
      </Typography>

      {/* --- CẬP NHẬT: Product List (Thêm SKU) --- */}
      <Box className="space-y-4" sx={{ mb: 4 }}>
        {items.map((item) => (
          <Box key={item.id} className="flex gap-3">
            <Avatar
              src={item.image}
              alt={item.name}
              variant="rounded"
              sx={{ width: 64, height: 64 }}
            />
            <Box className="flex-grow">
              <Typography className="font-semibold">{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                Quantity: {item.quantity}
              </Typography>
              {/* --- THÊM DÒNG NÀY --- */}
              <Typography variant="body2" color="text.secondary">
                {item.sku}
              </Typography>
              {/* --- KẾT THÚC THÊM --- */}
            </Box>
          </Box>
        ))}
      </Box>
      {/* --- KẾT THÚC CẬP NHẬT --- */}

      <Divider sx={{ my: 2 }} />

      {/* --- CẬP NHẬT: Totals (Dùng logic mới giống CartPage) --- */}
      <Box className="space-y-2">
        {showOriginalPrice && (
          <Box className="flex justify-between">
            <Typography color="text.secondary">Original Price</Typography>
            <Typography className="font-semibold">
              {formatCurrency(originalSubtotal)}
            </Typography>
          </Box>
        )}
        {hasSaleDiscount && (
          <Box className="flex justify-between">
            <Typography color="text.secondary">Sale Discount</Typography>
            <Typography className="font-semibold" color="error.main">
              -{formatCurrency(saleDiscount)}
            </Typography>
          </Box>
        )}
        {hasCouponDiscount && (
          <Box className="flex justify-between">
            <Typography color="text.secondary">Coupon Discount</Typography>
            <Typography className="font-semibold" color="error.main">
              -{formatCurrency(couponDiscount)}
            </Typography>
          </Box>
        )}

        {/* Subtotal là giá sau khi đã trừ tất cả discount */}
        <Box className="flex justify-between">
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography className="font-semibold">
            {formatCurrency(sellingSubtotal)}
          </Typography>
        </Box>

        <Box className="flex justify-between">
          <Typography color="text.secondary">Shipping Fee</Typography>
          <Typography className="font-semibold">
            {shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box className="flex justify-between">
          <Typography variant="h6" className="font-bold">
            Total
          </Typography>
          <Typography variant="h6" className="font-bold">
            {formatCurrency(total)}
          </Typography>
        </Box>
      </Box>
      {/* --- KẾT THÚC CẬP NHẬT TOTALS --- */}

      {/* Terms (Giữ nguyên) */}
      <FormControlLabel
        control={
          <Checkbox
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
          />
        }
        label="I agree to the Terms & Conditions and Privacy Policy."
        sx={{ mt: 3, mb: 2 }}
      />

      {/* Action Button (Giữ nguyên) */}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        onClick={onSubmit}
        disabled={!termsAccepted || isSubmitting}
        sx={{
          py: 1.5,
          fontSize: "1rem",
          fontWeight: "bold",
          borderRadius: "50px",
        }}
      >
        {isSubmitting ? "Processing..." : "Place Order Now"}
      </Button>
    </Paper>
  );
};

export default OrderSummary;
