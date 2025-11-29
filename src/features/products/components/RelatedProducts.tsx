// src/features/products/components/RelatedProducts.tsx
import { Container, Typography, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ProductCard from "../../homepage/components/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import type { FrontendProduct } from "../../../types/product";

interface RelatedProductsProps {
  products: FrontendProduct[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
  // --- SỬA LỖI: Chỉ bật loop khi có đủ slide ---
  // slidesPerView lớn nhất trong breakpoints là 5.
  // Chúng ta chỉ nên bật loop nếu số lượng sản phẩm LỚN HƠN 5.
  const maxSlidesPerView = 5;
  const enableLoop = products.length > maxSlidesPerView;
  // --- KẾT THÚC SỬA LỖI ---

  return (
    <Box className="select-none">
      <Container maxWidth="xl" disableGutters>
        <Typography
          variant="h4"
          component="h2"
          className="text-center font-bold"
          sx={{ marginBottom: "40px" }}
        >
          Related Products
        </Typography>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          // --- SỬA LỖI: Sử dụng biến enableLoop ---
          loop={enableLoop}
          // --- KẾT THÚC SỬA LỖI ---
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
            1536: { slidesPerView: maxSlidesPerView }, // Dùng biến
          }}
        >
          {products.map((product, index) => (
            <SwiperSlide
              key={product.id}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                height: "auto",
              }}
            >
              <RouterLink
                to={`/product/${product.id}`}
                style={{ textDecoration: "none", width: "100%" }}
              >
                <Box sx={{ width: "100%", maxWidth: 320, margin: "0 auto" }}>
                  <ProductCard product={product} index={index} />
                </Box>
              </RouterLink>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </Box>
  );
};

export default RelatedProducts;
