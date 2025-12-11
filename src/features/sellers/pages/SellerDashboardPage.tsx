import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  AttachMoneyOutlined,
  ShoppingCartOutlined,
  Inventory2Outlined,
  HourglassTopOutlined,
  Add,
  ListAlt,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import RevenueChart from "../components/charts/RevenueChart";
import TopProductList from "../components/charts/TopProductList";
import * as sellerService from "../../../services/sellerService";
import type { SellerDashboardData } from "../../../types/seller";

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
};

// Card component for displaying individual stats
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color: string;
  loading?: boolean;
}> = ({ title, value, icon, color, loading }) => (
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
      height: "100%",
    }}
  >
    <Box>
      <Typography color="text.secondary" sx={{ mb: 0.5, fontSize: "0.9rem" }}>
        {title}
      </Typography>
      {loading ? (
        <CircularProgress size={24} sx={{ mt: 1 }} color="inherit" />
      ) : (
        <Typography variant="h4" component="h2" className="font-bold">
          {value}
        </Typography>
      )}
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
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 30 } })}
    </Box>
  </Paper>
);

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
  const [dashboardData, setDashboardData] = useState<SellerDashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await sellerService.getSellerDashboardStats();
        if (response.code === 200 && response.data) {
          setDashboardData(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch dashboard data");
        }
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Could not load dashboard statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "My Total Revenue",
      value: dashboardData ? formatCurrency(dashboardData.totalRevenue) : "$0.00",
      icon: <AttachMoneyOutlined />,
      color: "primary.main",
    },
    {
      title: "My New Orders",
      value: dashboardData?.newOrders ?? 0,
      icon: <ShoppingCartOutlined />,
      color: "secondary.main",
    },
    {
      title: "Products in Stock",
      value: dashboardData?.productsInStock ?? 0,
      icon: <Inventory2Outlined />,
      color: "success.main",
    },
    {
      title: "Pending Orders",
      value: dashboardData?.pendingOrders ?? 0,
      icon: <HourglassTopOutlined />,
      color: "warning.main",
    },
  ];

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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
              loading={isLoading}
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          lg={8}
          component={motion.div}
          variants={itemVariants}
        >
          <RevenueChart 
            data={dashboardData?.revenueAnalytics || []} 
            isLoading={isLoading} 
          />
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
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
                    to="/seller/products"
                    fullWidth
                    sx={{ justifyContent: "flex-start", py: 1.2 }}
                  >
                    Add New Product
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ListAlt />}
                    component={RouterLink}
                    to="/seller/orders"
                    fullWidth
                    sx={{ justifyContent: "flex-start", py: 1.2 }}
                  >
                    View Pending Orders
                  </Button>
                </Stack>
              </Paper>
            </Grid>
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