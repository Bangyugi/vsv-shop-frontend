import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import ProductCard from "./ProductCard";
import * as productService from "../../../services/productService";
import type { FrontendProduct } from "../../../types/product";
import { mapApiProductToShoppingProduct } from "../../../types/product";

const PromotionSection = () => {
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await productService.getProducts({
          pageNo: 1,
          pageSize: 10,
          sortBy: "discountPercent",
          sortDir: "DESC",
        });

        if (response.code === 200 && response.data) {
          const saleProducts = response.data.pageContent
            .filter((p) => p.discountPercent > 0)
            .map(mapApiProductToShoppingProduct);
          setProducts(saleProducts);
        } else {
          throw new Error(response.message || "Failed to fetch sale products");
        }
      } catch (err: any) {
        console.error("Error fetching sale products:", err);

        if (err.message && err.message.includes("sort field")) {
          setError(
            "Could not sort by discount. Displaying general products instead or feature unavailable."
          );
        } else {
          setError(
            err.message ||
              "Could not load sale products. Please try again later."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  const renderProductGrid = () => {
    if (isLoading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: 200, my: 3 }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="warning" sx={{ my: 3 }}>
          {error}
        </Alert>
      );
    }

    if (products.length === 0) {
      return (
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ my: 3 }}
        >
          No discounted products found at this time.
        </Typography>
      );
    }

    const displayProducts = products.slice(0, 8);

    return (
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {displayProducts.map((product, index) => (
          <Grid item xs={12} sm={6} md={3} key={product.id}>
            <RouterLink
              to={`/product/${product.id}`}
              style={{
                textDecoration: "none",
                display: "block",
                height: "100%",
              }}
            >
              <ProductCard product={product} index={index} />
            </RouterLink>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box
      className="select-none"
      sx={{
        bgcolor: "primary.light",
        color: "text.primary",
        py: 8,
        my: 8,
      }}
    >
      <Container maxWidth="lg">
        {" "}
        <Typography
          variant="h4"
          component="h2"
          className="text-center font-bold"
          sx={{ color: "secondary.dark" }}
        >
          🔥 SALE UP TO 50% OFF 🔥
        </Typography>
        <Typography className="text-center mt-2" color="text.secondary">
          Limited Time Offer - Grab Yours Now!
        </Typography>
        {renderProductGrid()}
        {!isLoading && !error && products.length > 0 && (
          <Box textAlign="center" sx={{ mt: 5 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/shop?sort=discount_desc"
              sx={{ borderRadius: "50px", px: 5 }}
            >
              Explore All Sale Items
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PromotionSection;
