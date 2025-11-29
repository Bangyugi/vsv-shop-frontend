import type { ApiResponse } from "./index";

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

export type GetAddressesResponse = ApiResponse<ApiAddress[]>;

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

export type AddAddressResponse = ApiResponse<ApiAddress>;

export type UpdateAddressRequest = AddAddressRequest;

export type UpdateAddressResponse = ApiResponse<ApiAddress>;

export type DeleteAddressResponse = ApiResponse<null>;
