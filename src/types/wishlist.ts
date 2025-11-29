// src/types/wishlist.ts
// --- THAY ĐỔI: Sửa lỗi import ---
import type { ApiResponse } from "./index";
import type { UserData } from "./auth";
// --- KẾT THÚC THAY ĐỔI ---
import type { ApiVariant } from "../types/product";

export interface WishlistApiProduct {
  createdAt: string;
  updatedAt: string;
  id: number;
  title: string;
  description: string;
  price: number;
  sellingPrice: number;
  discountPercent: number;
  images: string[];
  numRatings: number;
  category: {
    id: number;
    name: string;
  };
  variants?: ApiVariant[];
}

export interface WishlistApiResponseData {
  id: number | null;
  user: UserData;
  products: WishlistApiProduct[];
}

export type GetWishlistResponse = ApiResponse<WishlistApiResponseData>;

export interface WishlistItemFE {
  id: number;
  name: string;
  price: number;
  image: string;
  tag?: string;
  variants?: ApiVariant[];
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
}

export interface WishlistContextType {
  wishlistData: WishlistApiResponseData | null;

  isInitialLoading: boolean;
  isUpdating: boolean;
  snackbar: SnackbarState | null;

  error: string | null;

  fetchWishlist: (showInitialLoading?: boolean) => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  closeSnackbar: () => void;
  isProductInWishlist: (productId: number) => boolean;
  wishlistProductIds: Set<number>;
}
