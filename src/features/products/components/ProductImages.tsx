import { useState } from "react";
import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

interface ProductImagesProps {
  images: string[];
}

const ProductImages = ({ images }: ProductImagesProps) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <Box className="flex flex-col">
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "120%",
          overflow: "hidden",
          borderRadius: "12px",
          bgcolor: "background.paper",
        }}
        className="shadow-sm border border-gray-100"
      >
        <AnimatePresence>
          <motion.img
            key={selectedImage}
            src={selectedImage}
            alt="Sản phẩm chính"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            className="transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </AnimatePresence>
      </Box>

      <Box className="flex flex-row justify-center gap-2 mt-4">
        {images.map((image, index) => (
          <Box
            key={index}
            component="img"
            src={image}
            alt={`Thumbnail ${index + 1}`}
            onClick={() => setSelectedImage(image)}
            sx={{
              width: "80px",
              height: "100px",
              objectFit: "cover",
              cursor: "pointer",
              borderRadius: "8px",
              border: "2px solid",
              borderColor:
                selectedImage === image ? "primary.main" : "transparent",
              opacity: selectedImage === image ? 1 : 0.7,
              transition: "all 0.3s ease",
              "&:hover": {
                opacity: 1,
                transform: "scale(1.05)",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ProductImages;
