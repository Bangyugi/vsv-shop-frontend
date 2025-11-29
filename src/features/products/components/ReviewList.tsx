import {
  Box,
  Typography,
  Avatar,
  Rating,
  Divider,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import type { ProductReview } from "../../../types";

interface ReviewListProps {
  reviews: ProductReview[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

const ReviewList = ({
  reviews,
  onLoadMore,
  hasMore,
  isLoading,
}: ReviewListProps) => {
  if (reviews.length === 0 && !isLoading) {
    return (
      <Typography className="text-center" color="text.secondary">
        There are no reviews for this product yet.
      </Typography>
    );
  }

  return (
    <Box>
      <Box className="space-y-5">
        {reviews.map((review, index) => (
          <Box key={review.id}>
            {index > 0 && <Divider sx={{ my: 4 }} />}
            <Grid container spacing={2}>
              <Grid item xs={2} sm={1}>
                <Avatar
                  src={review.avatar}
                  alt={review.user}
                  sx={{
                    bgcolor: "primary.light",
                    color: "primary.dark",
                    width: 48,
                    height: 48,
                  }}
                >
                  {review.avatar ? null : review.user.charAt(0)}
                </Avatar>
              </Grid>
              <Grid item xs={10} sm={11}>
                <Typography variant="subtitle1" className="font-semibold">
                  {review.user}
                </Typography>
                <Box className="flex items-center gap-3 my-1">
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(review.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mt: 1.5, lineHeight: 1.7 }}>
                  {review.comment}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Box>

      {hasMore && (
        <Box className="text-center mt-6">
          <Button
            variant="outlined"
            size="large"
            onClick={onLoadMore}
            disabled={isLoading}
            sx={{ borderRadius: "50px", px: 5, py: 1.5 }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Show more reviews"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ReviewList;
