// src/services/adminService.ts
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

// --- THÊM IMPORTS CATEGORY VÀ CẬP NHẬT KIỂU DỮ LIỆU ---
import type {
  ApiCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/category";
// --- KẾT THÚC THÊM IMPORTS CATEGORY ---

// --- THÊM MỚI: Import types từ order.ts ---
import type {
  ApiOrderData,
  ApiOrderStatus,
  OrderPageData,
} from "../types/order";
// --- KẾT THÚC THÊM MỚI ---

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

interface Page<T> {
  pageContent: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

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

/**
 * Lấy thông tin chi tiết của một user bằng ID
 * @param userId ID của user
 */
export const getUserById = (userId: number): Promise<ApiResponse<UserData>> => {
  return api
    .get<ApiResponse<UserData>>(`${BASE_URL}/admin/users/find/${userId}`)
    .then((res) => res.data);
};

/**
 * Xóa một user bằng ID
 * @param userId ID của user
 */
export const deleteUser = (userId: number): Promise<ApiResponse<null>> => {
  return api
    .delete<ApiResponse<null>>(`${BASE_URL}/admin/users/delete/${userId}`)
    .then((res) => res.data);
};

/**
 * Lấy thông tin chi tiết của một seller bằng ID (User ID của seller đó)
 * @param sellerUserId ID của user (người là seller)
 */
export const getSellerById = (
  sellerUserId: number
): Promise<ApiResponse<ApiSellerData>> => {
  return api
    .get<ApiResponse<ApiSellerData>>(
      `${BASE_URL}/admin/sellers/${sellerUserId}`
    )
    .then((res) => res.data);
};

/**
 * Lấy danh sách sellers (có phân trang và filter)
 * @param page API (bắt đầu từ 1)
 * @param size Kích thước trang
 * @param statusFilter Lọc theo trạng thái
 * @param keyword Từ khóa tìm kiếm
 * @param sortBy Tên trường sắp xếp
 * @param sortDir Hướng sắp xếp (ASC/DESC)
 */
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

/**
 * Cập nhật trạng thái của một seller
 * @param sellerId ID của seller
 * @param newStatus Trạng thái mới (ACTIVE, REJECTED, SUSPENDED)
 */
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

/**
 * Lấy danh sách sản phẩm cho Admin (phân trang, filter)
 * @param page Trang
 * @param size Kích thước trang
 * @param status (VISIBLE, HIDDEN, ALL)
 * @param keyword Từ khóa
 * @param sortBy Sắp xếp
 * @param sortDir Hướng sắp xếp
 */
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

/**
 * Cập nhật trạng thái hiển thị của sản phẩm
 * @param productId ID sản phẩm
 * @param isVisible Trạng thái mới
 */
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

/**
 * Xóa sản phẩm vĩnh viễn (Admin)
 * @param productId ID sản phẩm
 */
export const adminDeleteProduct = (
  productId: number
): Promise<ApiResponse<null>> => {
  return api
    .delete<ApiResponse<null>>(`${BASE_URL}/products/${productId}`)
    .then((res) => res.data);
};

// --- CẬP NHẬT KIỂU TRẢ VỀ ---
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

/**
 * Cập nhật một category bằng ID (PUT /api/categories/{id})
 * @param id ID của category
 * @param data Dữ liệu category cần cập nhật
 */
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

// --- CẬP NHẬT: Loại bỏ 'any' ---
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

// --- CẬP NHẬT: Loại bỏ 'any' ---
export const updateAdminOrderStatus = async (
  orderId: string,
  status: ApiOrderStatus
): Promise<ApiResponse<ApiOrderData>> => {
  return api
    .patch<ApiResponse<ApiOrderData>>(`${BASE_URL}/orders/${orderId}/status`, {
      status,
    })
    .then((res) => res.data);
};
