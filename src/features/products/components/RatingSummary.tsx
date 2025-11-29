import { useMemo } from "react";
import { Box, Typography, Rating, LinearProgress } from "@mui/material";
import type { ProductReview } from "../../../types";

interface RatingSummaryProps {
  reviews: ProductReview[];
}

const RatingSummary = ({ reviews }: RatingSummaryProps) => {
  const { averageRating, distribution } = useMemo(() => {
    if (reviews.length === 0) {
      return { averageRating: 0, distribution: [0, 0, 0, 0, 0] };
    }
    const ratingCounts = [0, 0, 0, 0, 0];
    let totalRating = 0;
    reviews.forEach((review) => {
      totalRating += review.rating;
      if (review.rating >= 1 && review.rating <= 5) {
        ratingCounts[review.rating - 1]++;
      }
    });
    const average = totalRating / reviews.length;
    const distributionPercentages = ratingCounts
      .map((count) => (count / reviews.length) * 100)
      .reverse();
    return { averageRating: average, distribution: distributionPercentages };
  }, [reviews]);

  return (
    <Box>
      <Typography variant="h6" className="font-semibold mb-3">
        Rating Overview
      </Typography>
      <Box className="flex items-center gap-4 mb-4">
        <Typography
          variant="h2"
          className="font-bold"
          sx={{ color: "primary.main" }}
        >
          {averageRating.toFixed(1)}
        </Typography>
        <Box>
          <Rating value={averageRating} precision={0.1} readOnly size="large" />
          <Typography color="text.secondary">
            ({reviews.length} reviews)
          </Typography>
        </Box>
      </Box>

      <Box className="space-y-2">
        {distribution.map((percentage, index) => {
          const starLabel = 5 - index;
          return (
            <Box key={starLabel} className="flex items-center gap-2">
              <Typography
                variant="body2"
                className="w-12"
                color="text.secondary"
              >
                {starLabel} star{starLabel > 1 ? "s" : ""}
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{ height: 8, borderRadius: "4px" }}
                />
              </Box>
              <Typography
                variant="body2"
                className="w-10 text-right"
                color="text.secondary"
              >
                {Math.round(percentage)}%
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default RatingSummary;
