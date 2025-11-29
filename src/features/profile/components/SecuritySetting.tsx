// src/features/profile/components/SecuritySetting.tsx
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress, // <-- Thêm CircularProgress
  Alert, // <-- Thêm Alert
  // Snackbar, // <-- Thêm Snackbar (Tùy chọn, nếu muốn dùng Snackbar thay Alert)
} from "@mui/material";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { motion } from "framer-motion";
import * as authService from "../../../services/authService"; // <-- Import authService
import { useAuth } from "../../../contexts/AuthContext"; // <-- THÊM

// --- Validation Schema ---
// (Giữ nguyên validation schema)
const validationSchema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required")
    // Thêm kiểm tra không trùng mật khẩu cũ
    .notOneOf(
      [yup.ref("currentPassword")],
      "New password must be different from the current one"
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm password is required"),
});

// --- Component ---
const SecuritySettings = () => {
  // State hiển thị mật khẩu
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- State cho thông báo ---
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { logout } = useAuth(); // <-- THÊM: Lấy hàm logout từ context

  // --- Formik Hook ---
  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setFieldError }) => {
      setSubmitStatus(null); // Reset thông báo trước khi submit
      try {
        const requestData = {
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
        };
        const response = await authService.updatePassword(requestData);

        if (response.code === 200) {
          setSubmitStatus({
            type: "success",
            // <-- THAY ĐỔI: Cập nhật thông báo
            message: "Password updated successfully! You will be logged out.",
          });
          resetForm(); // Reset form sau khi thành công

          // --- THÊM: Tự động logout sau 1.5s ---
          setTimeout(() => {
            logout();
          }, 1500);
          // --- KẾT THÚC THÊM ---
        } else {
          // Ném lỗi với message từ API nếu code không phải 200
          throw new Error(response.message || "Failed to update password");
        }
      } catch (error: any) {
        console.error("Password update failed:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.";
        setSubmitStatus({ type: "error", message: errorMessage });

        // Tùy chọn: Set lỗi cụ thể cho trường nếu API trả về chi tiết
        if (errorMessage.toLowerCase().includes("old password")) {
          setFieldError("currentPassword", errorMessage);
        }
      } finally {
        setSubmitting(false); // Kết thúc trạng thái submitting của Formik
      }
    },
  });

  // --- Hàm tiện ích tạo icon ẩn/hiện mật khẩu ---
  const createEndAdornment = (
    show: boolean,
    setShow: (show: boolean) => void
  ) => ({
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={() => setShow(!show)} edge="end">
          {show ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  });

  // --- JSX ---
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography
        variant="h5"
        component="h2"
        className="font-bold"
        sx={{ mb: 6 }}
      >
        Change Password
      </Typography>

      {/* --- Hiển thị thông báo thành công/lỗi --- */}
      {submitStatus && (
        <Alert severity={submitStatus.type} sx={{ mb: 3 }}>
          {submitStatus.message}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        noValidate
        sx={{
          maxWidth: "80%", // Giữ giới hạn chiều rộng nếu muốn
          margin: "0 auto",
        }}
      >
        <Grid container spacing={3}>
          {/* Current Password */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              name="currentPassword"
              label="Current Password"
              type={showCurrent ? "text" : "password"}
              value={formik.values.currentPassword}
              onChange={formik.handleChange}
              error={
                formik.touched.currentPassword &&
                Boolean(formik.errors.currentPassword)
              }
              helperText={
                formik.touched.currentPassword && formik.errors.currentPassword
              }
              InputProps={createEndAdornment(showCurrent, setShowCurrent)}
              disabled={formik.isSubmitting} // Disable khi đang submit
            />
          </Grid>
          {/* New Password */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              name="newPassword"
              label="New Password"
              type={showNew ? "text" : "password"}
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              error={
                formik.touched.newPassword && Boolean(formik.errors.newPassword)
              }
              helperText={
                formik.touched.newPassword && formik.errors.newPassword
              }
              InputProps={createEndAdornment(showNew, setShowNew)}
              disabled={formik.isSubmitting} // Disable khi đang submit
            />
          </Grid>
          {/* Confirm New Password */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirm ? "text" : "password"}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              InputProps={createEndAdornment(showConfirm, setShowConfirm)}
              disabled={formik.isSubmitting} // Disable khi đang submit
            />
          </Grid>
          {/* Submit Button */}
          <Grid item xs={12} className="text-right">
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={formik.isSubmitting} // Disable nút khi đang submit
              sx={{ bgcolor: "primary.main", borderRadius: "50px", px: 4 }}
            >
              {/* Hiển thị loading indicator */}
              {formik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update Password"
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Tùy chọn: Dùng Snackbar thay vì Alert */}
      {/*
      <Snackbar
          open={!!submitStatus}
          autoHideDuration={6000}
          onClose={() => setSubmitStatus(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
          {submitStatus && (
              <Alert
                  onClose={() => setSubmitStatus(null)}
                  severity={submitStatus.type}
                  variant="filled"
                  sx={{ width: '100%' }}
              >
                  {submitStatus.message}
              </Alert>
          )}
      </Snackbar>
      */}
    </motion.div>
  );
};

export default SecuritySettings;
