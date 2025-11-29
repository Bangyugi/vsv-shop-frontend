import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { SellOutlined } from "@mui/icons-material";
import * as productService from "../../../../services/productService";
import type { ApiProduct } from "../../../../types/product";
import { Link as RouterLink } from "react-router-dom";

interface TopProductItem {
  id: number;
  name: string;
  sales: number;
  image: string;
}

const TopProductList: React.FC = () => {
  const [products, setProducts] = useState<TopProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await productService.getProducts({
          pageNo: 1,
          pageSize: 3,
          sortBy: "totalSold",
          sortDir: "DESC",
        });

        if (response.code === 200 && response.data) {
          const topProducts = response.data.pageContent.map(
            (p: ApiProduct) => ({
              id: p.id,
              name: p.title,

              sales: p.totalSold || 0,

              image: p.images?.[0] || "/placeholder.png",
            })
          );
          setProducts(topProducts);
        } else {
          throw new Error(response.message || "Failed to fetch top products");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Box>
      );
    }

    if (products.length === 0) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Typography color="text.secondary">
            No top selling products found.
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ p: 0, flexGrow: 1, overflowY: "auto" }}>
        {products.map((product, index) => (
          <React.Fragment key={product.id}>
            <ListItem sx={{ px: 0 }}>
              <Avatar
                src={product.image}
                alt={product.name}
                variant="rounded"
                sx={{ width: 48, height: 48, mr: 2, border: "1px solid #eee" }}
              />
              <ListItemText
                primary={
                  <Typography className="font-semibold">
                    {index + 1}. {product.name}
                  </Typography>
                }
                secondaryTypographyProps={{ component: "div" }}
                secondary={
                  <Box className="flex items-center">
                    <SellOutlined
                      fontSize="small"
                      sx={{ mr: 0.5, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {product.sales} units sold
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            {index < products.length - 1 && (
              <Divider component="li" sx={{ my: 1 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "12px",
        height: 400,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" className="font-bold" sx={{ mb: 3 }}>
        Top Selling Products
      </Typography>

      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>{renderContent()}</Box>

      <Box sx={{ mt: 2, textAlign: "right" }}>
        <Button
          size="small"
          variant="text"
          color="primary"
          component={RouterLink}
          to="/admin/products"
        >
          View All Products
        </Button>
      </Box>
    </Paper>
  );
};

export default TopProductList;
