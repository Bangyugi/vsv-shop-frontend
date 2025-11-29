import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import WishlistItemCard from "../components/WishlistItemCard";
import EmptyWishlist from "../components/EmptyWishlist";

import type {
  WishlistItemFE,
  WishlistApiProduct,
} from "../../../types/wishlist";
import { useWishlist } from "../../../contexts/WishlistContext";
import { useCart } from "../../../contexts/CartContext";

const WishlistPage = () => {
  const {
    wishlistData,
    isInitialLoading: isLoading,
    error,
    removeFromWishlist,
  } = useWishlist();
  const { addToCart } = useCart();
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const items = useMemo((): WishlistItemFE[] => {
    if (!wishlistData?.products) {
      return [];
    }
    return wishlistData.products.map((product: WishlistApiProduct) => ({
      id: product.id,
      name: product.title,
      price: product.sellingPrice,
      image: product.images?.[0] || "/placeholder.png",
      variants: product.variants,
    }));
  }, [wishlistData]);

  const handleRemove = async (productId: number) => {
    await removeFromWishlist(productId);
  };

  const handleAddToCart = async (item: WishlistItemFE) => {
    setAddingToCartId(item.id);
    const defaultVariant = item.variants?.[0];

    if (!defaultVariant) {
      console.error("No variants found for this wishlist item.");
      await addToCart(0, 0);
    } else {
      await addToCart(defaultVariant.id, 1);
    }
    setAddingToCartId(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box className="flex justify-center items-center min-h-[50vh]">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert
          severity="error"
          sx={{ my: 4, mx: "auto", maxWidth: "lg", py: 2 }}
        >
          {error}
        </Alert>
      );
    }

    if (items.length === 0) {
      return <EmptyWishlist />;
    }

    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Box className="flex flex-col sm:flex-row justify-between items-center mb-6 text-center sm:text-left">
            <Box>
              <Typography variant="h4" component="h1" className="font-bold">
                Your Wishlist
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {items.length} item{items.length > 1 ? "s" : ""} you love ❤️
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/"
              variant="outlined"
              color="primary"
              sx={{ mt: { xs: 2, sm: 0 }, borderRadius: "50px" }}
            >
              Continue Shopping
            </Button>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          <AnimatePresence>
            {items.map((item, index) => (
              <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                <WishlistItemCard
                  item={item}
                  onRemove={handleRemove}
                  onAddToCart={() => handleAddToCart(item)}
                  isAddingToCart={addingToCartId === item.id}
                  index={index}
                />
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      </>
    );
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        py: { xs: 4, md: 8 },
        minHeight: "80vh",
      }}
    >
      <Container maxWidth="lg">{renderContent()}</Container>
    </Box>
  );
};

export default WishlistPage;
