import api from "../api/axios";
import type { ApiResponse } from "../types";
import type { GetWishlistResponse } from "../types/wishlist";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://vsv-shop-backend-production.up.railway.app/api";

export const getMyWishlist = (): Promise<GetWishlistResponse> => {
  return api
    .get<GetWishlistResponse>(`${BASE_URL}/api/wishlists`)
    .then((res) => res.data);
};

export const addToWishlist = (productId: number): Promise<ApiResponse<any>> => {
  return api
    .post<ApiResponse<any>>(`${BASE_URL}/api/wishlists/add/${productId}`)
    .then((res) => res.data);
};

export const removeFromWishlist = (
  productId: number
): Promise<ApiResponse<any>> => {
  return api
    .delete<ApiResponse<any>>(`${BASE_URL}/api/wishlists/remove/${productId}`)
    .then((res) => res.data);
};
