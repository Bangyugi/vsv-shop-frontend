import api from "../api/axios";
import type {
  GetProductReviewsResponse,
  CreateReviewRequest,
  CreateReviewResponse,
} from "../types/review";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://vsv-shop-backend-production.up.railway.app";

export const getProductReviews = (
  productId: number,
  pageNo: number,
  pageSize: number
): Promise<GetProductReviewsResponse> => {
  return api
    .get<GetProductReviewsResponse>(
      `${BASE_URL}/api/reviews/products/${productId}`,
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
    .post<CreateReviewResponse>(`${BASE_URL}/api/reviews/${productId}`, data)
    .then((res) => res.data);
};

export const createReviewForOrderItem = (
  orderItemId: number,
  data: CreateReviewRequest
): Promise<CreateReviewResponse> => {
  return api
    .post<CreateReviewResponse>(
      `${BASE_URL}/api/reviews/order-item/${orderItemId}`,
      data
    )
    .then((res) => res.data);
};
