import { useState } from "react";
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

interface ReviewFormProps {
  onSubmit: (data: { rating: number; reviewText: string }) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const ReviewForm = ({
  onSubmit,
  isSubmitting = false,
  submitError = null,
}: ReviewFormProps) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
    if (!comment.trim()) {
      setError("Please enter your review comment.");
      return;
    }
    onSubmit({ rating, reviewText: comment });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      className="flex flex-col h-full"
    >
      <Typography
        variant="h6"
        className="font-semibold "
        sx={{ marginBottom: "10px" }}
      >
        Write Your Review
      </Typography>

      <Box className="mb-4">
        <Typography
          component="legend"
          variant="body2"
          sx={{ marginBottom: "5px" }}
        >
          1. How would you rate this product? *
        </Typography>
        <Rating
          name="user-rating"
          value={rating}
          onChange={(_event, newValue) => {
            setRating(newValue);
            if (newValue) setError("");
          }}
          size="large"
          readOnly={isSubmitting}
        />
      </Box>

      <Box className="mb-4 flex-grow">
        <Typography
          component="legend"
          variant="body2"
          sx={{ marginBottom: "5px" }}
        >
          2. Write your comment *
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="The product is amazing..."
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (e.target.value.trim()) setError("");
          }}
          disabled={isSubmitting}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
            },
          }}
        />
      </Box>

      {(error || submitError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || submitError}
        </Alert>
      )}

      <Box className="text-right">
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={
            isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SendOutlinedIcon />
            )
          }
          disabled={isSubmitting}
          sx={{
            borderRadius: "50px",
            fontWeight: "bold",
            px: 4,
            py: 1.5,
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewForm;
