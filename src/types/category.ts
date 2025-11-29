import type { ApiResponse } from "./index";

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

export interface CreateCategoryRequest {
  name: string;
  parentCategoryId: number | null;
}

export type UpdateCategoryRequest = CreateCategoryRequest;

export type CategoryApiResponse = ApiResponse<ApiCategory>;
