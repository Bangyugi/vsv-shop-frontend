import api from "../api/axios";
import type { ApiResponse } from "../types";
import type {
  SellerRegistrationRequest,
  SellerRegistrationResponse,
  ApiSellerData,
  GetSellerDashboardResponse,
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

// URL paths updated to include /api prefix explicitly

export const registerAsSeller = (
  data: SellerRegistrationRequest
): Promise<SellerRegistrationResponse> => {
  return api
    .post<SellerRegistrationResponse>("/api/sellers/become-seller", data)
    .then((res) => res.data);
};

export const getMySellerProfile = (): Promise<ApiResponse<ApiSellerData>> => {
  return api
    .get<ApiResponse<ApiSellerData>>("/api/sellers/profile")
    .then((res) => res.data)
    .catch((error) => {
      console.error("Error fetching my seller profile:", error);
      throw error;
    });
};

export const updateMySellerProfile = (
  sellerId: number,
  data: SellerRegistrationRequest
): Promise<ApiResponse<ApiSellerData>> => {
  return api
    .put<ApiResponse<ApiSellerData>>(`/api/sellers/update/${sellerId}`, data)
    .then((res) => res.data);
};

export const getSellerDashboardStats = (): Promise<GetSellerDashboardResponse> => {
  return api
    .get<GetSellerDashboardResponse>("/api/reports/seller/dashboard")
    .then((res) => res.data);
};

export const getMyProducts = (
  page: number,
  size: number,
  keyword?: string,
  sortBy?: string,
  sortDir?: "ASC" | "DESC"
): Promise<ApiResponse<ProductPageData>> => {
  const apiParams: Record<string, any> = {
    pageNo: page,
    pageSize: size,
    keyword: keyword || undefined,
    sortBy: sortBy || "id",
    sortDir: sortDir || "ASC",
  };
  Object.keys(apiParams).forEach((key) => {
    if (apiParams[key] === undefined) delete apiParams[key];
  });
  
  return api
    .get<ApiResponse<ProductPageData>>("/api/products/my-products", {
      params: apiParams,
    })
    .then((res) => res.data);
};

export const addMyProduct = (
  data: SellerProductFormValues,
  _categoryName: string
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
  
  // Reuse productService but ensure it's imported and working
  return productService.createProduct(requestBody);
};

export const updateMyProduct = (
  productId: number,
  data: SellerProductFormValues,
  _categoryName: string,
  _existingProduct: ApiProduct
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

export const deleteMyProduct = (
  productId: number
): Promise<ApiResponse<null>> => {
  return productService.deleteProduct(productId);
};

export const getMySellOrders = (
  page: number,
  size: number,
  status?: string,
  keyword?: string,
  sortBy?: string,
  sortDir?: "ASC" | "DESC"
): Promise<ApiResponse<OrderPageData>> => {
  const apiParams: Record<string, any> = {
    pageNo: page,
    pageSize: size,
    status: status === "ALL" ? undefined : status,
    keyword: keyword || undefined,
    sortBy: sortBy || "orderDate",
    sortDir: sortDir || "DESC",
  };
  
  Object.keys(apiParams).forEach((key) => {
    if (apiParams[key] === undefined) delete apiParams[key];
  });

  return api
    .get<ApiResponse<OrderPageData>>("/api/orders/seller", {
      params: apiParams,
    })
    .then((res) => res.data);
};

export const updateSellOrderStatus = (
  orderId: string,
  newStatus: ApiOrderStatus
): Promise<ApiResponse<ApiOrderData>> => {
  return api
    .patch<ApiResponse<ApiOrderData>>(`/api/orders/${orderId}/status`, {
      status: newStatus,
    })
    .then((res) => res.data);
};

export const getNotificationSummary =
  (): Promise<GetNotificationSummaryResponse> => {
    return api
      .get<GetNotificationSummaryResponse>("/api/sellers/notifications/summary")
      .then((res) => res.data)
      .catch((error) => {
        console.error("Error fetching notification summary:", error);
        return {
          code: 500,
          message: error.response?.data?.message || "Failed to fetch notifications",
          data: null,
        };
      });
  };