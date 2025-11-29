import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";

import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { ArrowBack, StorefrontOutlined } from "@mui/icons-material";

import ProductImages from "../components/ProductImages";
import ProductInfo from "../components/ProductInfo";
import ProductDescriptionTabs from "../components/ProductDescriptionTabs";
import RelatedProducts from "../components/RelatedProducts";
import type { ProductDetail } from "../../../types";
import ProductReviewSection from "../components/ProductReviewSection";

import * as productService from "../../../services/productService";
import type {
  ApiProduct,
  FrontendProduct,
  ApiVariant,
} from "../../../types/product";
import { mapApiProductToShoppingProduct } from "../../../types/product";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const mapApiProductToProductDetail = (
  apiProduct: ApiProduct
): ProductDetail => {
  const colors = [
    ...new Set(apiProduct.variants?.map((v) => v.color) || []),
  ].filter(Boolean);
  const sizes = [
    ...new Set(apiProduct.variants?.map((v) => v.size) || []),
  ].filter(Boolean);

  const sellerInfo = apiProduct.seller
    ? {
        id: apiProduct.seller.user.id,
        name:
          apiProduct.seller.businessDetails?.businessName ||
          apiProduct.seller.user.username,
        avatar: apiProduct.seller.user.avatar || "/default-avatar.png",
      }
    : undefined;

  return {
    id: apiProduct.id,
    name: apiProduct.title,
    sku:
      apiProduct.variants && apiProduct.variants.length > 0
        ? apiProduct.variants[0].sku.split("-")[0]
        : `VSV-${apiProduct.category.name.toUpperCase()}-${apiProduct.id
            .toString()
            .padStart(3, "0")}`,
    price: apiProduct.price,
    discountPrice: apiProduct.sellingPrice,
    images:
      apiProduct.images.length > 0 ? apiProduct.images : ["/placeholder.png"],
    rating: apiProduct.averageRating || 0,
    reviewCount: apiProduct.numRatings || 0,
    shortDescription:
      apiProduct.description.substring(0, 150) +
      (apiProduct.description.length > 150 ? "..." : ""),
    longDescription: apiProduct.description,
    colors: colors,
    sizes: sizes,
    careInstructions:
      "Care instructions not available. Please check product label.",
    shippingPolicy:
      "Free shipping for orders over $100. Easy returns within 30 days. Please keep product tags intact for returns.",
    category: apiProduct.category.name,
    sold: apiProduct.totalSold || 0,
    variants:
      apiProduct.variants?.map((v: ApiVariant) => ({
        id: v.id,
        color: v.color,
        size: v.size,
        quantity: v.quantity,
        sku: v.sku,
      })) || [],
    seller: sellerInfo,
  };
};

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [productData, setProductData] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<FrontendProduct[]>([]);

  const numericProductId = useMemo(() => {
    const id = Number(productId);
    return isNaN(id) ? null : id;
  }, [productId]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      if (!numericProductId) {
        setError("Product ID is invalid.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setProductData(null);

      try {
        const response = await productService.getProductById(numericProductId);
        // --- SỬA LỖI (image_45bf16.png): Thêm kiểm tra response.data ---
        if (response.code === 200 && response.data) {
          // Gán vào biến mới để TypeScript hiểu là non-null
          const productApiData = response.data;
          const mappedData = mapApiProductToProductDetail(productApiData);
          setProductData(mappedData);

          let categoryForRelatedSearch = productApiData.category;

          if (
            categoryForRelatedSearch.level === 3 &&
            categoryForRelatedSearch.parentCategory
          ) {
            categoryForRelatedSearch = categoryForRelatedSearch.parentCategory;
          }
          if (
            categoryForRelatedSearch.level === 2 &&
            categoryForRelatedSearch.parentCategory
          ) {
            categoryForRelatedSearch = categoryForRelatedSearch.parentCategory;
          }

          const relatedCategoryId = categoryForRelatedSearch.id;

          try {
            const relatedResponse = await productService.getProducts({
              categoryId: relatedCategoryId,
              pageSize: 6,
              pageNo: 1,
            });
            // Thêm kiểm tra cho relatedResponse.data
            if (relatedResponse.code === 200 && relatedResponse.data) {
              const related = relatedResponse.data.pageContent
                .filter((p) => p.id !== productApiData.id) // Sử dụng biến non-null
                .slice(0, 5)
                .map(mapApiProductToShoppingProduct);
              setRelatedProducts(related);
            }
          } catch (relatedError) {
            console.error("Failed to fetch related products:", relatedError);
          }
        } else {
          throw new Error(response.message || "Product not found");
        }
        // --- KẾT THÚC SỬA LỖI ---
      } catch (err: any) {
        console.error("Error fetching product details:", err);
        setError(err.message || "An error occurred while loading the product.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [numericProductId]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !productData || !numericProductId) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1" className="font-bold">
          {error ? "Error Loading Product" : "404 - Product Not Found"}
        </Typography>
        <Typography color="text.secondary" className="mt-2">
          {error
            ? error
            : `Sorry, we couldn't find the product with ID "${productId}".`}
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
          sx={{ mt: 3 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 3, md: 6 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
          sx={{ mb: 2, color: "text.secondary", fontWeight: 600 }}
        >
          Back
        </Button>

        <Grid container spacing={{ xs: 3, md: 6, lg: 8 }}>
          <Grid item xs={12} sm={7} md={5} lg={5}>
            <ProductImages images={productData.images} />
          </Grid>
          <Grid item xs={12} md={7} lg={7}>
            <ProductInfo
              product={productData}
              formatCurrency={formatCurrency}
            />
          </Grid>
        </Grid>

        <Box sx={{ my: { xs: 5, md: 8 } }}>
          <ProductDescriptionTabs product={productData} />
        </Box>

        {productData.seller && (
          <Box sx={{ my: { xs: 5, md: 8 } }}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderRadius: "12px",
                bgcolor: "background.paper",
                maxWidth: "100%",
                mx: "auto",
              }}
            >
              <Avatar
                src={productData.seller.avatar}
                alt={productData.seller.name}
                sx={{ width: 56, height: 56 }}
              />
              <Box flexGrow={1}>
                <Typography variant="body2" color="text.secondary">
                  Sold by
                </Typography>
                <Typography variant="h6" className="font-bold">
                  {productData.seller.name}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<StorefrontOutlined />}
                component={RouterLink}
                to={`/shop?sellerId=${productData.seller.id}`}
                sx={{ borderRadius: "20px", whiteSpace: "nowrap" }}
              >
                Visit Store
              </Button>
            </Paper>
          </Box>
        )}

        <ProductReviewSection productId={numericProductId} />

        <Box sx={{ my: { xs: 5, md: 8 } }}>
          <RelatedProducts products={relatedProducts} />
        </Box>
      </Container>
    </motion.div>
  );
};

export default ProductDetailPage;
