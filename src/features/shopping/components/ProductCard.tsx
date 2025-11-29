import { useState } from "react";
import {
  Box,
  Typography,
  Rating,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import {
  ShoppingCartOutlined,
  Favorite,
  FavoriteBorder,
  VisibilityOutlined,
} from "@mui/icons-material";
import type { FrontendProduct } from "../../../types/product";

import { useCart } from "../../../contexts/CartContext";
import { useWishlist } from "../../../contexts/WishlistContext";

interface ProductCardProps {
  product: FrontendProduct;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const { isLoading: isCartLoading, addToCart } = useCart();
  const [isAddingThis, setIsAddingThis] = useState(false);

  const {
    isProductInWishlist,
    addToWishlist,
    removeFromWishlist,
    isUpdating: isWishlistUpdating,
  } = useWishlist();
  const isFavorite = isProductInWishlist(product.id);
  const [isAddingThisToWishlist, setIsAddingThisToWishlist] = useState(false);
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCartLoading || isWishlistUpdating) return;

    setIsAddingThisToWishlist(true);
    if (isFavorite) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
    setIsAddingThisToWishlist(false);
  };

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultVariant = product.variants?.[0];

    if (!defaultVariant) {
      console.error("No variants found for this product.");

      await addToCart(0, 0);
      return;
    }

    setIsAddingThis(true);
    await addToCart(defaultVariant.id, 1);
    setIsAddingThis(false);
  };

  const isCartAdding = isCartLoading && isAddingThis;
  const isWishlistAdding = isWishlistUpdating && isAddingThisToWishlist;

  const isLocalLoading = isCartAdding || isWishlistAdding;

  return (
    <RouterLink
      to={`/product/${product.id}`}
      className="block text-inherit no-underline h-full"
    >
      <motion.div
        className="relative h-full w-full overflow-hidden rounded-lg border border-gray-200 bg-white flex flex-col"
        style={{
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{
          y: -5,
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Box
          className="relative w-full aspect-square overflow-hidden rounded-t-lg"
          sx={{
            position: "relative",
            display: "block",
          }}
        >
        
          <motion.img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />

          <Tooltip
            title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
            arrow
          >
 
            <IconButton
              size="small"
              onClick={handleFavoriteClick}
              disabled={isLocalLoading || isWishlistUpdating || isCartLoading}
              className="absolute left-2 top-2 z-20 !bg-white/70 backdrop-blur-sm"
            >
       
              {isWishlistAdding ? (
                <CircularProgress size={20} color="error" />
              ) : isFavorite ? (
                <Favorite
                  className="!text-error"
                  sx={{ transition: "all 0.2s ease" }}
                />
              ) : (
                <FavoriteBorder sx={{ transition: "all 0.2s ease" }} />
              )}
                    </IconButton>
          </Tooltip>

          {product.discountPrice && product.price > product.discountPrice && (
            <Box className="absolute right-2 top-2 z-20 rounded bg-primary p-1 text-xs font-bold text-white">
              -
              {Math.round(
                ((product.price - product.discountPrice) / product.price) * 100
              )}
              %
            </Box>
          )}

          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  variant="contained"
                  startIcon={<VisibilityOutlined />}
                  className="!bg-white !text-text-primary hover:!bg-gray-100"
                  disabled={
                    isLocalLoading || isWishlistUpdating || isCartLoading
                  }
                >
                  View Details
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        <Box className="flex flex-col p-3 flex-grow">
          <Typography
            variant="body1"
            className="mb-1 overflow-hidden overflow-ellipsis whitespace-nowrap font-semibold"
            title={product.name}
          >
            {product.name}
          </Typography>
          <Box className="mb-2 flex items-baseline gap-2">
            <Typography variant="h6" className="font-bold !text-primary">
              {formatCurrency(product.discountPrice || product.price)}
            </Typography>
                       {product.discountPrice && product.price > product.discountPrice && (
              <Typography
                variant="body2"
                className="text-text-secondary line-through"
              >
                {formatCurrency(product.price)}
              </Typography>
            )}
          </Box>
          <Box className="mt-auto flex items-center justify-between">
            <Box className="flex items-center gap-1">
              <Rating
                value={product.rating}
                precision={0.5}
                readOnly
                size="small"
              />
              <Typography variant="caption" className="text-text-secondary">
                ({product.sold} sold) 
              </Typography>
            </Box>
            <Tooltip title="Add to cart" arrow>
              <IconButton
                size="small"
                onClick={handleAddToCartClick}
                disabled={isLocalLoading || isWishlistUpdating || isCartLoading} 
                className="!bg-primary/10 hover:!bg-primary/20"
              >
                {isCartAdding ? (
                  <CircularProgress size={20} className="!text-primary" />
                ) : (
                  <ShoppingCartOutlined className="!text-primary" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>
    </RouterLink>
  );
};

export default ProductCard;
