// src/types/category.ts
import type { ApiResponse } from "./index"; // <-- SỬA LỖI IMPORT

export interface ApiCategory {
  id: number;
  name: string;
  parentCategory: ApiCategory | null;
  level: number;
}

export type GetCategoriesResponse = ApiResponse<ApiCategory[]>;

export interface MegaMenuCategory {
  id: number;
  name: string;
  children: MegaMenuCategory[];
}

export type MegaMenuData = Record<string, MegaMenuCategory[]>;

/**
 * Dữ liệu gửi đi khi TẠO category
 * (Backend nói Category liên kết với Seller và có 3 cấp,
 * nhưng không nói rõ API. Giả định API admin/categories)
 */
export interface CreateCategoryRequest {
  name: string;
  parentCategoryId: number | null;
}

/**
 * Dữ liệu gửi đi khi CẬP NHẬT category
 */
export type UpdateCategoryRequest = CreateCategoryRequest;

export type CategoryApiResponse = ApiResponse<ApiCategory>;
