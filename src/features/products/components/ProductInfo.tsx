// src/features/products/components/ProductInfo.tsx
import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Rating,
  Button,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Divider,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import type { ProductDetail } from "../../../types";
import { Add, Remove } from "@mui/icons-material";

// --- Import useCart ---
import { useCart } from "../../../contexts/CartContext";
// --- Import useWishlist ---
import { useWishlist } from "../../../contexts/WishlistContext";

interface ProductInfoProps {
  product: ProductDetail;
  formatCurrency: (amount: number) => string;
}

const ProductInfo = ({ product, formatCurrency }: ProductInfoProps) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { isLoading: isCartLoading, addToCart } = useCart();

  const {
    isProductInWishlist,
    addToWishlist,
    removeFromWishlist,
    isUpdating: isWishlistUpdating,
  } = useWishlist();
  const isFavorited = isProductInWishlist(product.id);
  const [isAddingThisToWishlist, setIsAddingThisToWishlist] = useState(false);

  const [localError, setLocalError] = useState<string | null>(null);

  const allVariants = product.variants || [];

  const allColors = product.colors;
  const allSizes = product.sizes;

  const availableSizes = useMemo(() => {
    if (!selectedColor) {
      return allSizes;
    }

    return allSizes.filter((size) =>
      allVariants.some(
        (variant) => variant.color === selectedColor && variant.size === size
      )
    );
  }, [selectedColor, allVariants, allSizes]);

  const availableColors = useMemo(() => {
    if (!selectedSize) {
      return allColors;
    }

    return allColors.filter((color) =>
      allVariants.some(
        (variant) => variant.size === selectedSize && variant.color === color
      )
    );
  }, [selectedSize, allVariants, allColors]);

  const handleColorChange = (colorName: string) => {
    const newSelectedColor = selectedColor === colorName ? null : colorName;
    setSelectedColor(newSelectedColor);
    setLocalError(null);

    if (newSelectedColor) {
      const isSizeCompatible = allVariants.some(
        (variant) =>
          variant.color === newSelectedColor && variant.size === selectedSize
      );
      if (selectedSize && !isSizeCompatible) {
        setSelectedSize(null);
      }
    }
  };

  const handleSizeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newSize: string | null
  ) => {
    setSelectedSize(newSize);
    setLocalError(null);

    if (newSize) {
      const isColorCompatible = allVariants.some(
        (variant) => variant.size === newSize && variant.color === selectedColor
      );
      if (selectedColor && !isColorCompatible) {
        setSelectedColor(null);
      }
    }
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
  };

  const handleBlur = () => {
    if (!quantity) {
      setQuantity(1);
    }
  };

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCartClick = async () => {
    setLocalError(null);

    if (!selectedColor || !selectedSize) {
      setLocalError("Please select a color and size.");
      return;
    }

    const selectedVariant = product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    if (!selectedVariant) {
      setLocalError(
        "This combination of color and size is not available. Please try another one."
      );
      return;
    }

    if (selectedVariant.quantity < quantity) {
      setLocalError(
        `Only ${selectedVariant.quantity} items in stock for this variant.`
      );
      return;
    }

    await addToCart(selectedVariant.id, quantity);
  };

  const handleWishlistClick = async () => {
    if (isWishlistUpdating) return;

    setIsAddingThisToWishlist(true);
    if (isFavorited) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
    setIsAddingThisToWishlist(false);
  };

  const isWishlistAdding = isWishlistUpdating && isAddingThisToWishlist;

  const isOverallLoading = isCartLoading || isWishlistAdding;

  return (
    <Box
      className="flex flex-col"
      sx={{
        position: "sticky",
        top: 100,
        pr: { md: 4 },
        zIndex: 10,
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        className="font-bold tracking-tight"
        sx={{
          fontSize: { xs: "2rem", md: "2.5rem" },
          lineHeight: 1.2,
        }}
      >
        {product.name}
      </Typography>

      {/* ... (SKU, Rating, Price... giữ nguyên) ... */}
      <Typography
        variant="body2"
        color="text.secondary"
        className="tracking-widest"
        sx={{ marginTop: "10px" }}
      >
        {product.sku}
      </Typography>

      <Box className="flex items-center gap-2 mt-3">
        <Rating
          name="read-only"
          value={product.rating}
          precision={0.5}
          readOnly
        />
        <Typography variant="body2" color="text.secondary">
          ({product.reviewCount} reviews)
        </Typography>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Sold: {product.sold}
        </Typography>
      </Box>

      <Box className="flex items-baseline gap-3 my-4">
        <Typography
          variant="h4"
          className="font-bold"
          sx={{ color: "primary.main" }}
        >
          {formatCurrency(product.discountPrice)}
        </Typography>
        <Typography
          variant="h6"
          className="font-medium line-through"
          color="text.secondary"
        >
          {formatCurrency(product.price)}
        </Typography>
      </Box>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ marginBottom: "10px" }}
      >
        {product.shortDescription}
      </Typography>

      {/* --- XÓA: KHỐI THÔNG TIN SELLER ĐÃ BỊ XÓA KHỎI ĐÂY --- */}

      {/* --- CẬP NHẬT: Phần chọn Màu (Loại bỏ nút Reset) --- */}
      <Box className="mb-5">
        <Typography
          variant="subtitle1"
          className="font-semibold "
          sx={{ marginBottom: "5px" }}
        >
          Color
        </Typography>
        {/* --- XÓA: Box justify-between và Nút Reset --- */}
        <Box className="flex flex-wrap gap-2">
          {allColors.map((colorName) => {
            const isSelected = selectedColor === colorName;

            const isDisabled = !availableColors.includes(colorName);

            return (
              <Chip
                key={colorName}
                label={colorName}
                onClick={() => handleColorChange(colorName)}
                variant={isSelected ? "filled" : "outlined"}
                color={isSelected ? "primary" : "default"}
                disabled={isDisabled}
                sx={{
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  fontWeight: isSelected ? 600 : 400,
                  "&.MuiChip-colorPrimary": {
                    color: "white",
                  },

                  "&.Mui-disabled": {
                    opacity: 0.5,
                    textDecoration: isDisabled ? "line-through" : "none",
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>
      {/* --- KẾT THÚC CẬP NHẬT --- */}

      {/* --- CẬP NHẬT: Phần chọn Size (Giữ nguyên, logic đã đúng) --- */}
      <Box className="mb-6">
        <Typography
          variant="subtitle1"
          className="font-semibold"
          sx={{ marginBottom: "10px" }}
        >
          Size
        </Typography>
        <ToggleButtonGroup
          value={selectedSize}
          exclusive
          onChange={handleSizeChange}
          aria-label="Size selection"
        >
          {allSizes.map((size) => {
            const isDisabled = !availableSizes.includes(size);
            return (
              <ToggleButton
                key={size}
                value={size}
                aria-label={size}
                disabled={isDisabled}
                sx={{
                  width: "50px",
                  height: "50px",
                  fontWeight: "bold",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },

                  "&.Mui-disabled": {
                    opacity: 0.5,
                    textDecoration: isDisabled ? "line-through" : "none",
                  },
                }}
              >
                {size}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Box>
      {/* --- KẾT THÚC CẬP NHẬT --- */}

      {/* ... (Phần chọn Quantity giữ nguyên, cập nhật disable) ... */}
      <Box className="mb-6">
        <Typography
          variant="subtitle1"
          className="font-semibold"
          sx={{ marginBottom: "10px" }}
        >
          Quantity
        </Typography>
        <Box className="flex items-center">
          <IconButton
            onClick={decrement}
            aria-label="decrease quantity"
            disabled={isOverallLoading || isWishlistUpdating}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "50%",
              color: "text.secondary",
            }}
          >
            <Remove />
          </IconButton>
          <TextField
            value={quantity}
            onChange={handleQuantityChange}
            onBlur={handleBlur}
            type="number"
            disabled={isOverallLoading || isWishlistUpdating}
            inputProps={{
              min: 1,
              style: {
                textAlign: "center",
                width: "50px",
                padding: "10px 0",
              },
            }}
            sx={{
              mx: 1,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
              },
              "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button":
                {
                  "-webkit-appearance": "none",
                  margin: 0,
                },
              "& input[type=number]": {
                "-moz-appearance": "textfield",
              },
            }}
          />
          <IconButton
            onClick={increment}
            aria-label="increase quantity"
            disabled={isOverallLoading || isWishlistUpdating}
            sx={{
              border: "1px solid",
              borderColor: "primary.main",
              bgcolor: "primary.main",
              color: "white",
              borderRadius: "50%",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            <Add />
          </IconButton>
        </Box>
      </Box>

      {/* --- CẬP NHẬT: Nút Add to Cart --- */}
      <Box className="flex items-center gap-3">
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={
            isCartLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <ShoppingCartOutlinedIcon />
            )
          }
          disabled={isOverallLoading || isWishlistUpdating}
          onClick={handleAddToCartClick}
          sx={{
            flexGrow: 1,
            height: "56px",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "50px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "scale(1.02)",
              boxShadow: (theme) =>
                `0 4px 15px ${theme.palette.primary.main}40`,
            },
          }}
        >
          {isCartLoading ? "Adding..." : "Add to Cart"}
        </Button>
        {/* --- CẬP NHẬT: Nút Wishlist --- */}
        <IconButton
          aria-label="Add to wishlist"
          onClick={handleWishlistClick}
          disabled={isOverallLoading || isWishlistUpdating}
          sx={{
            height: "56px",
            width: "56px",
            border: "1px solid",
            borderColor: "divider",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "error.main",
              color: "error.main",
            },
          }}
        >
          {isWishlistAdding ? (
            <CircularProgress size={24} color="error" />
          ) : isFavorited ? (
            <FavoriteIcon
              color="error"
              sx={{ transition: "transform 0.2s ease-in-out" }}
            />
          ) : (
            <FavoriteBorderOutlinedIcon
              sx={{ transition: "transform 0.2s ease-in-out" }}
            />
          )}
        </IconButton>
      </Box>

      {/* Snackbar cho lỗi local (giữ nguyên zIndex đã thêm) */}
      <Snackbar
        open={!!localError}
        autoHideDuration={4000}
        onClose={() => setLocalError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ zIndex: (theme) => theme.zIndex.snackbar }}
      >
        <Alert
          onClose={() => setLocalError(null)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {localError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductInfo;
