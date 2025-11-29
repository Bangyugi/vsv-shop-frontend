import {
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import {
  PersonOutline,
  PhoneOutlined,
  LocationOnOutlined,
  CreditCardOutlined,
  EmailOutlined,
} from "@mui/icons-material";

import type { ApiOrderStatus } from "../../../types/order";
import type { ApiAddress } from "../../../types/address";

interface OrderCustomerInfoProps {
  shippingAddress: ApiAddress;
  paymentMethod: string;
  status: ApiOrderStatus;
}

const OrderCustomerInfo = ({
  shippingAddress,
  paymentMethod,
  status,
}: OrderCustomerInfoProps) => {
  const canChangeAddress = status === "PENDING" || status === "CONFIRMED";

  const fullAddress = [
    shippingAddress.address,
    shippingAddress.ward,
    shippingAddress.district,
    shippingAddress.province,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: 3, borderRadius: "12px", height: "100%" }}
    >
      <Typography variant="h6" className="font-bold" sx={{ mb: 2 }}>
        Customer Information
      </Typography>
      <List disablePadding>
        <ListItem disablePadding sx={{ mb: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <PersonOutline />
          </ListItemIcon>
          <ListItemText primary={shippingAddress.fullName || "N/A"} />
        </ListItem>
        <ListItem disablePadding sx={{ mb: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <PhoneOutlined />
          </ListItemIcon>
          <ListItemText primary={shippingAddress.phoneNumber || "N/A"} />
        </ListItem>
        <ListItem disablePadding sx={{ mb: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <EmailOutlined />
          </ListItemIcon>
          <ListItemText primary={shippingAddress.email || "N/A"} />
        </ListItem>
        <ListItem disablePadding sx={{ mb: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LocationOnOutlined />
          </ListItemIcon>
          <ListItemText primary={fullAddress || "N/A"} />
        </ListItem>

        <ListItem disablePadding>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <CreditCardOutlined />
          </ListItemIcon>

          <ListItemText primary={`Payment: ${paymentMethod || "N/A"}`} />
        </ListItem>
      </List>
      {canChangeAddress && (
        <Button variant="text" sx={{ mt: 2, p: 0, fontWeight: "bold" }}>
          Change Address
        </Button>
      )}
    </Paper>
  );
};

export default OrderCustomerInfo;
