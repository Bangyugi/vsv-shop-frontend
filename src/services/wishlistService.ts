import api from "../api/axios";
import type { ApiResponse } from "../types";
import type { GetWishlistResponse } from "../types/wishlist";

export const getMyWishlist = (): Promise<GetWishlistResponse> => {
  return api
    .get<GetWishlistResponse>("/api/wishlists")
    .then((res) => res.data);
};

export const addToWishlist = (productId: number): Promise<ApiResponse<any>> => {
  return api
    .post<ApiResponse<any>>(`/api/wishlists/add/${productId}`)
    .then((res) => res.data);
};

export const removeFromWishlist = (
  productId: number
): Promise<ApiResponse<any>> => {
  return api
    .delete<ApiResponse<any>>(`/api/wishlists/remove/${productId}`)
    .then((res) => res.data);
};