import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  NotificationsOutlined,
  SettingsOutlined,
  LogoutOutlined,
  AccountCircleOutlined,
  HomeOutlined,
  StorefrontOutlined,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import { Link as RouterLink } from "react-router-dom";

import { useSellerNotification } from "../../../contexts/SellerNotificationContext";

interface SellerHeaderProps {
  drawerWidth: number;
  handleDrawerToggle: () => void;
}

const SellerHeader: React.FC<SellerHeaderProps> = ({
  drawerWidth,
  handleDrawerToggle,
}) => {
  const { user, logout } = useAuth();

  const { summary } = useSellerNotification();
  const notificationCount = summary?.pendingOrderCount || 0;

  const [accountMenuAnchor, setAccountMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [notifMenuAnchor, setNotifMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const isAccountMenuOpen = Boolean(accountMenuAnchor);
  const isNotifMenuOpen = Boolean(notifMenuAnchor);

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };
  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifMenuAnchor(event.currentTarget);
  };
  const handleNotifMenuClose = () => {
    setNotifMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleAccountMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { lg: `calc(100% - ${drawerWidth}px)` },
        ml: { lg: `${drawerWidth}px` },
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { lg: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1 }}
        ></Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* --- 4. NÚT CHUÔNG THÔNG BÁO --- */}
          <IconButton color="inherit" onClick={handleNotifMenuOpen}>
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
          <IconButton color="inherit">
            <SettingsOutlined />
          </IconButton>

          <IconButton
            onClick={handleAccountMenuOpen}
            size="small"
            sx={{ ml: 1 }}
            aria-controls={isAccountMenuOpen ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={isAccountMenuOpen ? "true" : undefined}
          >
            <Avatar
              src={user?.avatar}
              alt={user?.firstName || "Seller"}
              sx={{ width: 40, height: 40 }}
            />
          </IconButton>

          {/* --- 5. MENU CHO NOTIFICATION --- */}
          <Menu
            anchorEl={notifMenuAnchor}
            id="notification-menu"
            open={isNotifMenuOpen}
            onClose={handleNotifMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
                mt: 1.5,
                width: 360,
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box
              sx={{
                p: 2,
                pb: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" className="font-semibold">
                Notifications
              </Typography>
              {/* (Nút "Mark all as read" có thể thêm sau) */}
            </Box>
            <Divider />
            <List sx={{ p: 0, maxHeight: 400, overflowY: "auto" }}>
              {notificationCount > 0 ? (
                <ListItem
                  button
                  component={RouterLink}
                  to="/seller/orders"
                  onClick={handleNotifMenuClose}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "secondary.main" }}>
                      <ShoppingCartOutlined />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`You have ${notificationCount} new order(s)`}
                    secondary="Click to view pending orders"
                  />
                </ListItem>
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No new notifications"
                    secondary="You're all caught up."
                    sx={{ textAlign: "center", py: 3 }}
                  />
                </ListItem>
              )}
              {/* (Các thông báo khác về review, tin nhắn... có thể lặp ở đây) */}
            </List>
          </Menu>

          {/* --- 6. MENU CHO ACCOUNT (Đổi tên state) --- */}
          <Menu
            anchorEl={accountMenuAnchor}
            id="account-menu"
            open={isAccountMenuOpen}
            onClose={handleAccountMenuClose}
            onClick={handleAccountMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {/* (Giữ nguyên các MenuItem của account) */}
            <MenuItem
              disabled
              sx={{
                mb: 1,
                opacity: "1 !important",
                cursor: "default",
                "&:hover": {
                  backgroundColor: "transparent !important",
                },
              }}
            >
              <Avatar alt={user?.firstName} src={user?.avatar} />
              <Box>
                <Typography variant="subtitle2" className="font-semibold">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              component={RouterLink}
              to="/seller"
              onClick={handleAccountMenuClose}
            >
              <ListItemIcon>
                <StorefrontOutlined fontSize="small" />
              </ListItemIcon>
              Seller Dashboard
            </MenuItem>

            <MenuItem
              component={RouterLink}
              to="/profile?tab=account"
              onClick={handleAccountMenuClose}
            >
              <ListItemIcon>
                <AccountCircleOutlined fontSize="small" />
              </ListItemIcon>
              My Account
            </MenuItem>

            <MenuItem
              component={RouterLink}
              to="/"
              onClick={handleAccountMenuClose}
            >
              <ListItemIcon>
                <HomeOutlined fontSize="small" />
              </ListItemIcon>
              View Site
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <LogoutOutlined fontSize="small" color="error" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default SellerHeader;
