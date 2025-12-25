import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "../utils/tokenStorage";
import type { ApiResponse } from "../types";
import type {
  AuthResponseData,
  RefreshTokenRequest,
} from "../types/auth";

// CHÚ Ý: Chỉ để domain gốc, không thêm /api ở đây
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Nếu lỗi 401 và không phải request refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest.url?.includes("/auth/refreshtoken") &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        tokenStorage.clearTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const refreshRequest: RefreshTokenRequest = { refreshToken };
        
        // Gọi endpoint refresh token (đường dẫn tương đối)
        const rs = await axios.post<ApiResponse<AuthResponseData>>(
          `${API_BASE_URL}/api/auth/refreshtoken`, 
          refreshRequest
        );

        if (rs.data.code === 200 && rs.data.data) {
          const { accessToken, refreshToken: newRefreshToken } = rs.data.data;
          
          tokenStorage.setAccessToken(accessToken);
          tokenStorage.setRefreshToken(newRefreshToken);

          api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);

          return api(originalRequest);
        } else {
          throw new Error(rs.data.message || "Refresh token failed");
        }
      } catch (refreshError: any) {
        tokenStorage.clearTokens();
        processQueue(refreshError as AxiosError, null);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;