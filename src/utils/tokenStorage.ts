// src/utils/tokenStorage.ts
// Quản lý việc lưu trữ và truy xuất token.

/**
 * LƯU Ý BẢO MẬT:
 *
 * 1. Access Token: Thường được lưu trong bộ nhớ (ví dụ: React Context state) hoặc
 * sessionStorage. Nó không nên tồn tại quá lâu.
 *
 * 2. Refresh Token: Cần được lưu trữ một cách an toàn nhất có thể.
 * - TỐT NHẤT: Backend nên set Refresh Token dưới dạng `HttpOnly`, `Secure`,
 * `SameSite=Strict` cookie. Frontend sẽ không thể truy cập nó qua JavaScript,
 * giúp giảm nguy cơ tấn công XSS.
 * - KHẢ THI (Như trong ví dụ này): Nếu backend trả Refresh Token trong body,
 * chúng ta phải lưu nó trong `localStorage`. Điều này khiến nó có nguy cơ
 * bị tấn công XSS.
 *
 * Ví dụ này sử dụng sessionStorage cho accessToken và localStorage cho refreshToken.
 */

const ACCESS_TOKEN_KEY = "vsv_access_token";
const REFRESH_TOKEN_KEY = "vsv_refresh_token";

// === Access Token ===

// Export object chứa các phương thức xử lý token
export const tokenStorage = {
  setAccessToken: (token: string): void => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  getAccessToken: (): string | null => {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  removeAccessToken: (): void => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  // === Refresh Token ===

  setRefreshToken: (token: string): void => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  removeRefreshToken: (): void => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // === Clear All ===

  clearTokens: (): void => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// --- XÓA CÁC HÀM EXPORT LỖI BÊN DƯỚI ---
// (Đã xóa)
// --- KẾT THÚC XÓA ---
