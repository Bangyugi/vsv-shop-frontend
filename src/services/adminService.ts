import api from "../api/axios";

import type { ApiResponse } from "../types";
import type { UserData } from "../types/auth";

import type {
  ApiSellerData,
  SellerStatus,
  GetSellersResponse,
  UpdateSellerStatusResponse,
} from "../types/seller";

import type { ApiProduct, ProductPageData } from "../types/product";

import type {
  ApiCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/category";

import type {
  ApiOrderData,
  ApiOrderStatus,
  OrderPageData,
} from "../types/order";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://vsv-shop-backend-production.up.railway.app/api";

interface Page<T> {
  pageContent: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}
// hi ae
export const getUsers = async (
  page: number,
  size: number,
  keyword?: string,
  sortBy?: string,
  sortDir?: "ASC" | "DESC"
): Promise<ApiResponse<Page<UserData>>> => {
  return api
    .get<ApiResponse<Page<UserData>>>(`${BASE_URL}/admin/users`, {
      params: {
        pageNo: page,
        pageSize: size,
        keyword: keyword || undefined,
        sortBy: sortBy || "id",
        sortDir: sortDir || "ASC",
      },
    })
    .then((res) => res.data);
};

export const getUserById = (userId: number): Promise<ApiResponse<UserData>> => {
  return api
    .get<ApiResponse<UserData>>(`${BASE_URL}/admin/users/find/${userId}`)
    .then((res) => res.data);
};

export const deleteUser = (userId: number): Promise<ApiResponse<null>> => {
  return api
    .delete<ApiResponse<null>>(`${BASE_URL}/admin/users/delete/${userId}`)
    .then((res) => res.data);
};

export const getSellerById = (
  sellerUserId: number
): Promise<ApiResponse<ApiSellerData>> => {
  return api
    .get<ApiResponse<ApiSellerData>>(
      `${BASE_URL}/admin/sellers/${sellerUserId}`
    )
    .then((res) => res.data);
};

export const getSellers = async (
  page: number,
  size: number,
  statusFilter?: SellerStatus | "ALL",
  keyword?: string,
  sortBy?: string,
  sortDir?: "ASC" | "DESC"
): Promise<GetSellersResponse> => {
  return api
    .get<GetSellersResponse>(`${BASE_URL}/admin/sellers`, {
      params: {
        pageNo: page,
        pageSize: size,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        keyword: keyword || undefined,
        sortBy: sortBy || "createdAt",
        sortDir: sortDir || "ASC",
      },
    })
    .then((res) => res.data);
};

export const getPendingSellers = async (
  page: number,
  size: number,
  sortBy?: string,
  sortDir?: "ASC" | "DESC"
): Promise<GetSellersResponse> => {
  return api
    .get<GetSellersResponse>(`${BASE_URL}/admin/sellers/pending`, {
      params: {
        pageNo: page,
        pageSize: size,
        sortBy: sortBy || "createdAt",
        sortDir: sortDir || "ASC",
      },
    })
    .then((res) => res.data);
};

export const updateSellerStatus = async (
  sellerId: number,
  newStatus: SellerStatus
): Promise<UpdateSellerStatusResponse> => {
  const requestBody = { status: newStatus };
  return api
    .put<UpdateSellerStatusResponse>(
      `${BASE_URL}/admin/sellers/${sellerId}/status`,
      requestBody
    )
    .then((res) => res.data);
};

export const getAdminProducts = async (
  page: number,
  size: number,
  status?: "VISIBLE" | "HIDDEN" | "ALL",
  keyword?: string,
  sortBy?: string,
  sortDir?: "ASC" | "DESC"
): Promise<ApiResponse<ProductPageData>> => {
  return api
    .get<ApiResponse<ProductPageData>>(`${BASE_URL}/products`, {
      params: {
        pageNo: page,
        pageSize: size,
        status: status === "ALL" ? undefined : status,
        keyword: keyword || undefined,
        sortBy: sortBy || "id",
        sortDir: sortDir || "ASC",
      },
    })
    .then((res) => res.data);
};

export const adminUpdateProductVisibility = (
  productId: number,
  isVisible: boolean
): Promise<ApiResponse<ApiProduct>> => {
  return api
    .patch<ApiResponse<ApiProduct>>(
      `${BASE_URL}/products/${productId}/visibility`,
      { isVisible }
    )
    .then((res) => res.data);
};

export const adminDeleteProduct = (
  productId: number
): Promise<ApiResponse<null>> => {
  return api
    .delete<ApiResponse<null>>(`${BASE_URL}/products/${productId}`)
    .then((res) => res.data);
};

export const getAdminCategories = async (): Promise<
  ApiResponse<ApiCategory[]>
> => {
  return api
    .get<ApiResponse<ApiCategory[]>>(`${BASE_URL}/categories`)
    .then((res) => res.data);
};

export const createCategory = async (
  data: CreateCategoryRequest
): Promise<ApiResponse<ApiCategory>> => {
  return api
    .post<ApiResponse<ApiCategory>>(`${BASE_URL}/categories`, data)
    .then((res) => res.data);
};

export const updateCategory = async (
  id: number,
  data: UpdateCategoryRequest
): Promise<ApiResponse<ApiCategory>> => {
  return api
    .put<ApiResponse<ApiCategory>>(`${BASE_URL}/categories/${id}`, data)
    .then((res) => res.data);
};

export const deleteCategory = async (
  id: number
): Promise<ApiResponse<null>> => {
  return api
    .delete<ApiResponse<null>>(`${BASE_URL}/categories/${id}`)
    .then((res) => res.data);
};

export const getAdminOrders = async (
  page: number,
  size: number,
  status: string
): Promise<ApiResponse<OrderPageData>> => {
  return api
    .get<ApiResponse<OrderPageData>>(`${BASE_URL}/admin/orders`, {
      params: {
        pageNo: page,
        pageSize: size,
        status: status === "ALL" ? undefined : status,
      },
    })
    .then((res) => res.data);
};

export const updateAdminOrderStatus = async (
  orderId: string,
  status: ApiOrderStatus
): Promise<ApiResponse<ApiOrderData>> => {
  return api
    .patch<ApiResponse<ApiOrderData>>(`${BASE_URL}/orders/${orderId}/status`, {
      status,
    })
    .then((res) => res.data);
    // hi ae
};
