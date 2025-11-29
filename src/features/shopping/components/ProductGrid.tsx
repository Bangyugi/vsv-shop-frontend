import { Box, Typography, Alert } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import type { FrontendProduct } from "../../../types/product";

interface ProductGridProps {
  products: FrontendProduct[];
  isLoading: boolean;
  error?: string | null;
}

const ProductGrid = ({ products, isLoading, error }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from(new Array(8)).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

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
