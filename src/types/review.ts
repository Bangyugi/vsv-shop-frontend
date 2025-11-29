import type { ApiResponse } from "./index";
import type { UserData } from "./auth";

/**
 * Cấu trúc của một review item trả về từ API
 * (Dựa trên /api/reviews/products/{productId} - pageContent)
 */
export interface ApiProductReview {
  id: number;
  reviewText: string;
  rating: number;
  productImages: string[];
  user: UserData;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cấu trúc dữ liệu phân trang cho API reviews
 * (Dựa trên /api/reviews/products/{productId} - data)
 */
export interface ApiReviewPageData {
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  pageContent: ApiProductReview[];
}

/**
 * Kiểu dữ liệu response đầy đủ cho API GET reviews
 */
export type GetProductReviewsResponse = ApiResponse<ApiReviewPageData>;

/**
 * Dữ liệu gửi đi khi TẠO review (dựa trên request mẫu)
 */
export interface CreateReviewRequest {
  reviewText: string;
  rating: number;
  productImages?: string[];
}

/**
 * Kiểu dữ liệu response khi TẠO review
 * (Giả định trả về review vừa tạo)
 */
export type CreateReviewResponse = ApiResponse<ApiProductReview>;
