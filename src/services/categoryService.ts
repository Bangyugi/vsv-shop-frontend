import api from "../api/axios";
import type { GetCategoriesResponse, ApiCategory } from "../types/category";
import type { ApiResponse } from "../types";

export const getCategories = (): Promise<GetCategoriesResponse> => {
  return api
    .get<GetCategoriesResponse>("/api/categories")
    .then((res) => res.data);
};

export const getLevel3Subcategories = (
  parentCategoryId: number
): Promise<ApiResponse<ApiCategory[]>> => {
  return api
    .get<ApiResponse<ApiCategory[]>>(
      `/api/categories/${parentCategoryId}/level3-subcategories`
    )
    .then((res) => res.data);
};