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

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://vsv-shop-backend-production.up.railway.app";

export const register = (data: RegisterRequest): Promise<RegisterResponse> => {
  return api
    .post<RegisterResponse>(`${BASE_URL}/auth/register`, data)
    .then((res) => res.data);
};

export const verifyOtp = (
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  return api
    .post<VerifyOtpResponse>(`${BASE_URL}/verify`, data)
    .then((res) => res.data);
};

export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return api
    .post<LoginResponse>(`${BASE_URL}/auth/login`, data)
    .then((res) => res.data);
};

export const refreshToken = (
  data: RefreshTokenRequest
): Promise<RefreshTokenResponse> => {
  return api
    .post<RefreshTokenResponse>(`${BASE_URL}/auth/refreshtoken`, data)
    .then((res) => res.data);
};

export const getUserProfile = (): Promise<ApiResponse<UserData>> => {
  return api
    .get<ApiResponse<UserData>>(`${BASE_URL}/api/users/profile`)
    .then((res) => res.data);
};

export const updatePassword = (
  data: UpdatePasswordRequest
): Promise<UpdatePasswordResponse> => {
  return api
    .put<UpdatePasswordResponse>(`${BASE_URL}/api/users/update-password`, data)
    .then((res) => res.data);
};

export const updateUserProfile = (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  return api
    .put<UpdateProfileResponse>(`${BASE_URL}/api/users/profile`, data)
    .then((res) => res.data);
};
