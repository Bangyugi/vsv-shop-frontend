import { Box, Typography, Paper, Divider } from "@mui/material";

import type { ApiOrderData } from "../../../types/order";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

interface OrderPaymentSummaryProps {
  order: ApiOrderData;
}

const OrderPaymentSummary = ({ order }: OrderPaymentSummaryProps) => {
  const totalAmount = order.totalPrice;

  const shippingFee = 0;
  const discount = 0;
  const subtotal = totalAmount - shippingFee + discount;

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: "12px" }}>
      <Typography variant="h6" className="font-bold" sx={{ mb: 2 }}>
        Order Summary
      </Typography>
      <Box className="space-y-2">
        <Box className="flex justify-between">
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography className="font-semibold">
            {formatCurrency(subtotal)}
          </Typography>
        </Box>
        <Box className="flex justify-between">
          <Typography color="text.secondary">Shipping Fee</Typography>
          <Typography className="font-semibold">
            {shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}
          </Typography>
        </Box>
        <Box className="flex justify-between">
          <Typography color="text.secondary">Discount</Typography>
          <Typography className="font-semibold" color="error.main">
            - {formatCurrency(discount)}
          </Typography>
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box className="flex justify-between">
          <Typography variant="h6" className="font-bold">
            Total
          </Typography>
          <Typography variant="h6" className="font-bold">
            {formatCurrency(totalAmount)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default OrderPaymentSummary;
