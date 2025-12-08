import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  IconButton,
  InputAdornment,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  FormHelperText,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonOutline,
  EmailOutlined,
  LockOutlined,
  PhoneOutlined,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import * as authService from "../../../services/authService";
import * as uploadService from "../../../services/uploadService";
import type { RegisterRequest } from "../../../types/auth";

const validationSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  username: yup.string().required("Username is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  birthDate: yup
    .date()
    .typeError("Invalid date format") // Handles empty string casting errors
    .required("Date of birth is required"),
  gender: yup.string().required("Gender is required"),
  password: yup
    .string()
    .min(6, "Password should be of minimum 6 characters length")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  avatar: yup.string(),
});

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false); // New loading state for avatar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  } | null>(null);
  
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "MALE",
      password: "",
      confirmPassword: "",
      avatar: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const registerData: RegisterRequest = {
          username: values.username,
          password: values.password,
          email: values.email,
          phone: values.phone,
          firstName: values.firstName,
          lastName: values.lastName,
          birthDate: values.birthDate,
          gender: values.gender as "MALE" | "FEMALE" | "OTHER",
          avatar: values.avatar,
        };

        const response = await authService.register(registerData);

        if (response.code === 200) {
          setSnackbar({
            open: true,
            message: response.message || "Registration successful!",
            severity: "success",
          });

          setTimeout(() => {
            navigate("/verify", { state: { email: values.email } });
          }, 1500);
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again.";
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Warn user if silent validation prevents submission
  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isValid && !formik.isSubmitting) {
      setSnackbar({
        open: true,
        message: "Please fix the errors in the form before registering.",
        severity: "warning",
      });
    }
  }, [formik.submitCount, formik.isValid, formik.isSubmitting]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      try {
        // uploadService now correctly returns just the string URL
        const url = await uploadService.uploadFile(file);
        
        // Update Formik state
        formik.setFieldValue("avatar", url);
        
        setSnackbar({
          open: true,
          message: "Avatar uploaded successfully!",
          severity: "success",
        });
      } catch (error: any) {
        console.error("Error uploading avatar:", error);
        setSnackbar({
          open: true,
          message: "Failed to upload avatar. Please try again.",
          severity: "error",
        });
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          width: "100%",
          maxWidth: 600,
          borderRadius: "16px",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e0e0e0",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <Typography
            variant="h4"
            component="h1"
            className="font-bold text-center"
            sx={{ mb: 2 }}
          >
            Create an Account
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            className="text-center"
            sx={{ mb: 6 }}
          >
            Join us and start shopping!
          </Typography>

          {/* Avatar Upload Section */}
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
              disabled={isUploadingAvatar || formik.isSubmitting}
            />
            <label htmlFor="avatar-upload">
              <Button 
                variant="outlined" 
                component="span"
                disabled={isUploadingAvatar || formik.isSubmitting}
              >
                {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
              </Button>
            </label>
            
            {/* Show Loader or Image Preview */}
            <Box mt={2} sx={{ minHeight: 100, display: "flex", justifyContent: "center", alignItems: "center" }}>
              {isUploadingAvatar ? (
                <CircularProgress size={40} />
              ) : formik.values.avatar ? (
                <img
                  src={formik.values.avatar}
                  alt="Avatar Preview"
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    objectFit: "cover",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                  }}
                  onError={(e) => {
                    // Fallback if URL is broken
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/100?text=Error";
                  }}
                />
              ) : null}
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="First Name"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Last Name"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label="Username"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={
                  formik.touched.username && Boolean(formik.errors.username)
                }
                helperText={formik.touched.username && formik.errors.username}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlined sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="birthDate"
                name="birthDate"
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formik.values.birthDate}
                onChange={formik.handleChange}
                error={
                  formik.touched.birthDate && Boolean(formik.errors.birthDate)
                }
                helperText={formik.touched.birthDate && formik.errors.birthDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                error={formik.touched.gender && Boolean(formik.errors.gender)}
              >
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  name="gender"
                  label="Gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
                <FormHelperText>
                  {formik.touched.gender && formik.errors.gender}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={
                  formik.touched.confirmPassword &&
                  Boolean(formik.errors.confirmPassword)
                }
                helperText={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={formik.isSubmitting || isUploadingAvatar}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              bgcolor: "primary.main",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Register"
            )}
          </Button>
          <Typography
            variant="body2"
            color="text.secondary"
            className="text-center"
          >
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              variant="body2"
              underline="hover"
            >
              {"Login"}
            </Link>
          </Typography>
        </Box>
      </Paper>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert
            onClose={() => setSnackbar(null)}
            severity={snackbar.severity as any}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};

export default RegisterForm;