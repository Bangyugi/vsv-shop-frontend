// src/services/reviewService.ts
import api from "../api/axios";
import type {
  GetProductReviewsResponse,
  CreateReviewRequest,
  CreateReviewResponse,
} from "../types/review";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Lấy danh sách review của sản phẩm (có phân trang)
 * Endpoint: GET /api/reviews/products/{productId}
 */
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

/**
 * Gửi một review mới cho sản phẩm (Sử dụng Product ID).
 * @deprecated Endpoint này có thể không còn được dùng.
 * Sử dụng createReviewForOrderItem thay thế.
 * Endpoint: POST /api/reviews/{productId}
 * @param productId ID của sản phẩm
 * @param data Dữ liệu review
 */
export const createReview = (
  productId: number,
  data: CreateReviewRequest
): Promise<CreateReviewResponse> => {
  return api
    .post<CreateReviewResponse>(`${BASE_URL}/api/reviews/${productId}`, data)
    .then((res) => res.data);
};

// --- HÀM MỚI ---
/**
 * Gửi một review mới cho một Order Item cụ thể (đã mua).
 * Endpoint: POST /api/reviews/order-item/{orderItemId}
 * @param orderItemId ID của Order Item
 * @param data Dữ liệu review
 */
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
// --- KẾT THÚC HÀM MỚI ---
