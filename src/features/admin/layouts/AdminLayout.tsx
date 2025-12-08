import React, { useState } from "react";
import { Box, CssBaseline, useTheme, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const DRAWER_WIDTH = 260;

const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <CssBaseline />

      {/* Header */}
      <AdminHeader
        drawerWidth={DRAWER_WIDTH}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Sidebar */}
      <AdminSidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: "64px",
        }}
      >
        {/* Outlet sẽ render các page con (Dashboard, Users, Products...) */}
        <Outlet />
      </Box>
    </Box>
  );
};
// Update UI 
export default AdminLayout;
