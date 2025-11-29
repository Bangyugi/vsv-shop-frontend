import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Stack,
  Chip,
  Avatar,
  Typography,
} from "@mui/material";
import {
  EmailOutlined,
  PhoneOutlined,
  CakeOutlined,
  WcOutlined,
  CheckCircleOutline,
  HighlightOffOutlined,
  AdminPanelSettingsOutlined,
  StorefrontOutlined,
  PersonOutline,
  BadgeOutlined,
  BusinessCenterOutlined,
  AccountBalanceOutlined,
  LocalShippingOutlined,
  ReceiptOutlined,
} from "@mui/icons-material";
import { format } from "date-fns";

import type { UserData, UserRole } from "../../../types/auth";
import type { ApiSellerData } from "../../../types/seller";

interface SellerDetailDialogProps {
  open: boolean;
  onClose: () => void;
  seller: ApiSellerData | null;
  isLoading: boolean;
}

const InfoItem: React.FC<{
  icon: React.ReactElement;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <ListItem sx={{ px: 0, py: 0.5 }}>
    <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>
      {icon}
    </ListItemIcon>
    <ListItemText
      primary={<Typography variant="body2">{label}</Typography>}
      secondary={
        <Typography
          variant="body1"
          sx={{ fontWeight: 500, color: "text.primary" }}
          component="div"
        >
          {value || "N/A"}
        </Typography>
      }
    />
  </ListItem>
);

const renderRoleChips = (roles: UserRole[]) => {
  if (!roles || roles.length === 0) {
    return (
      <Chip
        icon={<PersonOutline />}
        label="User"
        color="info"
        size="small"
        variant="outlined"
      />
    );
  }
  const sortedRoles = [...roles].sort((a, b) => {
    const order: Record<string, number> = {
      ROLE_SUPERADMIN: 1,
      ROLE_ADMIN: 2,
      ROLE_SELLER: 3,
      ROLE_USER: 4,
    };
    const aOrder = order[a.name] || 99;
    const bOrder = order[b.name] || 99;
    return aOrder - bOrder;
  });
  return (
    <Stack direction="row" spacing={1}>
      {sortedRoles.map((role) => {
        let icon,
          color:
            | "default"
            | "primary"
            | "secondary"
            | "error"
            | "info"
            | "success"
            | "warning" = "default",
          label = role.name.replace("ROLE_", "");
        if (role.name === "ROLE_SUPERADMIN") {
          icon = <AdminPanelSettingsOutlined />;
          color = "error";
        } else if (role.name === "ROLE_ADMIN") {
          icon = <AdminPanelSettingsOutlined />;
          color = "warning";
        } else if (role.name === "ROLE_SELLER") {
          icon = <StorefrontOutlined />;
          color = "secondary";
        } else if (role.name === "ROLE_USER") {
          icon = <PersonOutline />;
          color = "info";
        }
        return (
          <Chip
            key={role.id}
            icon={icon}
            label={label}
            color={color}
            size="small"
            variant="filled"
          />
        );
      })}
    </Stack>
  );
};

const SellerDetailDialog: React.FC<SellerDetailDialogProps> = ({
  open,
  onClose,
  seller,
  isLoading,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (!seller) {
      return (
        <DialogContentText sx={{ textAlign: "center", mt: 3 }}>
          No seller data to display.
        </DialogContentText>
      );
    }

    const user: UserData = seller.user;

    const pickupAddress = [
      seller.pickupAddress?.address,
      seller.pickupAddress?.ward,
      seller.pickupAddress?.district,
      seller.pickupAddress?.province,
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
            textAlign: "center",
          }}
        >
          <Avatar
            src={user.avatar}
            alt={user.firstName}
            sx={{ width: 80, height: 80, mb: 2 }}
          />
          <Typography variant="h5" className="font-bold">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            @{user.username}
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          <InfoItem icon={<BadgeOutlined />} label="User ID" value={user.id} />
          <InfoItem
            icon={
              user.enabled ? (
                <CheckCircleOutline color="success" />
              ) : (
                <HighlightOffOutlined color="error" />
              )
            }
            label="Status"
            value={
              user.enabled ? (
                <Chip
                  label="Active"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              ) : (
                <Chip
                  label="Disabled"
                  color="error"
                  size="small"
                  variant="outlined"
                />
              )
            }
          />
          <InfoItem
            icon={<AdminPanelSettingsOutlined color="action" />}
            label="Roles"
            value={renderRoleChips(user.roles)}
          />

          <Divider sx={{ my: 1.5 }} />

          <InfoItem icon={<EmailOutlined />} label="Email" value={user.email} />
          <InfoItem icon={<PhoneOutlined />} label="Phone" value={user.phone} />
          <InfoItem
            icon={<CakeOutlined />}
            label="Birth Date"
            value={
              user.birthDate
                ? format(new Date(user.birthDate), "dd/MM/yyyy")
                : "N/A"
            }
          />
          <InfoItem icon={<WcOutlined />} label="Gender" value={user.gender} />

          <Divider sx={{ my: 1.5 }}>
            <Chip label="Seller Details" size="small" />
          </Divider>

          <InfoItem
            icon={<BusinessCenterOutlined />}
            label="Business Name"
            value={seller.businessDetails.businessName}
          />
          <InfoItem
            icon={<EmailOutlined />}
            label="Business Email"
            value={seller.businessDetails.businessEmail}
          />
          <InfoItem
            icon={<PhoneOutlined />}
            label="Business Phone"
            value={seller.businessDetails.businessMobile}
          />
          <InfoItem
            icon={<AccountBalanceOutlined />}
            label="Bank"
            value={`${seller.bankDetails.bankName} - ${seller.bankDetails.accountNumber}`}
          />
          <InfoItem
            icon={<PersonOutline />}
            label="Account Holder"
            value={seller.bankDetails.accountHolderName}
          />
          <InfoItem
            icon={<LocalShippingOutlined />}
            label="Pickup Address"
            value={pickupAddress}
          />
          <InfoItem
            icon={<ReceiptOutlined />}
            label="GSTIN"
            value={seller.gstin}
          />
        </List>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ pt: 4, pb: 2 }}>{renderContent()}</DialogContent>
      <DialogActions
        sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SellerDetailDialog;
