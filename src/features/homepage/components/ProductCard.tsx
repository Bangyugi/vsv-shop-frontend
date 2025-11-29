import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";

import { useCart } from "../../../contexts/CartContext";
import type { FrontendProduct } from "../../../types/product";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

interface ProductCardProps {
  product: Pick<
    FrontendProduct,
    "id" | "name" | "price" | "discountPrice" | "image" | "sold" | "variants"
  >;

  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const { isLoading: isCartLoading, addToCart } = useCart();

  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultVariant = product.variants?.[0];

    if (!defaultVariant) {
      console.error("No variants found for this product.");
      await addToCart(0, 0);
      return;
    }

    await addToCart(defaultVariant.id, 1);
  };

  const displayPrice = product.discountPrice || product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        sx={{
          width: "100%",
          boxShadow: "none",
          border: "1px solid #eee",
          paddingBottom: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardMedia
          component="img"
          image={product.image}
          alt={product.name}
          sx={{
            width: "100%",
            aspectRatio: "1/1",
            objectFit: "cover",
          }}
        />
        <CardContent className="text-center">
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              width: "100%",
            }}
          >
            {product.name}
          </Typography>
          <Typography
            variant="body1"
            color="text.primary"
            className="font-semibold"
          >
            {formatCurrency(displayPrice)}
          </Typography>
          {/* --- THÊM KHỐI NÀY --- */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Đã bán: {product.sold}
          </Typography>
          {/* --- KẾT THÚC KHỐI THÊM --- */}
        </CardContent>
        {/* --- CẬP NHẬT: Card Actions --- */}
        <CardActions className="justify-center" sx={{ pb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={handleAddToCartClick}
            disabled={isCartLoading}
          >
            {isCartLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Add to Cart"
            )}
          </Button>
        </CardActions>
        {/* --- KẾT THÚC CẬP NHẬT --- */}
      </Card>
    </motion.div>
  );
};

export default ProductCard;
