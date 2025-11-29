// src/types/product.ts
import type { ApiResponse } from "./index"; // <-- SỬA LỖI IMPORT
import type { ApiCategory } from "./category";
import type { UserData } from "./auth";

// ... (ApiSeller, ApiVariant... giữ nguyên) ...
export interface ApiSeller {
  id: number;
  user: UserData;
  businessDetails?: {
    businessName?: string;
  };
}

export interface ApiVariant {
  id: number;
  sku: string;
  color: string;
  size: string;
  quantity: number;
}

export interface ApiProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  sellingPrice: number;
  discountPercent: number;
  images: string[];
  numRatings?: number;
  averageRating?: number;
  totalSold: number; // <-- THÊM TRƯỜNG MỚI
  category: ApiCategory;
  seller?: ApiSeller;
  variants?: ApiVariant[];
  createdAt?: string;
  isVisible?: boolean;
}

export interface ProductPageData {
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  pageContent: ApiProduct[];
}

export type GetProductsResponse = ApiResponse<ProductPageData>;

export interface ProductApiParams {
  keyword?: string;
  categoryId?: number;
  sellerId?: number;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  minRating?: number;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
}

// ... (FrontendProduct giữ nguyên) ...
export interface FrontendProduct {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  rating: number;
  colors: string[];
  gender?: string;
  sizes: string[];
  material?: string;
  sold: number;
  brand?: string;
  isFavorite?: boolean;

  variants: ApiVariant[] | undefined;
}

export const mapApiProductToShoppingProduct = (
  apiProduct: ApiProduct
): FrontendProduct => {
  const colors = [
    ...new Set(apiProduct.variants?.map((v) => v.color) || []),
  ].filter(Boolean);
  const sizes = [
    ...new Set(apiProduct.variants?.map((v) => v.size) || []),
  ].filter(Boolean);

  const brand = apiProduct.seller?.businessDetails?.businessName;

  let gender: FrontendProduct["gender"] = "Unisex";
  if (apiProduct.category?.name.toLowerCase().includes("men")) {
    gender = "Men";
  } else if (apiProduct.category?.name.toLowerCase().includes("women")) {
    gender = "Women";
  }

  return {
    id: apiProduct.id,
    name: apiProduct.title,
    price: apiProduct.price,
    discountPrice:
      apiProduct.sellingPrice !== apiProduct.price
        ? apiProduct.sellingPrice
        : undefined,
    image: apiProduct.images?.[0] || "/placeholder.png",
    category: apiProduct.category?.name || "Uncategorized",
    rating: apiProduct.averageRating || 0,
    colors: colors,
    gender: gender,
    sizes: sizes,
    material: "Unknown",
    // --- THAY ĐỔI: Sử dụng totalSold thay vì numRatings ---
    sold: apiProduct.totalSold || 0,
    // --- KẾT THÚC THAY ĐỔI ---
    brand: brand,
    isFavorite: false,

    variants: apiProduct.variants,
  };
};

/**
 * Dữ liệu cho một variant khi TẠO sản phẩm
 * (Khớp với request mẫu của bạn)
 */
export interface CreateProductVariant {
  id: number; // Gửi 0 cho variant mới, gửi ID thật cho variant cũ (khi update)
  sku: string;
  color: string;
  size: string;
  quantity: number;
}

// ... (Các interface còn lại giữ nguyên) ...
export interface SellerProductFormValues {
  title: string;
  description: string;
  price: number;
  sellingPrice: number;
  categoryId: number;
  images: string; // Chuỗi URL, phân cách bằng dấu phẩy
  // --- THAY ĐỔI: Chuyển sang mảng variants ---
  variants: CreateProductVariant[];
  // --- XÓA: color, size, quantity ---
}
// --- KẾT THÚC CẬP NHẬT ---

/**
 * Kiểu dữ liệu cho request body của API POST /api/products/create
 * (Khớp với request mẫu của bạn)
 */
export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  sellingPrice: number;
  discountPercent: number;
  images: string[];
  categoryId: number;
  variants: CreateProductVariant[];
}

/**
 * Kiểu dữ liệu cho request body của API PUT /api/products/{productId}
 * Dựa trên JSON mẫu của bạn.
 */
export interface UpdateProductRequest {
  title: string;
  description: string;
  price: number;
  sellingPrice: number;
  discountPercent: number;
  images: string[];
  categoryId: number;
  variants: ApiVariant[];
}
