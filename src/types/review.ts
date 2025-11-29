import type { ApiResponse } from "./index";
import type { UserData } from "./auth";

export interface ApiProductReview {
  id: number;
  reviewText: string;
  rating: number;
  productImages: string[];
  user: UserData;
  createdAt: string;
  updatedAt: string;
}

export interface ApiReviewPageData {
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  pageContent: ApiProductReview[];
}

export type GetProductReviewsResponse = ApiResponse<ApiReviewPageData>;

export interface CreateReviewRequest {
  reviewText: string;
  rating: number;
  productImages?: string[];
}

export type CreateReviewResponse = ApiResponse<ApiProductReview>;
