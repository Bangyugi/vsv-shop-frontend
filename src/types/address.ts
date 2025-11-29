import type { ApiResponse } from "./index";

/**
 * Cấu trúc địa chỉ trả về từ API (cho GET, POST, PUT)
 */
export interface ApiAddress {
  id: number;
  address: string;
  ward?: string;
  district: string;
  province: string;
  country: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  isDefault?: boolean;
  note?: string | null;
}

/**
 * Kiểu dữ liệu cho response của API GET /api/addresses
 */
export type GetAddressesResponse = ApiResponse<ApiAddress[]>;

/**
 * Kiểu dữ liệu cho request body của POST /api/addresses
 */
export interface AddAddressRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  district: string;
  province: string;
  country: string;
  note?: string | null;
}

/**
 * Kiểu dữ liệu cho response khi thêm mới địa chỉ (POST)
 */
export type AddAddressResponse = ApiResponse<ApiAddress>;

/**
 * Kiểu dữ liệu cho request body của PUT /api/addresses/{addressId}
 */
export type UpdateAddressRequest = AddAddressRequest;

/**
 * Kiểu dữ liệu cho response khi cập nhật địa chỉ (PUT)
 */
export type UpdateAddressResponse = ApiResponse<ApiAddress>;

/**
 * Kiểu dữ liệu cho response khi xóa địa chỉ (DELETE)
 * (Thường là không có data, chỉ có code và message)
 */
export type DeleteAddressResponse = ApiResponse<null>;
