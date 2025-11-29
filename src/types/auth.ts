import type { ApiResponse } from "./index";

/**
 * Kiểu dữ liệu chung cho response từ API
 * --- XÓA ĐỊNH NGHĨA TRÙNG LẶP ---
 */

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
}

export interface UserRole {
  id: number;
  name: string;
  description: string;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar: string;
  gender: Gender;
  birthDate: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  accountStatus: string;
  roles: UserRole[];
}

export type RegisterResponse = ApiResponse<UserData>;

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export type VerifyOtpResponse = ApiResponse<null>;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponseData {
  tokenType: "Bearer";
  accessToken: string;
  refreshToken: string;
  expiredTime: string;
}

export type LoginResponse = ApiResponse<AuthResponseData>;

export interface RefreshTokenRequest {
  refreshToken: string;
}

export type RefreshTokenResponse = ApiResponse<AuthResponseData>;

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export type UpdatePasswordResponse = ApiResponse<null>;

export interface UpdateProfileRequest {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  avatar: string;
  gender: Gender;
}

export type UpdateProfileResponse = ApiResponse<UserData>;
