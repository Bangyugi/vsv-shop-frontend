import api from "../api/axios";
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
  ApiResponse,
} from "../types/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Đăng ký người dùng mới
 */
export const register = (data: RegisterRequest): Promise<RegisterResponse> => {
  return api
    .post<RegisterResponse>(`${BASE_URL}/auth/register`, data)
    .then((res) => res.data);
};

/**
 * Xác thực mã OTP
 */
export const verifyOtp = (
  data: VerifyOtpRequest
): Promise<VerifyOtpResponse> => {
  return api
    .post<VerifyOtpResponse>(`${BASE_URL}/verify`, data)
    .then((res) => res.data);
};

/**
 * Đăng nhập
 */
export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return api
    .post<LoginResponse>(`${BASE_URL}/auth/login`, data)
    .then((res) => res.data);
};

/**
 * Làm mới Access Token
 */
export const refreshToken = (
  data: RefreshTokenRequest
): Promise<RefreshTokenResponse> => {
  return api
    .post<RefreshTokenResponse>(`${BASE_URL}/auth/refreshtoken`, data)
    .then((res) => res.data);
};

/**
 * Lấy thông tin người dùng hiện tại
 */
export const getUserProfile = (): Promise<ApiResponse<UserData>> => {
  return api
    .get<ApiResponse<UserData>>(`${BASE_URL}/api/users/profile`)
    .then((res) => res.data);
};

/**
 * Cập nhật mật khẩu người dùng
 */
export const updatePassword = (
  data: UpdatePasswordRequest
): Promise<UpdatePasswordResponse> => {
  return api
    .put<UpdatePasswordResponse>(`${BASE_URL}/api/users/update-password`, data)
    .then((res) => res.data);
};

/**
 * Cập nhật thông tin profile người dùng
 */
export const updateUserProfile = (
  data: UpdateProfileRequest
): Promise<UpdateProfileResponse> => {
  return api
    .put<UpdateProfileResponse>(`${BASE_URL}/api/users/profile`, data)
    .then((res) => res.data);
};
