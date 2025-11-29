import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Pagination, Autoplay } from "swiper/modules";

import * as productService from "../../../services/productService";
import type { FrontendProduct } from "../../../types/product";
import { mapApiProductToShoppingProduct } from "../../../types/product";

const NewArrivals = () => {
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewestProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await productService.getProducts({
          pageNo: 1,
          pageSize: 10,
          sortBy: "createdAt",
          sortDir: "DESC",
        });

        if (response.code === 200 && response.data) {
          const fetchedProducts = response.data.pageContent.map(
            mapApiProductToShoppingProduct
          );
          setProducts(fetchedProducts);
        } else {
          throw new Error(response.message || "Failed to fetch new arrivals");
        }
      } catch (err: any) {
        console.error("Error fetching new arrivals:", err);
        setError(
          err.message || "Could not load products. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewestProducts();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ height: 300 }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ my: 3 }}>
          {error}
        </Alert>
      );
    }

    if (products.length === 0) {
      return (
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ my: 3 }}
        >
          No new products found at this time.
        </Typography>
      );
    }

    return (
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        loop={products.length > 4}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
      >
        {/* Cập nhật vòng lặp để dùng state `products` */}
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
            {/* Thêm RouterLink để click vào sản phẩm */}
            <RouterLink
              to={`/product/${product.id}`}
              style={{ textDecoration: "none", width: "100%" }}
            >
              <Box sx={{ width: "100%", maxWidth: 320 }}>
                {/* --- THAY ĐỔI: Truyền thẳng product --- */}
                <ProductCard product={product} index={index} />
                {/* --- KẾT THÚC THAY ĐỔI --- */}
              </Box>
            </RouterLink>
          </SwiperSlide>
        ))}
      </Swiper>
    );
  };

  return (
    <Box className="select-none" sx={{ bgcolor: "background.default", py: 8 }}>
      <Container>
        <Typography
          variant="h4"
          component="h2"
          className="text-center font-bold"
          sx={{ marginBottom: "20px" }}
        >
          New Arrivals
        </Typography>
        {/* 6. Gọi hàm renderContent */}
        {renderContent()}
      </Container>
    </Box>
  );
};

export default NewArrivals;
