// src/features/shopping/components/ProductGrid.tsx
import { Box, Typography, Alert } from "@mui/material"; // Thêm Alert
import { AnimatePresence, motion } from "framer-motion";

import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import type { FrontendProduct } from "../../../types/product";

interface ProductGridProps {
  products: FrontendProduct[];
  isLoading: boolean;
  error?: string | null; // <-- Thêm prop error
}

const ProductGrid = ({ products, isLoading, error }: ProductGridProps) => {
  // 1. Hiển thị Skeletons (Ưu tiên hàng đầu)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from(new Array(8)).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 2. Hiển thị lỗi (Nếu không loading và có lỗi)
  if (error) {
    return (
      <Alert
        severity="error"
        sx={{
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
        }}
      >
        {error}
      </Alert>
    );
  }

  // 3. Hiển thị "Không tìm thấy sản phẩm" (Nếu không loading, không lỗi, và mảng rỗng)
  if (products.length === 0) {
    return (
      <Box className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">
        <Typography variant="h6" className="font-semibold">
          No Products Found
        </Typography>
        <Typography className="text-text-secondary">
          Try adjusting your filters or search terms.
        </Typography>
      </Box>
    );
  }

  // 4. Hiển thị lưới sản phẩm
  return (
    <AnimatePresence>
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {products.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductGrid;
