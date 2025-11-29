import api from "../api/axios";
import type { ApiResponse } from "../types";
import type {
  SellerRegistrationRequest,
  SellerRegistrationResponse,
  ApiSellerData,
} from "../types/seller";
import type {
  ApiProduct,
  ProductPageData,
  SellerProductFormValues,
  UpdateProductRequest,
  CreateProductRequest,
  ApiVariant,
} from "../types/product";

import type {
  ApiOrderData,
  ApiOrderStatus,
  OrderPageData,
} from "../types/order";

import type { GetNotificationSummaryResponse } from "../types/notification";

import * as productService from "./productService";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/**
 * Đăng ký làm Seller (Giữ nguyên)
 */
export const registerAsSeller = (
  data: SellerRegistrationRequest
): Promise<SellerRegistrationResponse> => {
  return api
    .post<SellerRegistrationResponse>(`${BASE_URL}/sellers/become-seller`, data)
    .then((res) => res.data);
};

/**
 * Lấy thông tin profile của Seller
 * API: GET /api/sellers/my-profile
 */
export const getMySellerProfile = (): Promise<ApiResponse<ApiSellerData>> => {
  return api
    .get<ApiResponse<ApiSellerData>>(`${BASE_URL}/sellers/profile`)
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error fetching my seller profile:", error);
      throw error;
    });
};

/**
 * Cập nhật profile của Seller
 * API: PUT /api/sellers/update/{sellerId}
 */
export const updateMySellerProfile = (
  sellerId: number,
  data: SellerRegistrationRequest
): Promise<ApiResponse<ApiSellerData>> => {
  console.log(`Updating seller profile (REAL API) for ID ${sellerId}:`, data);
  return api
    .put<ApiResponse<ApiSellerData>>(
      `${BASE_URL}/sellers/update/${sellerId}`,
      data
    )
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error updating seller profile:", error);
      throw error;
    });
};

/**
 * Lấy danh sách sản phẩm CỦA Seller
 * (Giữ nguyên API thật)
 */
export const getMyProducts = (
  page: number,
  size: number,
  keyword?: string,
  sortBy?: string,
  sortDir?: "ASC" | "DESC"
): Promise<ApiResponse<ProductPageData>> => {
  console.log("Fetching my products (REAL API):", {
    page,
    size,
    keyword,
    sortBy,
    sortDir,
  });
  const apiParams: Record<string, any> = {
    pageNo: page,
    pageSize: size,
    keyword: keyword || undefined,
    sortBy: sortBy || "id",
    sortDir: sortDir || "ASC",
  };
  Object.keys(apiParams).forEach((key) => {
    if (apiParams[key] === undefined) {
      delete apiParams[key];
    }
  });
  return api
    .get<ApiResponse<ProductPageData>>(`${BASE_URL}/products/my-products`, {
      params: apiParams,
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error fetching my products:", error);
      throw error;
    });
};

/**
 * Thêm một sản phẩm mới (Sử dụng API thật)
 * (Giữ nguyên)
 */
export const addMyProduct = (
  data: SellerProductFormValues,
  categoryName: string
): Promise<ApiResponse<ApiProduct>> => {
  const discountPercent =
    data.price > 0
      ? Math.round(((data.price - data.sellingPrice) / data.price) * 100)
      : 0;
  const requestBody: CreateProductRequest = {
    title: data.title,
    description: data.description,
    price: data.price,
    sellingPrice: data.sellingPrice,
    discountPercent: discountPercent,
    images: data.images.split(",").map((img) => img.trim()),
    categoryId: data.categoryId,
    variants: data.variants,
  };
  console.log("Adding new product (REAL API):", requestBody);
  return productService.createProduct(requestBody);
};

/**
 * Cập nhật sản phẩm (Sử dụng API thật)
 * (Giữ nguyên)
 */
export const updateMyProduct = (
  productId: number,
  data: SellerProductFormValues,
  categoryName: string,
  existingProduct: ApiProduct
): Promise<ApiResponse<ApiProduct>> => {
  const discountPercent =
    data.price > 0
      ? Math.round(((data.price - data.sellingPrice) / data.price) * 100)
      : 0;
  const variants = data.variants as ApiVariant[];
  const requestBody: UpdateProductRequest = {
    title: data.title,
    description: data.description,
    price: data.price,
    sellingPrice: data.sellingPrice,
    discountPercent: discountPercent,
    images: data.images.split(",").map((img) => img.trim()),
    categoryId: data.categoryId,
    variants: variants,
  };
  return productService.updateProduct(productId, requestBody);
};

/**
 * Xóa sản phẩm (Sử dụng API thật)
 * (Giữ nguyên)
 */
export const deleteMyProduct = (
  productId: number
): Promise<ApiResponse<null>> => {
  console.log("Deleting product (REAL API):", productId);
  return productService.deleteProduct(productId);
};

/**
 * Lấy danh sách đơn hàng CỦA Seller (API Thật)
 * API: GET /api/orders/seller
 */
export const getMySellOrders = (
  page: number,
  size: number,
  status?: string,
  keyword?: string,
  sortBy?: string,
  sortDir?: "ASC" | "DESC"
): Promise<ApiResponse<OrderPageData>> => {
  console.log("Fetching my sell-orders (REAL API):", {
    page,
    size,
    status,
    keyword,
    sortBy,
    sortDir,
  });

  const apiParams: Record<string, any> = {
    pageNo: page,
    pageSize: size,
    status: status === "ALL" ? undefined : status,
    keyword: keyword || undefined,
    sortBy: sortBy || "orderDate",
    sortDir: sortDir || "DESC",
  };

  Object.keys(apiParams).forEach((key) => {
    if (apiParams[key] === undefined) {
      delete apiParams[key];
    }
  });

  return api
    .get<ApiResponse<OrderPageData>>(`${BASE_URL}/orders/seller`, {
      params: apiParams,
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error fetching my sell-orders:", error);
      throw error;
    });
};

/**
 * Seller cập nhật trạng thái đơn hàng (của họ) (API Thật)
 * API: PATCH /api/orders/seller/uuid/{orderUuid}/status
 */
export const updateSellOrderStatus = (
  orderId: string,
  newStatus: ApiOrderStatus
): Promise<ApiResponse<ApiOrderData>> => {
  console.log("Updating sell-order status (REAL API):", { orderId, newStatus });

  return api
    .patch<ApiResponse<ApiOrderData>>(`${BASE_URL}/orders/${orderId}/status`, {
      status: newStatus,
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error updating sell-order status:", error);
      throw error;
    });
};

/**
 * Lấy tóm tắt thông báo cho seller (ví dụ: số đơn hàng PENDING)
 * (Giả định API)
 * API: GET /api/sellers/notifications/summary
 */
export const getNotificationSummary =
  (): Promise<GetNotificationSummaryResponse> => {
    return api
      .get<GetNotificationSummaryResponse>(
        `${BASE_URL}/sellers/notifications/summary`
      )
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error fetching notification summary:", error);

        return {
          code: 500,
          message:
            error.response?.data?.message || "Failed to fetch notifications",
          data: null,
        };
      });
  };
