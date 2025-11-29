// src/features/wishlist/pages/WishlistPage.tsx
import { useMemo, useState } from "react"; // <-- THÊM useState
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  // Snackbar, // <-- XÓA
  Alert,
  CircularProgress, // Đã có
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import WishlistItemCard from "../components/WishlistItemCard";
import EmptyWishlist from "../components/EmptyWishlist";

// --- Thay đổi Imports ---
// import * as wishlistService from "../../../services/wishlistService"; // <-- XÓA
import type {
  WishlistItemFE,
  WishlistApiProduct,
} from "../../../types/wishlist";
import { useWishlist } from "../../../contexts/WishlistContext"; // <-- THÊM
import { useCart } from "../../../contexts/CartContext"; // <-- THÊM
// --- Kết thúc thay đổi Imports ---

const WishlistPage = () => {
  // --- State mới (Sử dụng Context) ---
  const {
    wishlistData,
    isInitialLoading: isLoading,
    error,
    removeFromWishlist,
    // fetchWishlist, // Có thể dùng để "refresh" nếu cần
  } = useWishlist();
  // --- THÊM: State từ CartContext và loading local ---
  const { addToCart } = useCart();
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  // --- Kết thúc State mới ---

  // --- Map dữ liệu từ context ---
  const items = useMemo((): WishlistItemFE[] => {
    if (!wishlistData?.products) {
      return [];
    }
    return wishlistData.products.map((product: WishlistApiProduct) => ({
      id: product.id,
      name: product.title,
      price: product.sellingPrice,
      image: product.images?.[0] || "/placeholder.png",
      variants: product.variants, // <-- THÊM: Lấy variants
    }));
  }, [wishlistData]);
  // --- Kết thúc map ---

  // --- Xóa useEffect fetch ---

  // --- Cập nhật handleRemove ---
  const handleRemove = async (productId: number) => {
    // Context sẽ tự động cập nhật UI và hiển thị snackbar
    await removeFromWishlist(productId);
  };

  // --- Cập nhật handleAddToCart ---
  const handleAddToCart = async (item: WishlistItemFE) => {
    setAddingToCartId(item.id);
    const defaultVariant = item.variants?.[0];

    if (!defaultVariant) {
      console.error("No variants found for this wishlist item.");
      // Gọi context với ID 0 để trigger lỗi (context sẽ hiển thị snackbar)
      await addToCart(0, 0);
    } else {
      // Gọi context với variantId và số lượng 1
      await addToCart(defaultVariant.id, 1);
    }
    setAddingToCartId(null);
  };

  // Xóa handleCloseSnackbar

  // --- Hàm render nội dung (Cập nhật) ---
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
        {/* --- Tiêu đề trang --- */}
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

        {/* --- Lưới sản phẩm --- */}
        <Grid container spacing={3}>
          <AnimatePresence>
            {items.map((item, index) => (
              <Grid
                item
                key={item.id}
                xs={12}
                sm={6}
                md={4}
                lg={3} // 4 sản phẩm/hàng trên desktop lớn
              >
                <WishlistItemCard
                  item={item} // item giờ là WishlistItemFE
                  onRemove={handleRemove}
                  onAddToCart={() => handleAddToCart(item)} // <-- CẬP NHẬT
                  isAddingToCart={addingToCartId === item.id} // <-- THÊM
                  index={index}
                />
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      </>
    );
  };
  // --- Kết thúc render nội dung ---

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        py: { xs: 4, md: 8 },
        minHeight: "80vh",
      }}
    >
      <Container maxWidth="lg">{renderContent()}</Container>

      {/* --- XÓA Snackbar --- */}
    </Box>
  );
};

export default WishlistPage;
