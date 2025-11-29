// src/services/cartService.ts
import api from "../api/axios"; // Axios instance đã cấu hình interceptor
import type { ApiCartResponse } from "../types/cart"; // Import kiểu dữ liệu response
import type { ApiResponse } from "../types"; // Import ApiResponse chung

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Lấy thông tin giỏ hàng của người dùng hiện tại.
 * Endpoint: GET /api/carts
 */
export const getMyCart = (): Promise<ApiCartResponse> => {
  return api
    .get<ApiCartResponse>(`${BASE_URL}/api/carts`)
    .then((res) => res.data);
};

/**
 * Thêm sản phẩm vào giỏ hàng.
 * Endpoint: POST /api/carts/add
 * Body: { variantId: number, quantity: number }
 */
// --- THAY ĐỔI: Cập nhật kiểu dữ liệu data ---
export const addToCart = (data: {
  variantId: number;
  quantity: number;
}): Promise<ApiCartResponse> => {
  return api
    .post<ApiCartResponse>(`${BASE_URL}/api/carts/add`, data)
    .then((res) => res.data);
};
// --- KẾT THÚC THAY ĐỔI ---

/**
 * Cập nhật số lượng của một item trong giỏ hàng bằng Cart Item ID.
 * Endpoint: PUT /api/cart-items/{cartItemId}
 * Body: { quantity: number }
 */
export const updateCartItemQuantityById = (
  cartItemId: number,
  quantity: number
): Promise<ApiResponse<{ id: number; quantity: number }>> => {
  // --- THAY ĐỔI ENDPOINT VÀ KIỂU TRẢ VỀ (Giả định API trả về id và quantity đã cập nhật) ---
  // Nếu API trả về toàn bộ giỏ hàng, hãy đổi kiểu trả về thành Promise<ApiCartResponse>
  return api
    .put<ApiResponse<{ id: number; quantity: number }>>(
      `${BASE_URL}/api/cart-items/${cartItemId}`, // Endpoint mới
      { quantity }
    )
    .then((res) => res.data);
};

/**
 * Xóa một item khỏi giỏ hàng.
 * Endpoint: DELETE /api/carts/remove/{cartItemId}
 */
export const removeFromCart = (
  cartItemId: number
): Promise<ApiCartResponse> => {
  return api
    .delete<ApiCartResponse>(`${BASE_URL}/api/cart-items/${cartItemId}`)
    .then((res) => res.data);
};

/**
 * Áp dụng mã giảm giá.
 * Endpoint: POST /api/carts/apply-coupon
 * Body: { couponCode: string }
 */
export const applyCoupon = (couponCode: string): Promise<ApiCartResponse> => {
  return api
    .post<ApiCartResponse>(`${BASE_URL}/api/carts/apply-coupon`, { couponCode })
    .then((res) => res.data);
};
