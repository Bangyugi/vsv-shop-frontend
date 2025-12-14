import api from "../api/axios";
import type {
  GetProductsResponse,
  ProductApiParams,
  ApiProduct,
  UpdateProductRequest,
  CreateProductRequest,
} from "../types/product";
import type { ApiResponse } from "../types";

export const getProducts = (
  params: ProductApiParams
): Promise<GetProductsResponse> => {
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
    .get<GetProductsResponse>("/api/products", {
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

export const getProductById = (
  productId: number | string
): Promise<ApiResponse<ApiProduct>> => {
  console.log(`Fetching product with ID: ${productId}`);
  return api
    .get<ApiResponse<ApiProduct>>(`/api/products/${productId}`)
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

export const createProduct = (
  data: CreateProductRequest
): Promise<ApiResponse<ApiProduct>> => {
  console.log(`Creating new product:`, data);
  return api
    .post<ApiResponse<ApiProduct>>("/api/products/create", data)
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Error creating product:`, error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          `Failed to create product`
      );
    });
};

export const updateProduct = (
  productId: number,
  data: UpdateProductRequest
): Promise<ApiResponse<ApiProduct>> => {
  console.log(`Updating product with ID: ${productId}`, data);
  return api
    .put<ApiResponse<ApiProduct>>(`/api/products/${productId}`, data)
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

export const deleteProduct = (
  productId: number
): Promise<ApiResponse<null>> => {
  console.log(`Deleting product with ID: ${productId}`);
  return api
    .delete<ApiResponse<null>>(`/api/products/${productId}`)
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Error deleting product ${productId}:`, error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          `Failed to delete product ${productId}`
      );
    });
};