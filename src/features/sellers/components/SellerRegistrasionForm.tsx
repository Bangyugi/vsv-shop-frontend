import { useState, useEffect } from "react";
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
  Stepper,
  Step,
  StepLabel,
  Divider,
  type SelectChangeEvent,
} from "@mui/material";
import {
  BusinessCenterOutlined,
  LocalShippingOutlined,
  AccountBalanceOutlined,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import { mockProvinces, mockDistricts } from "../../../data/address";
import * as sellerService from "../../../services/sellerService";
import type { SellerRegistrationRequest } from "../../../types/seller";
import type { AddAddressRequest } from "../../../types/address";
import type { UserData } from "../../../types/auth";

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
// Schema for pickup address

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
  note: yup.string().notRequired(),
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

const validationSchemas = [businessSchema, addressSchema, bankSchema];

interface SellerRegistrationFormProps {
  user: UserData;
  onSuccess: () => void;
}

const SellerRegistrationForm: React.FC<SellerRegistrationFormProps> = ({
  user,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      businessName: "",
      businessEmail: "",
      businessMobile: "",
      businessAddress: "",
      logo: "",
      banner: "",
      fullName: `${user.firstName} ${user.lastName}`,
      phoneNumber: user.phone,
      email: user.email,
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
    validationSchema: validationSchemas[activeStep],
    onSubmit: async (values, { setSubmitting }) => {
      if (activeStep !== 2) return;

      setSubmitting(true);
      setApiError(null);

      const pickupAddress: AddAddressRequest = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        address: values.address,
        district: values.district,
        province: values.province,
        country: values.country,
        note: values.note,
      };

      const registrationData: SellerRegistrationRequest = {
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
        const response = await sellerService.registerAsSeller(registrationData);
        if (response.code === 200 || response.code === 201) {
          onSuccess();
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Registration failed. Please try again.";
        setApiError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const selectedProvince = formik.values.province;

  const [availableDistricts, setAvailableDistricts] = useState<string[]>(() =>
    selectedProvince ? mockDistricts[selectedProvince] || [] : []
  );

  useEffect(() => {
    if (selectedProvince) {
      setAvailableDistricts(mockDistricts[selectedProvince] || []);
    } else {
      setAvailableDistricts([]);
    }
  }, [selectedProvince]);

  const handleProvinceChange = (e: SelectChangeEvent<string>) => {
    formik.handleChange(e);
    formik.setFieldValue("district", "");
  };

  const handleNext = async () => {
    setApiError(null);
    const currentStepSchema = validationSchemas[activeStep];
    const currentStepFields = Object.keys(currentStepSchema.fields);

    try {
      await currentStepSchema.validate(formik.values, { abortEarly: false });
      if (activeStep === 2) {
        formik.submitForm();
      } else {
        setActiveStep((prev) => prev + 1);
        formik.setErrors({});
      }
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path && currentStepFields.includes(error.path)) {
            errors[error.path] = error.message;
          }
        });
        formik.setErrors(errors);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setApiError(null);
    formik.setErrors({});
  };

  const steps = [
    { label: "Business Details", icon: <BusinessCenterOutlined /> },
    { label: "Pickup Address", icon: <LocalShippingOutlined /> },
    { label: "Bank & Tax", icon: <AccountBalanceOutlined /> },
  ];

  return (
    <Paper
      elevation={0}
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: "16px",
        boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e0e0e0",
      }}
    >
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Typography
          variant="h4"
          component="h1"
          className="font-bold text-center"
          sx={{ mb: 2 }}
        >
          Become a Seller
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          className="text-center"
          sx={{ mb: 4 }}
        >
          Complete the steps to start selling on VSV Shop.
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel StepIconComponent={() => step.icon}>
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Divider sx={{ mb: 4 }} />

        {apiError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {apiError}
          </Alert>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {activeStep === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    className="font-semibold"
                    gutterBottom
                  >
                    1. Business Details
                  </Typography>
                </Grid>
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
                      formik.touched.businessEmail &&
                      formik.errors.businessEmail
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
                      formik.touched.businessMobile &&
                      formik.errors.businessMobile
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
                      formik.touched.businessAddress &&
                      formik.errors.businessAddress
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
                    error={
                      formik.touched.banner && Boolean(formik.errors.banner)
                    }
                    helperText={formik.touched.banner && formik.errors.banner}
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    className="font-semibold"
                    gutterBottom
                  >
                    2. Pickup Address
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="fullName"
                    label="Contact Name"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.fullName && Boolean(formik.errors.fullName)
                    }
                    helperText={
                      formik.touched.fullName && formik.errors.fullName
                    }
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
                      formik.touched.phoneNumber &&
                      Boolean(formik.errors.phoneNumber)
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
                    error={
                      formik.touched.province && Boolean(formik.errors.province)
                    }
                  >
                    <InputLabel>Province / City</InputLabel>
                    <Select
                      name="province"
                      label="Province / City"
                      value={formik.values.province}
                      onChange={handleProvinceChange}
                      onBlur={formik.handleBlur}
                    >
                      {mockProvinces.map((province) => (
                        <MenuItem key={province} value={province}>
                          {province}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {formik.touched.province && formik.errors.province}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.district && Boolean(formik.errors.district)
                    }
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
                          {district}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {formik.touched.district && formik.errors.district}
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
                    error={
                      formik.touched.address && Boolean(formik.errors.address)
                    }
                    helperText={formik.touched.address && formik.errors.address}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="country"
                    label="Country"
                    value={formik.values.country}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.country && Boolean(formik.errors.country)
                    }
                    helperText={formik.touched.country && formik.errors.country}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="note"
                    label="Note (Optional)"
                    value={formik.values.note}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.note && Boolean(formik.errors.note)}
                    helperText={formik.touched.note && formik.errors.note}
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    className="font-semibold"
                    gutterBottom
                  >
                    3. Bank & Tax Details
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="bankName"
                    label="Bank Name"
                    value={formik.values.bankName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.bankName && Boolean(formik.errors.bankName)
                    }
                    helperText={
                      formik.touched.bankName && formik.errors.bankName
                    }
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
                      formik.touched.accountNumber &&
                      formik.errors.accountNumber
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
                    error={
                      formik.touched.ifscCode && Boolean(formik.errors.ifscCode)
                    }
                    helperText={
                      formik.touched.ifscCode && formik.errors.ifscCode
                    }
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
            )}
          </motion.div>
        </AnimatePresence>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
          <Button
            variant="outlined"
            disabled={activeStep === 0 || formik.isSubmitting}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === 2 ? (
              "Submit Application"
            ) : (
              "Next"
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default SellerRegistrationForm;
