import { Box, Typography, Chip } from "@mui/material";

import type { ApiOrderStatus } from "../../../types/order";
import {
  CheckCircleOutline,
  LocalShippingOutlined,
  AutorenewOutlined,
  CancelOutlined,
  ReplayOutlined,
  HourglassTopOutlined,
  FactCheckOutlined,
} from "@mui/icons-material";

const statusMap: Record<
  ApiOrderStatus,
  {
    label: string;
    color: "default" | "info" | "success" | "error" | "warning";
    icon: React.ReactElement;
  }
> = {
  PENDING: {
    label: "Pending",
    color: "default",
    icon: <HourglassTopOutlined />,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "info",
    icon: <FactCheckOutlined />,
  },
  PROCESSING: {
    label: "Processing",
    color: "info",
    icon: <AutorenewOutlined />,
  },
  SHIPPED: {
    label: "Shipped",
    color: "info",
    icon: <LocalShippingOutlined />,
  },
  DELIVERED: {
    label: "Delivered",
    color: "success",
    icon: <CheckCircleOutline />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "error",
    icon: <CancelOutlined />,
  },
  RETURNED: {
    label: "Returned / Refunded",
    color: "warning",
    icon: <ReplayOutlined />,
  },
};

interface OrderHeaderProps {
  orderId: string;
  orderDate: string;
  status: ApiOrderStatus;
}

const OrderHeader = ({ orderId, orderDate, status }: OrderHeaderProps) => {
  const statusInfo = statusMap[status] || statusMap["PENDING"];

  return (
    <Box
      className="flex flex-col sm:flex-row justify-between sm:items-center gap-3"
      sx={{ mb: 4 }}
    >
      <Box>
        <Typography
          variant="h4"
          component="h1"
          className="font-bold tracking-tight"
        >
          Order Details
        </Typography>
        <Box className="flex items-center gap-3 mt-2">
          {/* --- SỬA: Hiển thị UUID --- */}
          <Typography className="font-semibold">#{orderId}</Typography>
          <Typography color="text.secondary">
            Placed on: {new Date(orderDate).toLocaleDateString("en-US")}
          </Typography>
        </Box>
      </Box>
      <Chip
        icon={statusInfo.icon}
        label={statusInfo.label}
        color={statusInfo.color}
        variant="filled"
        sx={{
          fontSize: "0.9rem",
          fontWeight: "bold",
          px: 1,
          alignSelf: "flex-start",
        }}
      />
    </Box>
  );
};

export default OrderHeader;
