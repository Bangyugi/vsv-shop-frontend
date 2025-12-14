import api from "../api/axios";
import type { ApiCartResponse } from "../types/cart";
import type { ApiResponse } from "../types";

export const getMyCart = (): Promise<ApiCartResponse> => {
  return api
    .get<ApiCartResponse>("/api/carts")
    .then((res) => res.data);
};

export const addToCart = (data: {
  variantId: number;
  quantity: number;
}): Promise<ApiCartResponse> => {
  return api
    .post<ApiCartResponse>("/api/carts/add", data)
    .then((res) => res.data);
};

export const updateCartItemQuantityById = (
  cartItemId: number,
  quantity: number
): Promise<ApiResponse<{ id: number; quantity: number }>> => {
  return api
    .put<ApiResponse<{ id: number; quantity: number }>>(
      `/api/cart-items/${cartItemId}`,
      { quantity }
    )
    .then((res) => res.data);
};

export const removeFromCart = (
  cartItemId: number
): Promise<ApiCartResponse> => {
  return api
    .delete<ApiCartResponse>(`/api/cart-items/${cartItemId}`)
    .then((res) => res.data);
};

export const applyCoupon = (couponCode: string): Promise<ApiCartResponse> => {
  return api
    .post<ApiCartResponse>("/api/carts/apply-coupon", { couponCode })
    .then((res) => res.data);
};