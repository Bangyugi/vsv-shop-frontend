import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Box,
} from "@mui/material";
import ReviewForm from "../../products/components/ReviewForm";

import type { CreateReviewRequest } from "../../../types/review";
import * as reviewService from "../../../services/reviewService";
import type { ApiOrderItem } from "../../../types/order";

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;

  orderItem: ApiOrderItem | null;

  onReviewSubmitted: () => void;
}

const ReviewDialog = ({
  open,
  onClose,
  orderItem,
  onReviewSubmitted,
}: ReviewDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (data: { rating: number; reviewText: string }) => {
    if (!orderItem) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const apiRequestData: CreateReviewRequest = {
      rating: data.rating,
      reviewText: data.reviewText,
      productImages: [],
    };

    try {
      const response = await reviewService.createReviewForOrderItem(
        orderItem.id,
        apiRequestData
      );

      if (response.code === 200 || response.code === 201) {
        onReviewSubmitted();
        onClose();
      } else {
        throw new Error(response.message || "Failed to submit review");
      }
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || err.message || "An error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        {isSubmitting
          ? "Submitting..."
          : `Write a review for: ${orderItem?.productTitle || "Product"}`}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {isSubmitting && !submitError ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: 300 }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <ReviewForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
