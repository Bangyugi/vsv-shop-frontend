// src/types/index.ts
import type { ApiVariant } from "./product";

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  sellingPrice: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null; // <-- SỬA LỖI: Cho phép data là null
}
export interface CartItem {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  image: string;
  tag?: string;
}

export interface SearchProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  category: "Men" | "Women" | "Kids" | "Accessories";
  rating: number;
  colors: string[];
  gender: "Men" | "Women" | "Unisex";
  sizes: string[];
  material: string;
  sold: number;
}

export interface ProductDetail {
  id: number;
  name: string;
  sku: string;
  price: number;
  discountPrice: number;
  images: string[];
  rating: number;
  reviewCount: number;
  shortDescription: string;
  longDescription: string;
  colors: string[];
  sizes: string[];
  careInstructions: string;
  shippingPolicy: string;
  category: string;
  sold: number;
  variants: Pick<ApiVariant, "id" | "color" | "size" | "quantity" | "sku">[];
  seller?: {
    id: number;
    name: string;
    avatar: string;
  };
}

export interface ProductReview {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface AddressDetails {
  id: number | string;
  label: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  note?: string;
}

export interface CheckoutCartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface UserAddress extends AddressDetails {
  isDefault?: boolean;
}

export interface OrderItem {
  id: number;
  name: string;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
  items: OrderItem[];
  total: number;
}

export type OrderStatus =
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export interface OrderDetailItem {
  id: number;
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
}

export interface OrderDetail {
  orderId: string;
  orderDate: string;
  status: OrderStatus;
  paymentMethod: string;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  customer: OrderCustomer;
  items: OrderDetailItem[];
}
