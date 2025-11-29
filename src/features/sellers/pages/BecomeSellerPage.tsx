// src/features/seller/pages/BecomeSellerPage.tsx
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import SellerRegistrationForm from "../components/SellerRegistrasionForm";
import { CheckCircleOutline } from "@mui/icons-material";
import { useState } from "react";
import { motion } from "framer-motion";

const BecomeSellerPage = () => {
  const { user, isAuthenticated, isLoading, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false); // Trạng thái khi gửi đơn thành công

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  // Chuyển hướng nếu chưa đăng nhập
  if (!isAuthenticated || !user) {
    navigate("/login", { state: { from: location } });
    return null;
  }

  // Kiểm tra nếu đã là Seller hoặc Admin
  const isSeller = user.roles.some((role) => role.name === "ROLE_SELLER");
  const isAdmin = user.roles.some((role) => role.name === "ROLE_ADMIN");

  if (isSeller || isAdmin) {
    return (
      <Box
        className="flex items-center justify-center min-h-screen"
        sx={{
          background:
            "linear-gradient(135deg, rgba(230, 247, 250, 0.5) 0%, rgba(255, 240, 245, 0.5) 100%)",
          p: 2,
        }}
      >
        <Paper
          elevation={0}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            p: { xs: 3, md: 5 },
            width: "100%",
            maxWidth: 500,
            borderRadius: "16px",
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e0e0e0",
            textAlign: "center",
          }}
        >
          <CheckCircleOutline
            sx={{ fontSize: "5rem", color: "success.main", mb: 2 }}
          />
          <Typography variant="h5" component="h1" className="font-bold">
            {isAdmin ? "You are an Admin" : "You are already a Seller!"}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 2, mb: 4 }}
          >
            {isAdmin
              ? "Your admin account has all seller privileges and more."
              : "Your application has been approved. You can start managing your store."}
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to={isAdmin ? "/admin" : "/seller"} // TODO: Cập nhật link seller dashboard
          >
            {isAdmin ? "Go to Admin" : "Go to Dashboard"}
          </Button>
        </Paper>
      </Box>
    );
  }

  // Xử lý khi form gửi thành công
  const handleSuccess = () => {
    setIsSuccess(true);
    refreshUserProfile(); // Cập nhật AuthContext (có thể user-role đổi sang PENDING_SELLER)
    window.scrollTo(0, 0); // Cuộn lên đầu
  };

  return (
    <Box
      className="flex items-center justify-center min-h-screen"
      sx={{
        background:
          "linear-gradient(135deg, rgba(230, 247, 250, 0.5) 0%, rgba(255, 240, 245, 0.5) 100%)",
        p: 2,
        py: 6, // Thêm padding y
      }}
    >
      <Container maxWidth="md">
        {isSuccess ? (
          // === Trạng thái Gửi Thành Công ===
          <Paper
            elevation={0}
            component={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: "16px",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e0e0e0",
              textAlign: "center",
            }}
          >
            <CheckCircleOutline
              sx={{ fontSize: "5rem", color: "primary.main", mb: 2 }}
            />
            <Typography variant="h5" component="h1" className="font-bold">
              Application Submitted!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 2, mb: 4 }}
            >
              Thank you for registering. Your application is pending review. We
              will notify you via email once it's approved.
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/profile?tab=account"
            >
              Back to Profile
            </Button>
          </Paper>
        ) : (
          // === Trạng thái Form Đăng Ký ===
          <SellerRegistrationForm user={user} onSuccess={handleSuccess} />
        )}
      </Container>
    </Box>
  );
};

export default BecomeSellerPage;
