import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import {
  DashboardOutlined,
  Inventory2Outlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  HomeOutlined,
  ShowChartOutlined,
  StoreOutlined,
} from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

interface SellerSidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const navItems = [
  { text: "Dashboard", icon: <DashboardOutlined />, path: "/seller" },
  {
    text: "My Products",
    icon: <Inventory2Outlined />,
    path: "/seller/products",
  },
  { text: "My Orders", icon: <ShoppingCartOutlined />, path: "/seller/orders" },
  {
    text: "Analytics",
    icon: <ShowChartOutlined />,
    path: "/seller/analytics",
  },
  { text: "Store Profile", icon: <StoreOutlined />, path: "/seller/profile" },
];

const SellerSidebar: React.FC<SellerSidebarProps> = ({
  drawerWidth,
  mobileOpen,
  handleDrawerToggle,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const drawerContent = (
    <div>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: [1],
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontFamily: "'Pacifico', cursive",
            fontStyle: "italic",
            color: "primary.main",
            fontSize: "1.75rem",
          }}
        >
          VSV Seller
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ p: 1.5 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.path === "/seller"}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: "8px",
                "&.active": {
                  bgcolor: "primary.main",
                  color: "white",
                  "& .MuiListItemIcon-root": {
                    color: "white",
                  },
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 2 }} />
      <List sx={{ p: 1.5 }}>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/"
            onClick={handleDrawerToggle}
            sx={{ borderRadius: "8px" }}
          >
            <ListItemIcon>
              <HomeOutlined />
            </ListItemIcon>
            <ListItemText primary="View Site" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: "8px", color: "error.main" }}
          >
            <ListItemIcon>
              <LogoutOutlined color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderRight: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default SellerSidebar;
