// src/features/admin/components/AdminHeader.tsx
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
  AdminPanelSettingsOutlined,
  HomeOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import { Link as RouterLink } from "react-router-dom";
import { useNotification } from "../../../contexts/NotificationContext";

interface AdminHeaderProps {
  drawerWidth: number;
  handleDrawerToggle: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  drawerWidth,
  handleDrawerToggle,
}) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotification();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const openNotif = Boolean(notifAnchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleNotificationClick = (id: number) => {
    markAsRead(id);
    handleNotifClose();
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
          <IconButton color="inherit" onClick={handleNotifOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
          <IconButton color="inherit">
            <SettingsOutlined />
          </IconButton>

          <IconButton
            onClick={handleMenuOpen}
            size="small"
            sx={{ ml: 1 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar
              src={user?.avatar}
              alt={user?.firstName || "Admin"}
              sx={{ width: 40, height: 40 }}
            />
          </IconButton>

          {/* Menu Notifications cho Admin */}
          <Menu
            anchorEl={notifAnchorEl}
            open={openNotif}
            onClose={handleNotifClose}
            PaperProps={{
              elevation: 0,
              sx: {
                width: 360,
                maxHeight: 480,
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
                mt: 1.5,
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
            <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                System Notifications
              </Typography>
            </Box>
            <List sx={{ p: 0, maxHeight: 400, overflowY: "auto" }}>
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <ListItem
                    key={notif.id}
                    button
                    component={notif.link ? RouterLink : "div"}
                    to={notif.link || "#"}
                    onClick={() => handleNotificationClick(notif.id)}
                    sx={{
                      bgcolor: notif.isRead ? "inherit" : "action.hover",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "secondary.main" }}>
                        <InfoOutlined />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={notif.message}
                      secondary={new Date(notif.createdAt).toLocaleString()}
                      primaryTypographyProps={{
                        variant: "body2",
                        fontWeight: notif.isRead ? "normal" : "bold",
                      }}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No notifications"
                    sx={{ textAlign: "center", py: 3, color: "text.secondary" }}
                  />
                </ListItem>
              )}
            </List>
          </Menu>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
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
              to="/admin"
              onClick={handleMenuClose}
            >
              <ListItemIcon>
                <AdminPanelSettingsOutlined fontSize="small" />
              </ListItemIcon>
              Admin Dashboard
            </MenuItem>

            <MenuItem
              component={RouterLink}
              to="/profile?tab=account"
              onClick={handleMenuClose}
            >
              <ListItemIcon>
                <AccountCircleOutlined fontSize="small" />
              </ListItemIcon>
              My Account
            </MenuItem>

            <MenuItem component={RouterLink} to="/" onClick={handleMenuClose}>
              <ListItemIcon>
                <HomeOutlined fontSize="small" />
              </ListItemIcon>
              View Site
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsOutlined fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>

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

export default AdminHeader;
