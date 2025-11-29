import api from "../api/axios";
import type { GetCategoriesResponse, ApiCategory } from "../types/category";
import type { ApiResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getCategories = (): Promise<GetCategoriesResponse> => {
  return api
    .get<GetCategoriesResponse>(`${BASE_URL}/api/categories`)
    .then((res) => res.data);
};

export const getLevel3Subcategories = (
  parentCategoryId: number
): Promise<ApiResponse<ApiCategory[]>> => {
  return api
    .get<ApiResponse<ApiCategory[]>>(
      `${BASE_URL}/api/categories/${parentCategoryId}/level3-subcategories`
    )
    .then((res) => res.data);
};
