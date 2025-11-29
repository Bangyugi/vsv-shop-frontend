// src/features/wishlist/components/WishlistItemCard.tsx
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import type { WishlistItemFE } from "../../../types/wishlist";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

// --- THAY ĐỔI: Format sang USD ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
// --- KẾT THÚC THAY ĐỔI ---

interface WishlistItemCardProps {
  item: WishlistItemFE;

  onRemove: (id: number) => void;
  onAddToCart: () => void;
  index: number;
  isAddingToCart?: boolean;
}

const WishlistItemCard = ({
  item,
  onRemove,
  onAddToCart,
  index,
  isAddingToCart = false,
}: WishlistItemCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
      transition={{ duration: 0.5, delay: index * 0.05, type: "spring" }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <RouterLink
        to={`/product/${item.id}`}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "block",
          height: "100%",
        }}
      >
        <Card
          sx={{
            width: "100%",
            height: "100%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            border: "1px solid #eee",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <IconButton
            aria-label="Remove from wishlist"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(item.id);
            }}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 20,
              bgcolor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(4px)",
              "&:hover": {
                bgcolor: "rgba(255, 235, 238, 0.9)",
                color: "error.main",
              },
            }}
          >
            <DeleteOutline fontSize="small" />
          </IconButton>

          <Box
            sx={{
              position: "relative",
              width: "100%",
              aspectRatio: "1/1",
              overflow: "hidden",
            }}
          >
            <CardMedia
              component="img"
              image={item.image}
              alt={item.name}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* --- SỬA LỖI: Đã loại bỏ onClick={...} --- */}
                  <Button
                    variant="contained"
                    startIcon={<VisibilityOutlined />}
                    className="!bg-white !text-text-primary hover:!bg-gray-100"
                  >
                    View Details
                  </Button>
                  {/* --- KẾT THÚC SỬA LỖI --- */}
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          <CardContent className="text-center flex-grow">
            <Typography
              gutterBottom
              variant="h6"
              component="div"
              className="font-semibold"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.name}
            </Typography>
            <Typography
              variant="body1"
              color="primary.main"
              className="font-bold"
            >
              {formatCurrency(item.price)}
            </Typography>
          </CardContent>
          <CardActions className="justify-center pb-4 pt-0">
            <Button
              size="medium"
              variant="contained"
              color="primary"
              startIcon={
                isAddingToCart ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ShoppingCartOutlinedIcon />
                )
              }
              disabled={isAddingToCart}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart();
              }}
              sx={{
                borderRadius: "50px",
                fontWeight: 600,
                px: 3,
                marginBottom: "10px",
                minWidth: "140px",
              }}
            >
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          </CardActions>
        </Card>
      </RouterLink>
    </motion.div>
  );
};

export default WishlistItemCard;
