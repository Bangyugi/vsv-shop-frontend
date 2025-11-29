import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import * as tokenStorage from "../utils/tokenStorage";
import * as authService from "../services/authService";
// --- THAY ĐỔI 1: Sửa lỗi Import ---
import type { LoginRequest, UserData } from "../types/auth"; // Giữ nguyên
import type { ApiResponse as BaseApiResponse } from "../types"; // Import ApiResponse chuẩn
// --- KẾT THÚC THAY ĐỔI 1 ---
import { CircularProgress, Box } from "@mui/material";

interface AuthContextType {
  user: UserData | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
  setRefreshedUser: (data: UserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    tokenStorage.tokenStorage.getAccessToken()
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!accessToken;

  const logout = useCallback(() => {
    tokenStorage.tokenStorage.clearTokens();
    setAccessToken(null);
    setUser(null);
    navigate("/");
    console.log("User logged out and redirected to homepage.");
  }, [navigate]);

  const getUserData = useCallback(async () => {
    if (!tokenStorage.tokenStorage.getAccessToken()) {
      console.log("No access token, skipping user profile fetch.");
      setUser(null);
      return null;
    }
    setIsLoading(true);
    try {
      console.log("Fetching user profile...");

      // Dùng BaseApiResponse (data: UserData | null)
      const response: BaseApiResponse<UserData> =
        await authService.getUserProfile();

      // Kiểm tra response.data vẫn an toàn, vì setUser(null) là hợp lệ
      if (response.code === 200) {
        setUser(response.data);
        console.log("User profile fetched:", response.data);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error(
        "Failed to fetch user profile (refresh likely failed), logging out:",
        error.message
      );
      logout();
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const refreshUserProfile = useCallback(async () => {
    console.log("Refreshing user profile...");
    await getUserData();
    console.log("User profile refreshed.");
  }, [getUserData]);

  /**
   * Cập nhật trực tiếp state user từ dữ liệu (ví dụ: từ response của API update)
   * mà không cần fetch lại.
   */
  const setRefreshedUser = (data: UserData) => {
    setUser(data);
    console.log("User profile updated in context from PUT response.");
  };

  const handleInitialAuth = useCallback(async () => {
    setIsLoading(true);
    const at = tokenStorage.tokenStorage.getAccessToken();
    const rt = tokenStorage.tokenStorage.getRefreshToken();

    if (at) {
      console.log("Access token found, attempting to fetch user profile...");
      await getUserData();
    } else if (rt) {
      console.log("No access token, attempting refresh with refresh token...");
      try {
        await handleRefreshToken(rt);
        await getUserData();
      } catch (error) {
        console.error("Initial refresh failed, logging out.");
      }
    } else {
      console.log("No tokens found.");
      setUser(null);
    }
    setIsLoading(false);
  }, [getUserData, logout]);

  const handleRefreshToken = async (refreshTokenValue: string) => {
    try {
      const response = await authService.refreshToken({
        refreshToken: refreshTokenValue,
      });
      // --- THAY ĐỔI 2: Thêm kiểm tra response.data ---
      if (response.code === 200 && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        tokenStorage.tokenStorage.setAccessToken(accessToken);
        tokenStorage.tokenStorage.setRefreshToken(newRefreshToken);
        setAccessToken(accessToken);
        console.log("Token refreshed successfully by handleRefreshToken.");
      } else {
        console.error("API Error refreshing token:", response.message);
        throw new Error(response.message || "Refresh token failed via API");
      }
    } catch (error: any) {
      console.error("Refresh token failed, logging out:", error.message);
      logout();
      throw error;
    }
  };

  useEffect(() => {
    handleInitialAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authService.login(data);
      // --- THAY ĐỔI 3: Thêm kiểm tra response.data ---
      if (response.code === 200 && response.data) {
        const { accessToken, refreshToken } = response.data;
        tokenStorage.tokenStorage.setAccessToken(accessToken);
        tokenStorage.tokenStorage.setRefreshToken(refreshToken);
        setAccessToken(accessToken);
        console.log("Login successful.");

        await getUserData();

        navigate("/");
      } else {
        console.error("API Error during login:", response.message);

        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);

      throw error;
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshUserProfile,
      setRefreshedUser,
    }),
    [
      user,
      accessToken,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshUserProfile,
    ]
  );

  if (isLoading && !user && !tokenStorage.tokenStorage.getAccessToken()) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
