import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
  Alert,
} from "@mui/material";
import type { AddressDetails } from "../../../types";
import { mockProvinces, mockDistricts } from "../../../data/address";

interface AddressFormProps {
  onSave: (address: AddressDetails) => void;
  onCancel: () => void;
  initialData?: AddressDetails | null;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const AddressForm = ({
  onSave,
  onCancel,
  initialData,
  isSubmitting = false,
  submitError = null,
}: AddressFormProps) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    district: initialData?.district || "",
    note: initialData?.note || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (initialData?.city) {
      setAvailableDistricts(mockDistricts[initialData.city] || []);
    } else {
      setAvailableDistricts([]);
    }
  }, [initialData?.city]);

  useEffect(() => {
    setFormData({
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      district: initialData?.district || "",
      note: initialData?.note || "",
    });
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.phone) newErrors.phone = "Phone Number is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.city) newErrors.city = "Province / City is required";
    if (!formData.district) newErrors.district = "District is required";
    if (!formData.address)
      newErrors.address = "Address (Street, number) is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;

    if (name === "city") {
      const province = value as string;
      setAvailableDistricts(mockDistricts[province] || []);
      setFormData((prev) => ({
        ...prev,
        city: province,

        district: province === prev.city ? prev.district : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name as string]: value as string }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const newAddress: AddressDetails = {
        ...formData,
        id: initialData?.id || `new-${Date.now()}`,
        label: `${formData.address}, ${formData.district}, ${formData.city}`,
        city: formData.city,
        district: formData.district,
      };
      onSave(newAddress);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography
        variant="subtitle1"
        className="font-semibold"
        sx={{
          mb: 2,
        }}
      >
        {initialData ? "Edit shipping address" : "Add a new shipping address"}
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Full Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="fullName"
            label="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            error={!!errors.fullName}
            helperText={errors.fullName}
            disabled={isSubmitting}
          />
        </Grid>
        {/* Phone Number */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone}
            disabled={isSubmitting}
          />
        </Grid>
        {/* Email */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            disabled={isSubmitting}
          />
        </Grid>

        {/* Province / City */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.city}>
            <InputLabel>Province / City</InputLabel>
            <Select
              name="city"
              label="Province / City"
              value={formData.city}
              onChange={handleChange as any}
              disabled={isSubmitting}
            >
              {mockProvinces.map((province) => (
                <MenuItem key={province} value={province}>
                  {province}
                </MenuItem>
              ))}
            </Select>
            {errors.city && <FormHelperText>{errors.city}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* District */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.district}>
            <InputLabel>District</InputLabel>
            <Select
              name="district"
              label="District"
              value={formData.district}
              onChange={handleChange as any}
              disabled={!formData.city || isSubmitting}
            >
              {availableDistricts.map((district) => (
                <MenuItem key={district} value={district}>
                  {district}
                </MenuItem>
              ))}
            </Select>
            {errors.district && (
              <FormHelperText>{errors.district}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {/* Address (Street, number) */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="address"
            label="Address (Street, number)"
            value={formData.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={errors.address}
            disabled={isSubmitting}
          />
        </Grid>

        {/* Note (Optional) */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="note"
            label="Note (Optional)"
            value={formData.note}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </Grid>

        {/* Buttons */}
        <Grid item xs={12} className="flex gap-2 justify-end">
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Save Address"
            )}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddressForm;
