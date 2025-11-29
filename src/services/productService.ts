// src/services/productService.ts
import api from "../api/axios"; // Your configured axios instance
import type {
  GetProductsResponse,
  ProductApiParams,
  ApiProduct,
  UpdateProductRequest,
  CreateProductRequest, // <-- THÊM IMPORT
} from "../types/product";
import type { ApiResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Fetches a list of products based on filtering, pagination, and sorting parameters.
 * Endpoint: GET /api/products
 */
export const getProducts = (
  params: ProductApiParams
): Promise<GetProductsResponse> => {
  // ... (Hàm getProducts giữ nguyên)
  const apiParams: Record<string, any> = { ...params };
  Object.keys(apiParams).forEach((key) => {
    if (
      apiParams[key] === undefined ||
      apiParams[key] === null ||
      apiParams[key] === ""
    ) {
      delete apiParams[key];
    }
  });
  console.log("Fetching products with params:", apiParams);
  return api
    .get<GetProductsResponse>(`${BASE_URL}/api/products`, {
      params: apiParams,
    })
    .then((res) => {
      console.log("API response received:", res.data);
      if (
        !res.data ||
        typeof res.data.code !== "number" ||
        !res.data.data ||
        !Array.isArray(res.data.data.pageContent)
      ) {
        console.error("Invalid API response structure:", res.data);
        throw new Error("Invalid response structure from product API.");
      }
      return res.data;
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch products"
      );
    });
};

/**
 * Fetches a single product by its ID.
 * Endpoint: GET /api/products/{productId}
 */
export const getProductById = (
  productId: number | string
): Promise<ApiResponse<ApiProduct>> => {
  // ... (Hàm getProductById giữ nguyên)
  console.log(`Fetching product with ID: ${productId}`);
  return api
    .get<ApiResponse<ApiProduct>>(`${BASE_URL}/api/products/${productId}`)
    .then((res) => {
      console.log("API response for product detail:", res.data);
      if (
        !res.data ||
        typeof res.data.code !== "number" ||
        !res.data.data ||
        typeof res.data.data.id !== "number"
      ) {
        console.error(
          "Invalid API response structure for product detail:",
          res.data
        );
        throw new Error("Invalid response structure from product detail API.");
      }
      return res.data;
    })
    .catch((error) => {
      console.error(`Error fetching product ${productId}:`, error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          `Failed to fetch product ${productId}`
      );
    });
};

// --- THÊM MỚI ---
/**
 * Creates a new product.
 * Endpoint: POST /api/products/create
 */
export const createProduct = (
  data: CreateProductRequest
): Promise<ApiResponse<ApiProduct>> => {
  console.log(`Creating new product:`, data);
  // Sử dụng BASE_URL đã định nghĩa ở trên
  return api
    .post<ApiResponse<ApiProduct>>(`${BASE_URL}/api/products/create`, data)
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Error creating product:`, error);
      // Ném lỗi để component có thể bắt
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          `Failed to create product`
      );
    });
};
// --- KẾT THÚC THÊM MỚI ---

/**
 * Updates an existing product by its ID.
 * Endpoint: PUT /api/products/{productId}
 */
export const updateProduct = (
  productId: number,
  data: UpdateProductRequest
): Promise<ApiResponse<ApiProduct>> => {
  // ... (Hàm updateProduct từ bước trước giữ nguyên)
  console.log(`Updating product with ID: ${productId}`, data);
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  return api
    .put<ApiResponse<ApiProduct>>(`${API_URL}/api/products/${productId}`, data)
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Error updating product ${productId}:`, error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          `Failed to update product ${productId}`
      );
    });
};

// --- THÊM MỚI ---
/**
 * Deletes a product by its ID. (Called by Admin or Seller)
 * Endpoint: DELETE /api/products/{productId}
 */
export const deleteProduct = (
  productId: number
): Promise<ApiResponse<null>> => {
  console.log(`Deleting product with ID: ${productId}`);
  // Lấy URL gốc (ví dụ: http://localhost:8080)
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  return api
    .delete<ApiResponse<null>>(`${API_URL}/api/products/${productId}`)
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Error deleting product ${productId}:`, error);
      // Ném lỗi để component có thể bắt
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          `Failed to delete product ${productId}`
      );
    });
};
// --- KẾT THÚC THÊM MỚI ---
