import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material"; // FIX: Xóa import useTheme, useMediaQuery
import { Outlet } from "react-router-dom";
import SellerSidebar from "../components/SellerSidebar.tsx";
import SellerHeader from "../components/SellerHeader.tsx";

import { SellerNotificationProvider } from "../../../contexts/SellerNotificationContext.tsx";

const DRAWER_WIDTH = 260;

const SellerLayout: React.FC = () => {
  // FIX: Xóa các biến theme, isMobile không sử dụng
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <SellerNotificationProvider>
      <Box
        sx={{
          display: "flex",
          bgcolor: "background.default",
          minHeight: "100vh",
        }}
      >
        <CssBaseline />

        <SellerHeader
          drawerWidth={DRAWER_WIDTH}
          handleDrawerToggle={handleDrawerToggle}
        />

        <SellerSidebar
          drawerWidth={DRAWER_WIDTH}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
            mt: "64px",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </SellerNotificationProvider>
  );
};

export default SellerLayout;