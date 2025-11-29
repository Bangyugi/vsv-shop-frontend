// src/services/categoryService.ts
import api from "../api/axios";
import type { GetCategoriesResponse, ApiCategory } from "../types/category"; // Assuming ApiCategory is here
import type { ApiResponse } from "../types"; // Assuming ApiResponse is in types/index.ts

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Lấy danh sách tất cả categories.
 * Endpoint: GET /api/categories
 */
export const getCategories = (): Promise<GetCategoriesResponse> => {
  return api
    .get<GetCategoriesResponse>(`${BASE_URL}/api/categories`)
    .then((res) => res.data);
};

// --- HÀM MỚI ---
/**
 * Lấy danh sách các category cấp 3 con của một category cha (cấp 1 hoặc 2).
 * Endpoint: GET /api/categories/{parentCategoryId}/level3-subcategories
 */
export const getLevel3Subcategories = (
  parentCategoryId: number
): Promise<ApiResponse<ApiCategory[]>> => {
  // Assuming the response structure is ApiResponse<ApiCategory[]>
  return api
    .get<ApiResponse<ApiCategory[]>>(
      `${BASE_URL}/api/categories/${parentCategoryId}/level3-subcategories`
    )
    .then((res) => res.data);
};
// --- KẾT THÚC HÀM MỚI ---
