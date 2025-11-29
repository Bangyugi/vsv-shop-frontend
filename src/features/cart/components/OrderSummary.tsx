import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface OrderSummaryProps {
  originalSubtotal: number;
  preCouponSellingTotal: number;
  sellingSubtotal: number;
  shipping: number;
  couponDiscount: number;
  total: number;
  itemCount: number;
  formatCurrency: (amount: number) => string;
}

const OrderSummary = ({
  originalSubtotal,
  preCouponSellingTotal,
  sellingSubtotal,
  shipping,
  couponDiscount,
  total,
  itemCount,
  formatCurrency,
}: OrderSummaryProps) => {
  const saleDiscount = originalSubtotal - preCouponSellingTotal;
  const hasSaleDiscount = saleDiscount > 0.01;
  const hasCouponDiscount = couponDiscount > 0.01;

  const showOriginalPrice =
    originalSubtotal > 0.01 &&
    Math.abs(originalSubtotal - sellingSubtotal) > 0.01;

  return (
    <Card className="rounded-xl shadow-md" elevation={0}>
      <CardContent className="p-6">
        <Typography variant="h6" className="font-bold mb-4">
          Order Summary
        </Typography>

        {showOriginalPrice && (
          <Box className="flex justify-between mb-2">
            <Typography color="text.secondary">Original Price</Typography>
            <Typography className="font-semibold ">
              {formatCurrency(originalSubtotal)}
            </Typography>
          </Box>
        )}

        {hasSaleDiscount && (
          <Box className="flex justify-between mb-2">
            <Typography color="text.secondary">Sale Discount</Typography>
            <Typography className="font-semibold" color="error.main">
              -{formatCurrency(saleDiscount)}
            </Typography>
          </Box>
        )}

        {hasCouponDiscount && (
          <Box className="flex justify-between mb-2">
            <Typography color="text.secondary">Coupon Discount</Typography>
            <Typography className="font-semibold" color="error.main">
              -{formatCurrency(couponDiscount)}
            </Typography>
          </Box>
        )}

        <Box className="flex justify-between mb-2">
          <Typography color="text.secondary">
            {showOriginalPrice ? "Subtotal" : "Subtotal"}
          </Typography>
          <Typography className="font-semibold">
            {formatCurrency(sellingSubtotal)}
          </Typography>
        </Box>

        <Box className="flex justify-between mb-4">
          <Typography color="text.secondary">Shipping</Typography>
          <Typography className="font-semibold">
            {shipping === 0 ? "Free" : formatCurrency(shipping)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box className="flex justify-between mb-4">
          <Typography variant="h6" className="font-bold">
            Total
          </Typography>
          <Typography variant="h6" className="font-bold">
            {formatCurrency(total)}
          </Typography>
        </Box>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={itemCount === 0}
          component={RouterLink}
          to="/checkout"
          state={{ discount: couponDiscount }}
          sx={{
            py: 1.5,
            borderRadius: "50px",
            bgcolor: "primary.main",
            "&:hover": {
              bgcolor: "primary.dark",
              transform: "scale(1.02)",
            },
            transition: "all 0.3s ease-in-out",
            "&.Mui-disabled": {
              backgroundColor: "action.disabledBackground",
              color: "action.disabled",
            },
          }}
        >
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
