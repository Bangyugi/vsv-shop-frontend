import api from "../api/axios";
import type { ApiCartResponse } from "../types/cart";
import type { ApiResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://vsv-shop-backend-production.up.railway.app";

export const getMyCart = (): Promise<ApiCartResponse> => {
  return api
    .get<ApiCartResponse>(`${BASE_URL}/api/carts`)
    .then((res) => res.data);
};

export const addToCart = (data: {
  variantId: number;
  quantity: number;
}): Promise<ApiCartResponse> => {
  return api
    .post<ApiCartResponse>(`${BASE_URL}/api/carts/add`, data)
    .then((res) => res.data);
};

export const updateCartItemQuantityById = (
  cartItemId: number,
  quantity: number
): Promise<ApiResponse<{ id: number; quantity: number }>> => {
  return api
    .put<ApiResponse<{ id: number; quantity: number }>>(
      `${BASE_URL}/api/cart-items/${cartItemId}`,
      { quantity }
    )
    .then((res) => res.data);
};

export const removeFromCart = (
  cartItemId: number
): Promise<ApiCartResponse> => {
  return api
    .delete<ApiCartResponse>(`${BASE_URL}/api/cart-items/${cartItemId}`)
    .then((res) => res.data);
};

export const applyCoupon = (couponCode: string): Promise<ApiCartResponse> => {
  return api
    .post<ApiCartResponse>(`${BASE_URL}/api/carts/apply-coupon`, { couponCode })
    .then((res) => res.data);
};
