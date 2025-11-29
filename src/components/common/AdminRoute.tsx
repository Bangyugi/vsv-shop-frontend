import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Box, CircularProgress } from "@mui/material";

/**
 * Component này bảo vệ các route chỉ dành cho Admin.
 * 1. Kiểm tra đang loading auth state.
 * 2. Kiểm tra đã đăng nhập (isAuthenticated).
 * 3. Kiểm tra có vai trò 'ROLE_ADMIN' hay không.
 */
const AdminRoute = () => {
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

  const isAdmin =
    isAuthenticated && user?.roles.some((role) => role.name === "ROLE_ADMIN");

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
