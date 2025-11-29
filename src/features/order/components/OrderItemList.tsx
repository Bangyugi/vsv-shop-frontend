import { Box, Typography, Paper, Avatar, Divider, Button } from "@mui/material";
import type { ApiOrderItem, ApiOrderStatus } from "../../../types/order";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

interface OrderItemsListProps {
  items: ApiOrderItem[];
  status: ApiOrderStatus;
  onOpenReview: (item: ApiOrderItem) => void;
}

const OrderItemsList = ({
  items,
  status,
  onOpenReview,
}: OrderItemsListProps) => {
  const canReview = status === "DELIVERED";

  const handleReviewClick = (item: ApiOrderItem) => {
    onOpenReview(item);
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: { xs: 2, md: 3 }, borderRadius: "12px" }}
    >
      <Typography variant="h6" className="font-bold" sx={{ mb: 3 }}>
        Products
      </Typography>
      <Box className="space-y-4">
        {items.map((item, index) => {
          const isReviewed = item.isReviewed || false;

          return (
            <Box key={item.id}>
              <Box className="flex flex-col sm:flex-row gap-4">
                <Avatar
                  src={
                    item.imageUrl ||
                    item.product?.images?.[0] ||
                    "/placeholder.png"
                  }
                  alt={item.productTitle}
                  variant="rounded"
                  sx={{ width: 100, height: 120 }}
                />
                <Box className="flex-grow">
                  <Typography className="font-semibold">
                    {item.productTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Variant: {item.color}, {item.size}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quantity: {item.quantity}
                  </Typography>
                </Box>
                <Box className="text-left sm:text-right">
                  <Typography className="font-bold">
                    {formatCurrency(
                      item.sellingPriceAtPurchase * item.quantity
                    )}
                  </Typography>
                  {item.priceAtPurchase > item.sellingPriceAtPurchase && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      className="line-through"
                    >
                      {formatCurrency(item.priceAtPurchase * item.quantity)}
                    </Typography>
                  )}
                </Box>
              </Box>

              {canReview && (
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2, borderRadius: "20px" }}
                  onClick={() => handleReviewClick(item)}
                  disabled={isReviewed}
                >
                  {isReviewed ? "Reviewed" : "Review Product"}
                </Button>
              )}

              {index < items.length - 1 && <Divider sx={{ my: 3 }} />}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default OrderItemsList;
