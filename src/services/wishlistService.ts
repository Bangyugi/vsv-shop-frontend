// src/services/wishlistService.ts
import api from "../api/axios"; // Your configured axios instance
import type { ApiResponse } from "../types";
import type { GetWishlistResponse } from "../types/wishlist"; // Import kiểu dữ liệu mới

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Fetches the wishlist for the currently logged-in user.
 */
export const getMyWishlist = (): Promise<GetWishlistResponse> => {
  return api
    .get<GetWishlistResponse>(`${BASE_URL}/api/wishlists`)
    .then((res) => res.data);
};

// --- Thêm các hàm API khác cho Wishlist nếu cần ---
/**
 * Adds a product to the wishlist.
 * Giả định endpoint: POST /api/wishlists/add/{productId}
 */
export const addToWishlist = (productId: number): Promise<ApiResponse<any>> => {
  // Kiểu trả về có thể cần chỉnh sửa
  return api
    .post<ApiResponse<any>>(`${BASE_URL}/api/wishlists/add/${productId}`)
    .then((res) => res.data);
};

/**
 * Removes a product from the wishlist.
 * Giả định endpoint: DELETE /api/wishlists/remove/{productId}
 */
export const removeFromWishlist = (
  productId: number
): Promise<ApiResponse<any>> => {
  // Kiểu trả về có thể cần chỉnh sửa
  return api
    .delete<ApiResponse<any>>(`${BASE_URL}/api/wishlists/remove/${productId}`)
    .then((res) => res.data);
};
// --- Kết thúc thêm hàm ---
