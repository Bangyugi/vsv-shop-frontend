// src/services/addressService.ts
import api from "../api/axios";
import type {
  GetAddressesResponse,
  AddAddressRequest,
  AddAddressResponse,
  UpdateAddressRequest,
  UpdateAddressResponse,
  DeleteAddressResponse, // <-- THÊM
} from "../types/address";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Lấy danh sách địa chỉ của người dùng đã đăng nhập.
 */
export const getMyAddresses = (): Promise<GetAddressesResponse> => {
  return api
    .get<GetAddressesResponse>(`${BASE_URL}/api/addresses`)
    .then((res) => res.data);
};

/**
 * Thêm một địa chỉ mới cho người dùng.
 */
export const addAddress = (
  data: AddAddressRequest
): Promise<AddAddressResponse> => {
  return api
    .post<AddAddressResponse>(`${BASE_URL}/api/addresses`, data)
    .then((res) => res.data);
};

/**
 * Cập nhật một địa chỉ đã có của người dùng.
 */
export const updateAddress = (
  addressId: number,
  data: UpdateAddressRequest
): Promise<UpdateAddressResponse> => {
  return api
    .put<UpdateAddressResponse>(`${BASE_URL}/api/addresses/${addressId}`, data)
    .then((res) => res.data);
};

/**
 * Xóa một địa chỉ của người dùng.
 */
export const deleteAddress = (
  addressId: number // <-- ID là số
): Promise<DeleteAddressResponse> => {
  return api
    .delete<DeleteAddressResponse>(`${BASE_URL}/api/addresses/${addressId}`)
    .then((res) => res.data);
};

// TODO: Thêm hàm
// - setAddressAsDefault(id): Promise<ApiResponse<ApiAddress>>
// ... khi backend sẵn sàng.
