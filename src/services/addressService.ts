import api from "../api/axios";
import type {
  GetAddressesResponse,
  AddAddressRequest,
  AddAddressResponse,
  UpdateAddressRequest,
  UpdateAddressResponse,
  DeleteAddressResponse,
} from "../types/address";

export const getMyAddresses = (): Promise<GetAddressesResponse> => {
  return api
    .get<GetAddressesResponse>("/api/addresses")
    .then((res) => res.data);
};

export const addAddress = (
  data: AddAddressRequest
): Promise<AddAddressResponse> => {
  return api
    .post<AddAddressResponse>("/api/addresses", data)
    .then((res) => res.data);
};

export const updateAddress = (
  addressId: number,
  data: UpdateAddressRequest
): Promise<UpdateAddressResponse> => {
  return api
    .put<UpdateAddressResponse>(`/api/addresses/${addressId}`, data)
    .then((res) => res.data);
};

export const deleteAddress = (
  addressId: number
): Promise<DeleteAddressResponse> => {
  return api
    .delete<DeleteAddressResponse>(`/api/addresses/${addressId}`)
    .then((res) => res.data);
};