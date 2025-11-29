import React, { useState, useEffect } from "react";
import { Box, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import {
  AttachMoneyOutlined,
  ShoppingCartOutlined,
  PeopleAltOutlined,
  ShowChartOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";

import RevenueChart from "../components/charts/RevenueChart";
import TopProductList from "../components/charts/TopProductList";

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

const initialStats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    icon: <AttachMoneyOutlined />,
    color: "primary.main",
  },
  {
    title: "New Orders (Last 30 Days)",
    value: "2,350",
    icon: <ShoppingCartOutlined />,
    color: "secondary.main",
  },
  {
    title: "New Customers (Last 30 Days)",
    value: "+1,830",
    icon: <PeopleAltOutlined />,
    color: "error.main",
  },
  {
    title: "Yearly Growth Rate",
    value: "+15.6%",
    icon: <ShowChartOutlined />,
    color: "success.main",
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

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
        Dashboard Overview
      </Typography>

      {isLoading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="40vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Grid cho các thẻ thống kê */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {initialStats.map((stat) => (
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

          {/* Grid cho các biểu đồ */}
          <Grid container spacing={3}>
            {/* Biểu đồ doanh thu (Thay thế placeholder cũ) */}
            <Grid
              item
              xs={12}
              lg={8}
              component={motion.div}
              variants={itemVariants}
            >
              {/* --- SỬ DỤNG COMPONENT MỚI --- */}
              <RevenueChart />
              {/* --- KẾT THÚC SỬ DỤNG --- */}
            </Grid>

            {/* Top Products (Thay thế placeholder cũ) */}
            <Grid
              item
              xs={12}
              lg={4}
              component={motion.div}
              variants={itemVariants}
            >
              {/* --- SỬ DỤNG COMPONENT MỚI --- */}
              <TopProductList />
              {/* --- KẾT THÚC SỬ DỤNG --- */}
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
