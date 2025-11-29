import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  FormHelperText,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { motion } from "framer-motion";
import { useAuth } from "../../../contexts/AuthContext";
import type { Gender, UpdateProfileRequest } from "../../../types/auth";
import * as authService from "../../../services/authService";

const validationSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: yup
    .string()
    .matches(/^(0[3|5|7|8|9])+([0-9]{8})\b/, "Invalid phone number")
    .required("Phone number is required"),
  birthDate: yup.date().required("Date of birth is required"),
  gender: yup
    .string()
    .oneOf(["MALE", "FEMALE", "OTHER"])
    .required("Gender is required"),
  avatar: yup.string().url("Must be a valid URL"),
});

const AccountDetails = () => {
  const { user, setRefreshedUser } = useAuth();
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: "",
      gender: "MALE" as Gender,
      avatar: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitStatus(null);
      if (!user) {
        setSubmitStatus({ type: "error", message: "User not loaded yet." });
        setSubmitting(false);
        return;
      }

      const apiRequestData: UpdateProfileRequest = {
        email: values.email,
        phone: values.phone,
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate,
        avatar: values.avatar || user.avatar,
        gender: values.gender,
      };

      console.log("Attempting to update profile:", apiRequestData);
      try {
        const response = await authService.updateUserProfile(apiRequestData);

        if (response.code === 200 && response.data) {
          setSubmitStatus({
            type: "success",
            message: "Profile updated successfully!",
          });

          setRefreshedUser(response.data);
        } else {
          throw new Error(response.message || "Failed to update profile.");
        }
      } catch (error: any) {
        console.error("Update failed:", error);
        setSubmitStatus({
          type: "error",
          message:
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred.",
        });
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (user) {
      formik.setValues({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate ? user.birthDate.split("T")[0] : "",
        gender: user.gender || "MALE",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  if (!user) {
    return <CircularProgress />;
  }

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
        Account Information
      </Typography>

      {submitStatus && (
        <Alert severity={submitStatus.type} sx={{ mb: 3 }}>
          {submitStatus.message}
        </Alert>
      )}

      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* First Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="firstName"
              name="firstName"
              label="First Name"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.firstName && Boolean(formik.errors.firstName)
              }
              helperText={formik.touched.firstName && formik.errors.firstName}
              disabled={formik.isSubmitting}
            />
          </Grid>
          {/* Last Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="lastName"
              name="lastName"
              label="Last Name"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              disabled={formik.isSubmitting}
            />
          </Grid>
          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled
            />
          </Grid>
          {/* Phone */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="phone"
              name="phone"
              label="Phone Number"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
              disabled={formik.isSubmitting}
            />
          </Grid>
          {/* Birth Date */}
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
              onBlur={formik.handleBlur}
              error={
                formik.touched.birthDate && Boolean(formik.errors.birthDate)
              }
              helperText={formik.touched.birthDate && formik.errors.birthDate}
              disabled={formik.isSubmitting}
            />
          </Grid>
          {/* Gender */}
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              error={formik.touched.gender && Boolean(formik.errors.gender)}
              disabled={formik.isSubmitting}
            >
              <InputLabel id="gender-label">Gender</InputLabel>
              <Select
                labelId="gender-label"
                id="gender"
                name="gender"
                label="Gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <MenuItem value="MALE">Male</MenuItem>
                <MenuItem value="FEMALE">Female</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
              {formik.touched.gender && formik.errors.gender && (
                <FormHelperText>{formik.errors.gender}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          {/* Avatar URL */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="avatar"
              name="avatar"
              label="Avatar URL (Optional)"
              value={formik.values.avatar}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.avatar && Boolean(formik.errors.avatar)}
              helperText={formik.touched.avatar && formik.errors.avatar}
              disabled={formik.isSubmitting}
            />
          </Grid>
          {/* Submit Button */}
          <Grid item xs={12} className="text-right">
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={formik.isSubmitting || !formik.dirty}
              sx={{ bgcolor: "primary.main", borderRadius: "50px", px: 4 }}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default AccountDetails;
