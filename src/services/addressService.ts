import api from "../api/axios";
import type {
  GetAddressesResponse,
  AddAddressRequest,
  AddAddressResponse,
  UpdateAddressRequest,
  UpdateAddressResponse,
  DeleteAddressResponse,
} from "../types/address";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getMyAddresses = (): Promise<GetAddressesResponse> => {
  return api
    .get<GetAddressesResponse>(`${BASE_URL}/api/addresses`)
    .then((res) => res.data);
};

export const addAddress = (
  data: AddAddressRequest
): Promise<AddAddressResponse> => {
  return api
    .post<AddAddressResponse>(`${BASE_URL}/api/addresses`, data)
    .then((res) => res.data);
};

export const updateAddress = (
  addressId: number,
  data: UpdateAddressRequest
): Promise<UpdateAddressResponse> => {
  return api
    .put<UpdateAddressResponse>(`${BASE_URL}/api/addresses/${addressId}`, data)
    .then((res) => res.data);
};

export const deleteAddress = (
  addressId: number
): Promise<DeleteAddressResponse> => {
  return api
    .delete<DeleteAddressResponse>(`${BASE_URL}/api/addresses/${addressId}`)
    .then((res) => res.data);
};
