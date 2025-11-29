import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Box,
  Rating,
  Tooltip,
  CircularProgress, // <-- THÊM
} from "@mui/material";
import { motion } from "framer-motion";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite"; // <-- THÊM
import type { FrontendProduct } from "../../../types/product"; // <-- THAY ĐỔI TYPE
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react"; // <-- THÊM
import { useCart } from "../../../contexts/CartContext"; // <-- THÊM
import { useWishlist } from "../../../contexts/WishlistContext"; // <-- THÊM

interface SearchProductCardProps {
  product: FrontendProduct; // <-- THAY ĐỔI TYPE
  formatCurrency: (amount: number) => string;
}

const SearchProductCard = ({
  product,
  formatCurrency,
}: SearchProductCardProps) => {
  // --- THÊM LOGIC CONTEXT ---
  const { isLoading: isCartLoading, addToCart } = useCart();
  const {
    isProductInWishlist,
    addToWishlist,
    removeFromWishlist,
    isUpdating: isWishlistUpdating,
  } = useWishlist();

  const [isAddingThis, setIsAddingThis] = useState(false);
  const [isAddingThisToWishlist, setIsAddingThisToWishlist] = useState(false);
  const isFavorite = isProductInWishlist(product.id);

  const isCartAdding = isCartLoading && isAddingThis;
  const isWishlistAdding = isWishlistUpdating && isAddingThisToWishlist;
  const isLocalLoading = isCartAdding || isWishlistAdding;

  const handleAddToCartClick = async (
    event: React.MouseEvent,
    action: "cart" | "wishlist"
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLocalLoading) return;

    if (action === "cart") {
      const defaultVariant = product.variants?.[0];
      if (!defaultVariant) {
        console.error("No variants found for this product.");
        await addToCart(0, 0); // Trigger lỗi
        return;
      }
      setIsAddingThis(true);
      await addToCart(defaultVariant.id, 1);
      setIsAddingThis(false);
    }
  };

  const handleWishlistClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLocalLoading) return;

    setIsAddingThisToWishlist(true);
    if (isFavorite) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
    setIsAddingThisToWishlist(false);
  };
  // --- KẾT THÚC LOGIC CONTEXT ---

  return (
    <RouterLink
      to={`/product/${product.id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        height: "100%",
      }}
    >
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
              transform: "translateY(-4px)",
            },
            transition: "box-shadow 0.3s ease, transform 0.3s ease",
          }}
        >
          <Box sx={{ position: "relative", pt: "100%" }}>
            <CardMedia
              component="img"
              image={product.image}
              alt={product.name}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            <Typography
              gutterBottom
              variant="body2"
              component="div"
              className="font-semibold"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={product.name} // <-- THÊM: Tooltip cho tên dài
            >
              {product.name}
            </Typography>
            <Box className="flex items-center justify-between">
              <Typography
                variant="body1"
                color="primary.main"
                className="font-bold"
              >
                {formatCurrency(product.discountPrice || product.price)}
              </Typography>
              <Rating
                name="read-only"
                value={product.rating}
                precision={0.5}
                readOnly
                size="small"
              />
            </Box>

            {product.discountPrice && product.price > product.discountPrice && (
              <Typography
                variant="caption"
                className="text-text-secondary line-through"
              >
                {formatCurrency(product.price)}
              </Typography>
            )}
            <Box className="flex items-center justify-between mt-1">
              <Typography variant="caption" color="text.secondary">
                Đã bán: {product.sold}
              </Typography>
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: "space-around", p: 1, pt: 0 }}>
            <Tooltip title="Add to Cart">
              <IconButton
                aria-label="add to cart"
                onClick={(e) => handleAddToCartClick(e, "cart")}
                disabled={isLocalLoading}
              >
                {isCartAdding ? (
                  <CircularProgress size={20} color="primary" />
                ) : (
                  <ShoppingCartOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip
              title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            >
              <IconButton
                aria-label="add to wishlist"
                onClick={handleWishlistClick}
                disabled={isLocalLoading}
              >
                {isWishlistAdding ? (
                  <CircularProgress size={20} color="error" />
                ) : isFavorite ? (
                  <FavoriteIcon color="error" />
                ) : (
                  <FavoriteBorderOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>
          </CardActions>
        </Card>
      </motion.div>
    </RouterLink>
  );
};

export default SearchProductCard;
