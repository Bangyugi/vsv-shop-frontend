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

interface Page<T> {
  pageContent: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

// === USER MANAGEMENT ===
export const getUsers = async (
  page: number,
  size: number,
  keyword?: string,
  sortBy?: string,
  sortDir?: "ASC" | "DESC"
): Promise<ApiResponse<Page<UserData>>> => {
  return api
    .get<ApiResponse<Page<UserData>>>("/api/admin/users", {
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
    .get<ApiResponse<UserData>>(`/api/admin/users/find/${userId}`)
    .then((res) => res.data);
};

export const deleteUser = (userId: number): Promise<ApiResponse<null>> => {
  return api
    .delete<ApiResponse<null>>(`/api/admin/users/delete/${userId}`)
    .then((res) => res.data);
};

// === SELLER MANAGEMENT ===
export const getSellerById = (
  sellerUserId: number
): Promise<ApiResponse<ApiSellerData>> => {
  return api
    .get<ApiResponse<ApiSellerData>>(`/api/admin/sellers/${sellerUserId}`)
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
    .get<GetSellersResponse>("/api/admin/sellers", {
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
    .get<GetSellersResponse>("/api/admin/sellers/pending", {
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
  return api
    .put<UpdateSellerStatusResponse>(
      `/api/admin/sellers/${sellerId}/status`,
      { status: newStatus }
    )
    .then((res) => res.data);
};

// === PRODUCT MANAGEMENT (ADMIN) ===
export const getAdminProducts = async (
  page: number,
  size: number,
  status?: "VISIBLE" | "HIDDEN" | "ALL",
  keyword?: string,
  sortBy?: string,
  sortDir?: "ASC" | "DESC"
): Promise<ApiResponse<ProductPageData>> => {
  // Lưu ý: Endpoint này có thể là /api/products (public/mixed) hoặc /api/admin/products tùy backend.
  // Dựa trên quyền admin, thường sẽ gọi API public nhưng có quyền quản trị hoặc API riêng.
  // Giả định backend dùng chung /api/products nhưng filter được status ẩn.
  return api
    .get<ApiResponse<ProductPageData>>("/api/products", {
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
      `/api/products/${productId}/visibility`,
      { isVisible }
    )
    .then((res) => res.data);
};

export const adminDeleteProduct = (
  productId: number
): Promise<ApiResponse<null>> => {
  return api
    .delete<ApiResponse<null>>(`/api/products/${productId}`)
    .then((res) => res.data);
};

// === CATEGORY MANAGEMENT ===
export const getAdminCategories = async (): Promise<
  ApiResponse<ApiCategory[]>
> => {
  return api
    .get<ApiResponse<ApiCategory[]>>("/api/categories")
    .then((res) => res.data);
};

export const createCategory = async (
  data: CreateCategoryRequest
): Promise<ApiResponse<ApiCategory>> => {
  return api
    .post<ApiResponse<ApiCategory>>("/api/categories", data)
    .then((res) => res.data);
};

export const updateCategory = async (
  id: number,
  data: UpdateCategoryRequest
): Promise<ApiResponse<ApiCategory>> => {
  return api
    .put<ApiResponse<ApiCategory>>(`/api/categories/${id}`, data)
    .then((res) => res.data);
};

export const deleteCategory = async (
  id: number
): Promise<ApiResponse<null>> => {
  return api
    .delete<ApiResponse<null>>(`/api/categories/${id}`)
    .then((res) => res.data);
};

// === ORDER MANAGEMENT ===
export const getAdminOrders = async (
  page: number,
  size: number,
  status: string
): Promise<ApiResponse<OrderPageData>> => {
  return api
    .get<ApiResponse<OrderPageData>>("/api/admin/orders", {
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
  // Admin update status order
  return api
    .patch<ApiResponse<ApiOrderData>>(`/api/orders/${orderId}/status`, {
      status,
    })
    .then((res) => res.data);
};