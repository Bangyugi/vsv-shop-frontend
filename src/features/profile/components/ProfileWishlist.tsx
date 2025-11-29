import { useMemo, useState } from "react"; // <-- THÊM useState
import { Grid, Typography, Box, CircularProgress, Alert } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import WishlistItemCard from "../../wishlist/components/WishlistItemCard";
import EmptyWishlist from "../../wishlist/components/EmptyWishlist";

import { motion } from "framer-motion";

import type {
  WishlistItemFE,
  WishlistApiProduct,
} from "../../../types/wishlist";
import { useWishlist } from "../../../contexts/WishlistContext";
// --- THÊM IMPORT ---
import { useCart } from "../../../contexts/CartContext";
// --- KẾT THÚC THÊM ---

const ProfileWishlist = () => {
  const {
    wishlistData,
    isInitialLoading: isLoading,
    error,
    removeFromWishlist,
  } = useWishlist();

  // --- THÊM STATE ---
  const { addToCart } = useCart();
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  // --- KẾT THÚC THÊM ---

  const items = useMemo((): WishlistItemFE[] => {
    if (!wishlistData?.products) {
      return [];
    }
    return wishlistData.products.map((product: WishlistApiProduct) => ({
      id: product.id,
      name: product.title,
      price: product.sellingPrice,
      image: product.images?.[0] || "/placeholder.png",
      variants: product.variants, // <-- THÊM DÒNG NÀY
    }));
  }, [wishlistData]);

  const handleRemove = async (productId: number) => {
    await removeFromWishlist(productId);
  };

  // --- CẬP NHẬT HÀM NÀY ---
  const handleAddToCart = async (item: WishlistItemFE) => {
    setAddingToCartId(item.id);
    const defaultVariant = item.variants?.[0];

    if (!defaultVariant) {
      console.error("No variants found for this wishlist item.");
      await addToCart(0, 0); // Trigger lỗi từ context
    } else {
      await addToCart(defaultVariant.id, 1);
    }
    setAddingToCartId(null);
  };
  // --- KẾT THÚC CẬP NHẬT ---

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography
        variant="h5"
        component="h2"
        className="font-bold "
        sx={{ mb: 6 }}
      >
        My Wishlist
      </Typography>

      {/* --- Hiển thị Loading --- */}
      {isLoading && (
        <Box className="flex justify-center items-center min-h-[300px]">
          <CircularProgress />
        </Box>
      )}

      {/* --- Hiển thị Lỗi --- */}
      {!isLoading && error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {/* --- Hiển thị danh sách hoặc Empty --- */}
      {!isLoading &&
        !error &&
        (items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {items.map((item, index) => (
                <Grid item key={item.id} xs={12} sm={6} md={4}>
                  {/* --- CẬP NHẬT PROPS --- */}
                  <WishlistItemCard
                    item={item}
                    onRemove={handleRemove}
                    onAddToCart={() => handleAddToCart(item)}
                    isAddingToCart={addingToCartId === item.id}
                    index={index}
                  />
                  {/* --- KẾT THÚC CẬP NHẬT --- */}
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        ))}

      {/* --- XÓA Snackbar --- */}
    </motion.div>
  );
};

export default ProfileWishlist;
