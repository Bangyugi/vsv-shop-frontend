import api from "../api/axios";
import type {
  GetProductReviewsResponse,
  CreateReviewRequest,
  CreateReviewResponse,
} from "../types/review";

export const getProductReviews = (
  productId: number,
  pageNo: number,
  pageSize: number
): Promise<GetProductReviewsResponse> => {
  return api
    .get<GetProductReviewsResponse>(
      `/api/reviews/products/${productId}`,
      {
        params: {
          pageNo: pageNo,
          pageSize: pageSize,
        },
      }
    )
    .then((res) => res.data);
};

export const createReview = (
  productId: number,
  data: CreateReviewRequest
): Promise<CreateReviewResponse> => {
  return api
    .post<CreateReviewResponse>(`/api/reviews/${productId}`, data)
    .then((res) => res.data);
};

export const createReviewForOrderItem = (
  orderItemId: number,
  data: CreateReviewRequest
): Promise<CreateReviewResponse> => {
  return api
    .post<CreateReviewResponse>(
      `/api/reviews/order-item/${orderItemId}`,
      data
    )
    .then((res) => res.data);
};