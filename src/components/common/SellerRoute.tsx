import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Box, CircularProgress } from "@mui/material";

/**
 * Component này bảo vệ các route chỉ dành cho Seller (và Admin).
 * 1. Kiểm tra đang loading auth state.
 * 2. Kiểm tra đã đăng nhập (isAuthenticated).
 * 3. Kiểm tra có vai trò 'ROLE_SELLER' hoặc 'ROLE_ADMIN'.
 */
const SellerRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
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

  const isAuthorized =
    isAuthenticated &&
    user?.roles.some(
      (role) =>
        role.name === "ROLE_SELLER" ||
        role.name === "ROLE_ADMIN" ||
        role.name === "ROLE_SUPERADMIN"
    );

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default SellerRoute;
