import api from "../api/axios";
import type { ApiResponse } from "../types";
import type {
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UserData,
} from "../types/auth";

// Không khai báo BASE_URL nữa

export const register = (data: RegisterRequest): Promise<RegisterResponse> => {
  // Original: BASE_URL/auth/register
  return api
    .post<RegisterResponse>("/auth/register", data)
    .then((res) => res.data);
};

export const verifyOtp = (
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  // Original: BASE_URL/verify
  return api
    .post<VerifyOtpResponse>("/verify", data)
    .then((res) => res.data);
};

export const login = (data: LoginRequest): Promise<LoginResponse> => {
  // Original: BASE_URL/auth/login
  return api
    .post<LoginResponse>("/auth/login", data)
    .then((res) => res.data);
};

export const refreshToken = (
  data: RefreshTokenRequest
): Promise<RefreshTokenResponse> => {
  // Original: BASE_URL/auth/refreshtoken
  return api
    .post<RefreshTokenResponse>("/auth/refreshtoken", data)
    .then((res) => res.data);
};

export const getUserProfile = (): Promise<ApiResponse<UserData>> => {
  // Original: BASE_URL/api/users/profile
  return api
    .get<ApiResponse<UserData>>("/api/users/profile")
    .then((res) => res.data);
};

export const updatePassword = (
  data: UpdatePasswordRequest
): Promise<UpdatePasswordResponse> => {
  // Original: BASE_URL/api/users/update-password
  return api
    .put<UpdatePasswordResponse>("/api/users/update-password", data)
    .then((res) => res.data);
};

export const updateUserProfile = (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  // Original: BASE_URL/api/users/profile
  return api
    .put<UpdateProfileResponse>("/api/users/profile", data)
    .then((res) => res.data);
};