// src/features/products/components/ProductReviewSection.tsx
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import type { ProductReview } from "../../../types";
import RatingSummary from "./RatingSummary";
// import ReviewForm from "./ReviewForm"; // <-- XÓA: Bỏ import form
import ReviewList from "./ReviewList";

import * as reviewService from "../../../services/reviewService";
import type { ApiProductReview } from "../../../types/review";

/**
 * Chuyển đổi dữ liệu review từ API sang kiểu dữ liệu ProductReview của Frontend
 */
const mapApiReviewToFrontend = (
  apiReview: ApiProductReview
): ProductReview => ({
  id: apiReview.id,
  user: `${apiReview.user.firstName} ${apiReview.user.lastName}`,
  avatar: apiReview.user.avatar || apiReview.user.firstName.charAt(0) || "A",
  rating: apiReview.rating,
  comment: apiReview.reviewText,
  date: apiReview.createdAt, // Dùng createdAt cho ngày review
});

const REVIEWS_PER_PAGE = 5; // Tải 5 review mỗi lần

interface ProductReviewSectionProps {
  productId: number; // Yêu cầu productId để fetch
}

const ProductReviewSection = ({ productId }: ProductReviewSectionProps) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // XÓA: Bỏ state submit review
  // const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      setError("Invalid Product ID.");
      return;
    }

    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await reviewService.getProductReviews(
          productId,
          1,
          REVIEWS_PER_PAGE
        );

        if (response.code === 200 && response.data) {
          const mapped = response.data.pageContent.map(mapApiReviewToFrontend);
          setReviews(mapped);
          setPage(1);
          setHasMore(response.data.totalPages > 1);
        } else {
          throw new Error(response.message || "Failed to fetch reviews");
        }
      } catch (err: any) {
        setError(err.message || "Could not load reviews.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;
    try {
      const response = await reviewService.getProductReviews(
        productId,
        nextPage,
        REVIEWS_PER_PAGE
      );
      if (response.code === 200 && response.data) {
        const newReviews = response.data.pageContent.map(
          mapApiReviewToFrontend
        );
        setReviews((prev) => [...prev, ...newReviews]);
        setPage(nextPage);
        setHasMore(response.data.totalPages > nextPage);
      } else {
        throw new Error(response.message || "Failed to load more reviews");
      }
    } catch (err: any) {
      setError(err.message || "Could not load more reviews.");
    } finally {
      setIsLoading(false);
    }
  };

  // XÓA: Bỏ hàm handleSubmitReview
  // const handleSubmitReview = (data: { rating: number; comment: string }) => { ... };

  return (
    <Box sx={{ my: { xs: 5, md: 8 } }}>
      <Box className="flex items-center gap-2 mb-6">
        <StarBorderOutlinedIcon
          sx={{ fontSize: "2.25rem", color: "primary.main" }}
        />
        <Typography
          variant="h4"
          component="h2"
          className="font-bold tracking-tight"
        >
          Product Reviews
        </Typography>
      </Box>

      {isLoading && reviews.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          {reviews.length > 0 && (
            <Grid
              container
              spacing={{ xs: 3, md: 5 }}
              justifyContent="flex-start" // <-- Căn giữa
            >
              <Grid item xs={12} md={8} lg={6}>
                <Paper
                  elevation={0}
                  variant="outlined"
                  sx={{
                    p: { xs: 2, md: 4 },
                    borderRadius: "12px",
                    height: "100%",
                  }}
                >
                  <RatingSummary reviews={reviews} />
                </Paper>
              </Grid>
            </Grid>
          )}

          <Box sx={{ mt: 6 }}>
            <ReviewList
              reviews={reviews}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
              isLoading={isLoading}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default ProductReviewSection;
