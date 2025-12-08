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
import {
  CheckCircleOutline,
  HourglassEmptyOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { motion } from "framer-motion";

const BecomeSellerPage = () => {
  const { user, isAuthenticated, isLoading, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    navigate("/login", { state: { from: location } });
    return null;
  }
  // Check if user is already a seller or admin

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
            to={isAdmin ? "/admin" : "/seller"}
          >
            {isAdmin ? "Go to Admin" : "Go to Dashboard"}
          </Button>
        </Paper>
      </Box>
    );
  }

  const handleSuccess = () => {
    setIsSuccess(true);
    refreshUserProfile();
    window.scrollTo(0, 0);
  };

  return (
    <Box
      className="flex items-center justify-center min-h-screen"
      sx={{
        background:
          "linear-gradient(135deg, rgba(230, 247, 250, 0.5) 0%, rgba(255, 240, 245, 0.5) 100%)",
        p: 2,
        py: 6,
      }}
    >
      <Container maxWidth="md">
        {isSuccess ? (
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
            {/* CẬP NHẬT: Thay đổi icon và thông báo thành 'Pending' */}
            <HourglassEmptyOutlined
              sx={{ fontSize: "5rem", color: "warning.main", mb: 2 }}
            />
            <Typography variant="h5" component="h1" className="font-bold">
              Application Submitted Successfully!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 2, mb: 4, maxWidth: "400px", mx: "auto" }}
            >
              Thank you for registering. Your application is now{" "}
              <b>Pending Verification</b>.
              <br />
              <br />
              Our administrators will review your details. You will be granted
              Seller access once approved.
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
          <SellerRegistrationForm user={user} onSuccess={handleSuccess} />
        )}
      </Container>
    </Box>
  );
};

export default BecomeSellerPage;
