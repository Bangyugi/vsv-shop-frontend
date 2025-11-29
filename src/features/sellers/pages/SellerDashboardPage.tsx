// src/features/sellers/pages/SellerDashboardPage.tsx
import React from "react";
import { Box, Grid, Paper, Typography, Button, Stack } from "@mui/material";
import {
  AttachMoneyOutlined,
  ShoppingCartOutlined,
  Inventory2Outlined,
  HourglassTopOutlined,
  Add, // <-- THÊM
  ListAlt, // <-- THÊM
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom"; // <-- THÊM
// Import các biểu đồ đã sao chép
import RevenueChart from "../components/charts/RevenueChart";
import TopProductList from "../components/charts/TopProductList";

// Component thẻ thống kê (Giống hệt admin)
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactElement;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: "12px",
      border: "1px solid",
      borderColor: "divider",
    }}
  >
    <Box>
      <Typography color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h4" component="h2" className="font-bold">
        {value}
      </Typography>
    </Box>
    <Box
      sx={{
        bgcolor: color,
        color: "white",
        width: 60,
        height: 60,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 30 } })}
    </Box>
  </Paper>
);

// Dữ liệu giả cho Seller (Sẽ thay bằng API)
const stats = [
  {
    title: "My Total Revenue",
    value: "$12,875.00",
    icon: <AttachMoneyOutlined />,
    color: "primary.main",
  },
  {
    title: "My New Orders",
    value: "150",
    icon: <ShoppingCartOutlined />,
    color: "secondary.main",
  },
  {
    title: "Products in Stock",
    value: "89",
    icon: <Inventory2Outlined />,
    color: "success.main",
  },
  {
    title: "Pending Orders",
    value: "12",
    icon: <HourglassTopOutlined />,
    color: "warning.main",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SellerDashboardPage = () => {
  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Typography
        variant="h4"
        component="h1"
        className="font-bold"
        sx={{ mb: 4 }}
      >
        Seller Dashboard
      </Typography>

      {/* Grid cho các thẻ thống kê */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            key={stat.title}
            component={motion.div}
            variants={itemVariants}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </Grid>
        ))}
      </Grid>

      {/* Grid cho biểu đồ và Quick Actions */}
      <Grid container spacing={3}>
        {/* Biểu đồ doanh thu */}
        <Grid
          item
          xs={12}
          lg={8}
          component={motion.div}
          variants={itemVariants}
        >
          <RevenueChart />
        </Grid>

        {/* Quick Actions & Top Products */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* THÊM MỚI: Quick Actions */}
            <Grid item component={motion.div} variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="h6" className="font-bold" sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={RouterLink}
                    to="/seller/products" // Dẫn đến trang quản lý, nơi có nút Add
                  >
                    Add New Product
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ListAlt />}
                    component={RouterLink}
                    to="/seller/orders" // Dẫn đến trang đơn hàng
                  >
                    View Pending Orders
                  </Button>
                </Stack>
              </Paper>
            </Grid>
            {/* KẾT THÚC THÊM MỚI */}

            {/* Top Products */}
            <Grid item component={motion.div} variants={itemVariants}>
              <TopProductList />
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerDashboardPage;