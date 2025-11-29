// src/utils/addressUtils.ts
import type { ApiAddress } from "../types/address";
import type { UserAddress } from "../types";
import type { UserData } from "../types/auth";

/**
 * Ánh xạ dữ liệu địa chỉ thô từ API (ApiAddress) sang kiểu UserAddress (frontend).
 * Tách ra thành hàm dùng chung để tránh trùng lặp code.
 */
export const mapApiAddressToUserAddress = (
  apiAddr: ApiAddress,
  user:
    | UserData
    | {
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
      }
): UserAddress => {
  const label = [
    apiAddr.address,
    apiAddr.ward,
    apiAddr.district,
    apiAddr.province,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: apiAddr.id,
    label: label,
    fullName: apiAddr.fullName || `${user.firstName} ${user.lastName}`,
    phone: apiAddr.phoneNumber || user.phone,
    email: apiAddr.email || user.email,
    address: apiAddr.address,
    city: apiAddr.province,
    district: apiAddr.district,
    isDefault: apiAddr.isDefault || false,
    note: apiAddr.note || undefined,
  };
};
