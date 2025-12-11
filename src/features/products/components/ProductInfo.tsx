import { useState, useMemo, useEffect } from "react";
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

import { useCart } from "../../../contexts/CartContext";
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

  const allVariants = useMemo(() => product.variants || [], [product.variants]);

  const allColors = product.colors;
  const allSizes = product.sizes;

  // --- MỚI: Tính toán số lượng tồn kho dựa trên lựa chọn ---
  const currentStock = useMemo(() => {
    // Trường hợp 1: Đã chọn cả màu và size -> Lấy tồn kho của variant cụ thể
    if (selectedColor && selectedSize) {
      const variant = allVariants.find(
        (v) => v.color === selectedColor && v.size === selectedSize
      );
      return variant ? variant.quantity : 0;
    }

    // Trường hợp 2: Chưa chọn đủ -> Hiển thị tổng tồn kho của tất cả variants (hoặc variant theo màu/size đã chọn)
    let filteredVariants = allVariants;
    if (selectedColor) {
      filteredVariants = filteredVariants.filter(
        (v) => v.color === selectedColor
      );
    } else if (selectedSize) {
      filteredVariants = filteredVariants.filter(
        (v) => v.size === selectedSize
      );
    }
    
    return filteredVariants.reduce((total, v) => total + v.quantity, 0);
  }, [selectedColor, selectedSize, allVariants]);
  // ---------------------------------------------------------

  // Reset quantity về 1 khi đổi variant để tránh logic sai (ví dụ variant cũ max 10, variant mới max 5 đang chọn 8)
  useEffect(() => {
    setQuantity(1);
  }, [selectedColor, selectedSize]);

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
    let value = parseInt(event.target.value, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    } 
    // --- MỚI: Validate input không vượt quá tồn kho ---
    if (value > currentStock) {
      value = currentStock;
    }
    setQuantity(value);
  };

  const handleBlur = () => {
    if (!quantity) {
      setQuantity(1);
    }
  };

  // --- CẬP NHẬT: Increment không vượt quá currentStock ---
  const increment = () => {
    setQuantity((prev) => (prev < currentStock ? prev + 1 : prev));
  };
  
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

    // Nếu số lượng = 0 (hết hàng)
    if (selectedVariant.quantity === 0) {
      setLocalError("This item is currently out of stock.");
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
  const isOutOfStock = currentStock === 0;

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

      <Typography
        variant="body2"
        color="text.secondary"
        className="tracking-widest"
        sx={{ marginTop: "10px" }}
      >
        SKU: {product.sku}
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

      <Box className="mb-5">
        <Typography
          variant="subtitle1"
          className="font-semibold "
          sx={{ marginBottom: "5px" }}
        >
          Color
        </Typography>

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

      <Box className="mb-6">
        <Typography
          variant="subtitle1"
          className="font-semibold"
          sx={{ marginBottom: "10px" }}
        >
          Quantity
        </Typography>
        <Box className="flex items-center gap-4">
          <Box className="flex items-center">
            <IconButton
              onClick={decrement}
              aria-label="decrease quantity"
              disabled={isOverallLoading || isWishlistUpdating || quantity <= 1}
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
              disabled={isOverallLoading || isWishlistUpdating || isOutOfStock}
              inputProps={{
                min: 1,
                max: currentStock, // Giới hạn max trong input HTML
                style: {
                  textAlign: "center",
                  width: "50px",
                  padding: "10px 0",
                },
              }}
              sx={{
                mx: 1,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { border: "none" },
                  "&:hover fieldset": { border: "none" },
                  "&.Mui-focused fieldset": { border: "none" },
                },
                "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button":
                  { "-webkit-appearance": "none", margin: 0 },
                "& input[type=number]": { "-moz-appearance": "textfield" },
              }}
            />
            <IconButton
              onClick={increment}
              aria-label="increase quantity"
              // Disable nút tăng nếu đạt giới hạn tồn kho
              disabled={isOverallLoading || isWishlistUpdating || quantity >= currentStock}
              sx={{
                border: "1px solid",
                borderColor: "primary.main",
                bgcolor: "primary.main",
                color: "white",
                borderRadius: "50%",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "&.Mui-disabled": {
                  bgcolor: "action.disabledBackground",
                  borderColor: "action.disabledBackground",
                }
              }}
            >
              <Add />
            </IconButton>
          </Box>
          
          {/* --- MỚI: Hiển thị số lượng tồn kho --- */}
          <Typography variant="body2" color={isOutOfStock ? "error" : "text.secondary"}>
            {isOutOfStock 
              ? "Out of stock" 
              : `${currentStock} pieces available`}
          </Typography>
          {/* ------------------------------------- */}
        </Box>
      </Box>

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
          // Disable nút Add to Cart nếu hết hàng
          disabled={isOverallLoading || isWishlistUpdating || isOutOfStock}
          onClick={handleAddToCartClick}
          sx={{
            flexGrow: 1,
            height: "56px",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "50px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: !isOutOfStock ? "scale(1.02)" : "none",
              boxShadow: (theme) =>
                !isOutOfStock ? `0 4px 15px ${theme.palette.primary.main}40` : "none",
            },
          }}
        >
          {isCartLoading ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
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