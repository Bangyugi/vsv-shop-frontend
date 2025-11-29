import type { ApiResponse } from "./index";
import type { UserData } from "./auth";

interface ApiCategory {
  id: number;
  name: string;
  parentCategory?: ApiCategory | null;
  level: number;
}

interface ApiSeller {
  id: number;
  businessDetails?: {
    businessName?: string;
  };
}

interface ApiProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  sellingPrice: number;
  discountPercent: number;
  images: string[];
  numRatings?: number;
  category: ApiCategory;
  seller?: ApiSeller;
  variants?: ApiVariant[];
  totalQuantity?: number;
}

interface ApiVariant {
  id: number;
  sku: string;
  color: string;
  size: string;
  quantity: number;
}

export interface ApiCartItem {
  id: number;
  product: ApiProduct;
  variant: ApiVariant;
  quantity: number;
  price: number;
  sellingPrice: number;
}

export interface ApiCartData {
  id: number;
  user: UserData;
  totalPrice: number;
  totalSellingPrice: number;
  totalItem: number;
  discount: number | null;
  couponCode: string | null;
  cartItems: ApiCartItem[];
}

export type ApiCartResponse = ApiResponse<ApiCartData>;

export interface CartItemFE {
  id: number;
  productId: number;
  variantId: number;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}
