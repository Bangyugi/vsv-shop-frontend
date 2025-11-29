// src/features/sellers/pages/SellerProfilePage.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert, 
  FormHelperText,
  Divider,
  Snackbar,
} from "@mui/material";
import {
  BusinessCenterOutlined,
  LocalShippingOutlined,
  AccountBalanceOutlined,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { motion } from "framer-motion";
import { mockProvinces, mockDistricts } from "../../../data/address";
import * as sellerService from "../../../services/sellerService";
import type { SellerRegistrationRequest } from "../../../types/seller";
import type { AddAddressRequest } from "../../../types/address";
import type { ApiSellerData } from "../../../types/seller";

const businessSchema = yup.object({
  businessName: yup.string().required("Business name is required"),
  businessEmail: yup
    .string()
    .email("Invalid email")
    .required("Business email is required"),
  businessMobile: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Business phone is required"),
  businessAddress: yup.string().required("Business address is required"),
  logo: yup.string().url("Must be a valid URL").notRequired(),
  banner: yup.string().url("Must be a valid URL").notRequired(),
});
const addressSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  phoneNumber: yup
    .string()
    .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
    .required("Phone number is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  address: yup.string().required("Street address is required"),
  province: yup.string().required("Province is required"),
  district: yup.string().required("District is required"),
  country: yup.string().required("Country is required"),
});
const bankSchema = yup.object({
  accountNumber: yup.string().required("Account number is required"),
  accountHolderName: yup.string().required("Account holder name is required"),
  bankName: yup.string().required("Bank name is required"),
  ifscCode: yup.string().required("Bank Code / SWIFT is required"),
  gstin: yup
    .string()
    .required("Tax ID / Business Registration No. is required"),
});
const combinedValidationSchema = businessSchema
  .concat(addressSchema)
  .concat(bankSchema);

const SellerProfilePage: React.FC = () => {
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);
  const [loadedSellerData, setLoadedSellerData] =
    useState<ApiSellerData | null>(null);

  const formik = useFormik({
    initialValues: {
      businessName: "",
      businessEmail: "",
      businessMobile: "",
      businessAddress: "",
      logo: "",
      banner: "",
      fullName: "",
      phoneNumber: "",
      email: "",
      address: "",
      district: "",
      province: "",
      country: "Việt Nam",
      note: "",
      accountNumber: "",
      accountHolderName: "",
      bankName: "",
      ifscCode: "",
      gstin: "",
    },
    validationSchema: combinedValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      setSnackbar(null); 

      if (!loadedSellerData) {
        setSnackbar({
          open: true,
          message: "Seller data not loaded. Cannot update.",
          severity: "error",
        });
        setSubmitting(false);
        return;
      }
      const sellerId = loadedSellerData.user.id;
      // const pickupAddressId = loadedSellerData.pickupAddress.id;

      const pickupAddress: AddAddressRequest = {
        // id: pickupAddressId, // Removed as it's not part of AddAddressRequest
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        address: values.address,
        district: values.district,
        province: values.province,
        country: values.country,
        note: values.note,
      };

      const updateData: SellerRegistrationRequest = {
        businessDetails: {
          businessName: values.businessName,
          businessEmail: values.businessEmail,
          businessMobile: values.businessMobile,
          businessAddress: values.businessAddress,
          logo: values.logo || "https://example.com/default-logo.png",
          banner: values.banner || "https://example.com/default-banner.png",
        },
        bankDetails: {
          accountNumber: values.accountNumber,
          accountHolderName: values.accountHolderName,
          bankName: values.bankName,
          ifscCode: values.ifscCode,
        },
        pickupAddress: pickupAddress,
        gstin: values.gstin,
      };

      try {
        const response = await sellerService.updateMySellerProfile(
          sellerId,
          updateData
        );
        if (response.code === 200 || response.code === 201) {
          setSnackbar({
            open: true,
            message: "Profile updated successfully!",
            severity: "success",
          });
          setLoadedSellerData(response.data);
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Update failed. Please try again.";
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  const selectedProvince = formik.values.province;
  const availableDistricts = useMemo(() => {
    if (selectedProvince) {
      return mockDistricts[selectedProvince] || [];
    }
    return [];
  }, [selectedProvince]);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingData(true);
      try {
        const response = await sellerService.getMySellerProfile();
        if (response.code === 200 && response.data) {
          const data: ApiSellerData = response.data;
          setLoadedSellerData(data);
          formik.setValues({
            businessName: data.businessDetails.businessName,
            businessEmail: data.businessDetails.businessEmail,
            businessMobile: data.businessDetails.businessMobile,
            businessAddress: data.businessDetails.businessAddress,
            logo: data.businessDetails.logo || "",
            banner: data.businessDetails.banner || "",
            fullName: data.pickupAddress.fullName || "",
            phoneNumber: data.pickupAddress.phoneNumber || "",
            email: data.pickupAddress.email || "",
            address: data.pickupAddress.address || "",
            district: data.pickupAddress.district || "",
            province: data.pickupAddress.province || "",
            country: data.pickupAddress.country || "Việt Nam",
            note: data.pickupAddress.note || "",
            accountNumber: data.bankDetails.accountNumber,
            accountHolderName: data.bankDetails.accountHolderName,
            bankName: data.bankDetails.bankName,
            ifscCode: data.bankDetails.ifscCode,
            gstin: data.gstin,
          });
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        setLoadError(error.message || "Failed to load profile data.");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadProfile();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  if (isLoadingData) {
    return (
      <Box className="flex justify-center items-center min-h-[50vh]">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Typography
          variant="h4"
          component="h1"
          className="font-bold"
          sx={{ mb: 4 }}
        >
          My Store Profile
        </Typography>


        {loadError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {loadError}
          </Alert>
        )}

        <Box className="flex items-center gap-2 mb-3">
          <BusinessCenterOutlined color="primary" />
          <Typography variant="h6" className="font-semibold">
            Business Details
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="businessName"
              label="Business Name"
              value={formik.values.businessName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.businessName &&
                Boolean(formik.errors.businessName)
              }
              helperText={
                formik.touched.businessName && formik.errors.businessName
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="businessEmail"
              label="Business Email"
              value={formik.values.businessEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.businessEmail &&
                Boolean(formik.errors.businessEmail)
              }
              helperText={
                formik.touched.businessEmail && formik.errors.businessEmail
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="businessMobile"
              label="Business Phone (10 digits)"
              value={formik.values.businessMobile}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.businessMobile &&
                Boolean(formik.errors.businessMobile)
              }
              helperText={
                formik.touched.businessMobile && formik.errors.businessMobile
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="businessAddress"
              label="Business Address"
              value={formik.values.businessAddress}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.businessAddress &&
                Boolean(formik.errors.businessAddress)
              }
              helperText={
                formik.touched.businessAddress && formik.errors.businessAddress
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="logo"
              label="Logo URL (Optional)"
              value={formik.values.logo}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.logo && Boolean(formik.errors.logo)}
              helperText={formik.touched.logo && formik.errors.logo}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="banner"
              label="Banner URL (Optional)"
              value={formik.values.banner}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.banner && Boolean(formik.errors.banner)}
              helperText={formik.touched.banner && formik.errors.banner}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box className="flex items-center gap-2 mb-3">
          <LocalShippingOutlined color="primary" />
          <Typography variant="h6" className="font-semibold">
            Pickup Address
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="fullName"
              label="Contact Name"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.fullName && Boolean(formik.errors.fullName)}
              helperText={formik.touched.fullName && formik.errors.fullName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="phoneNumber"
              label="Contact Phone (10 digits)"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)
              }
              helperText={
                formik.touched.phoneNumber && formik.errors.phoneNumber
              }
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="email"
              label="Contact Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              error={formik.touched.province && Boolean(formik.errors.province)}
            >
              <InputLabel>Province / City</InputLabel>
              <Select
                name="province"
                label="Province / City"
                value={formik.values.province}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                {mockProvinces.map((province) => (
                  <MenuItem key={province} value={province}>
                    {" "}
                    {province}{" "}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {" "}
                {formik.touched.province && formik.errors.province}{" "}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl
              fullWidth
              error={formik.touched.district && Boolean(formik.errors.district)}
            >
              <InputLabel>District</InputLabel>
              <Select
                name="district"
                label="District"
                value={formik.values.district}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!formik.values.province}
              >
                {availableDistricts.map((district) => (
                  <MenuItem key={district} value={district}>
                    {" "}
                    {district}{" "}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {" "}
                {formik.touched.district && formik.errors.district}{" "}
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="address"
              label="Street Address, Ward"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box className="flex items-center gap-2 mb-3">
          <AccountBalanceOutlined color="primary" />
          <Typography variant="h6" className="font-semibold">
            Bank & Tax Details
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="bankName"
              label="Bank Name"
              value={formik.values.bankName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.bankName && Boolean(formik.errors.bankName)}
              helperText={formik.touched.bankName && formik.errors.bankName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="accountHolderName"
              label="Account Holder Name"
              value={formik.values.accountHolderName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.accountHolderName &&
                Boolean(formik.errors.accountHolderName)
              }
              helperText={
                formik.touched.accountHolderName &&
                formik.errors.accountHolderName
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="accountNumber"
              label="Account Number"
              value={formik.values.accountNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.accountNumber &&
                Boolean(formik.errors.accountNumber)
              }
              helperText={
                formik.touched.accountNumber && formik.errors.accountNumber
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="ifscCode"
              label="Bank Code / SWIFT"
              value={formik.values.ifscCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.ifscCode && Boolean(formik.errors.ifscCode)}
              helperText={formik.touched.ifscCode && formik.errors.ifscCode}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="gstin"
              label="Tax ID / Business Reg. No."
              value={formik.values.gstin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.gstin && Boolean(formik.errors.gstin)}
              helperText={formik.touched.gstin && formik.errors.gstin}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={formik.isSubmitting || !formik.dirty}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Paper>
  );
};

export default SellerProfilePage;
