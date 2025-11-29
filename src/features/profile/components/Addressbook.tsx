import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Chip,
  Collapse,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { Add, EditOutlined, DeleteOutline } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import type { UserAddress } from "../../../types";
import AddressForm from "../../checkout/components/AddressForm";

import * as addressService from "../../../services/addressService";
import type {
  ApiAddress,
  AddAddressRequest,
  UpdateAddressRequest,
} from "../../../types/address";
import { useAuth } from "../../../contexts/AuthContext";
// --- THÊM IMPORT MỚI ---
import { mapApiAddressToUserAddress } from "../../../utils/addressUtils";
// --- KẾT THÚC THÊM ---

/**
 * --- XÓA HÀM TRÙNG LẶP ---
 */
// const mapApiAddressToUserAddress = ( ... )
// --- KẾT THÚC XÓA ---

const AddressBook = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchAddresses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await addressService.getMyAddresses();

        if (response.code === 200 && response.data) {
          const mappedAddresses = response.data.map((apiAddr) =>
            mapApiAddressToUserAddress(apiAddr, user)
          );

          const hasDefault = mappedAddresses.some((addr) => addr.isDefault);
          if (!hasDefault && mappedAddresses.length > 0) {
            mappedAddresses[0].isDefault = true;
          }

          setAddresses(mappedAddresses);
        } else if (response.code === 200 && !response.data) {
          setAddresses([]);
        } else {
          throw new Error(response.message || "Failed to fetch addresses");
        }
      } catch (err: any) {
        console.error("Error fetching addresses:", err);
        setError(
          err.response?.data?.message || err.message || "An error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const handleSaveAddress = async (savedAddressDataFromForm: UserAddress) => {
    if (!user) {
      setSubmitError("User not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const apiRequestData: AddAddressRequest | UpdateAddressRequest = {
      fullName: savedAddressDataFromForm.fullName,
      phoneNumber: savedAddressDataFromForm.phone,
      email: savedAddressDataFromForm.email,
      address: savedAddressDataFromForm.address,
      district: savedAddressDataFromForm.district,
      province: savedAddressDataFromForm.city,
      country: "Việt Nam",
      note: savedAddressDataFromForm.note || null,
    };

    try {
      let response;
      let updatedOrNewApiAddress: ApiAddress;

      if (editingAddress) {
        const addressIdToUpdate = Number(editingAddress.id);
        if (isNaN(addressIdToUpdate)) {
          throw new Error("Invalid address ID for update.");
        }
        response = await addressService.updateAddress(
          addressIdToUpdate,
          apiRequestData as UpdateAddressRequest
        );
        if (response.code === 200 && response.data) {
          updatedOrNewApiAddress = response.data;
          const updatedUserAddress = mapApiAddressToUserAddress(
            updatedOrNewApiAddress,
            user
          );
          setAddresses((prev) =>
            prev.map((addr) =>
              addr.id === editingAddress.id ? updatedUserAddress : addr
            )
          );
          console.log("Address updated successfully:", updatedUserAddress);
        } else {
          throw new Error(response.message || "Failed to update address");
        }
      } else {
        response = await addressService.addAddress(
          apiRequestData as AddAddressRequest
        );
        if ((response.code === 200 || response.code === 201) && response.data) {
          updatedOrNewApiAddress = response.data;
          const newUserAddress = mapApiAddressToUserAddress(
            updatedOrNewApiAddress,
            user
          );
          if (addresses.length === 0) {
            newUserAddress.isDefault = true;
          }
          setAddresses((prev) => [newUserAddress, ...prev]);
          console.log("Address added successfully:", newUserAddress);
        } else {
          throw new Error(response.message || "Failed to add address");
        }
      }
      setShowForm(false);
      setEditingAddress(null);
    } catch (err: any) {
      console.error("Failed to save address:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while saving.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDefault = (id: number | string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    console.log("Set default (local):", id);
  };

  const removeAddress = async (id: number | string) => {
    const addressIdToDelete = Number(id);
    if (isNaN(addressIdToDelete)) {
      setSnackbar({
        open: true,
        message: "Invalid address ID for deletion.",
        severity: "error",
      });
      return;
    }

    const originalAddresses = [...addresses];
    const addressToRemove = originalAddresses.find(
      (addr) => addr.id === addressIdToDelete
    );
    const wasDefault = addressToRemove ? addressToRemove.isDefault : false;
    let remainingAddresses = originalAddresses.filter(
      (addr) => addr.id !== addressIdToDelete
    );

    if (wasDefault && remainingAddresses.length > 0) {
      const isAnyOtherDefault = remainingAddresses.some(
        (addr) => addr.isDefault
      );
      if (!isAnyOtherDefault) {
        remainingAddresses[0] = {
          ...remainingAddresses[0],
          isDefault: true,
        };
      }
    }
    setAddresses(remainingAddresses);

    try {
      const response = await addressService.deleteAddress(addressIdToDelete);
      if (response.code === 200 || response.code === 204) {
        setSnackbar({
          open: true,
          message: "Address deleted successfully.",
          severity: "success",
        });
      } else {
        throw new Error(response.message || "Failed to delete address");
      }
    } catch (err: any) {
      console.error("Failed to delete address:", err);
      setAddresses(originalAddresses);
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          err.message ||
          "Could not delete address.",
        severity: "error",
      });
    }
  };

  const handleAddNewClick = () => {
    setEditingAddress(null);
    setSubmitError(null);
    setShowForm(true);
  };

  const handleEditClick = (address: UserAddress) => {
    setEditingAddress(address);
    setSubmitError(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    setSubmitError(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box className="flex justify-between items-center" sx={{ mb: 6 }}>
        <Typography variant="h5" component="h2" className="font-bold">
          Address Book
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNewClick}
          sx={{ borderRadius: "50px", bgcolor: "primary.main" }}
        >
          Add New Address
        </Button>
      </Box>

      <Collapse in={showForm} timeout="auto" unmountOnExit>
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 3, mb: 4, borderRadius: "12px" }}
        >
          <AddressForm
            initialData={editingAddress}
            onSave={handleSaveAddress}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </Paper>
      </Collapse>

      {isLoading && (
        <Box className="flex justify-center items-center min-h-[200px]">
          <CircularProgress />
        </Box>
      )}

      {!isLoading && error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {!isLoading && !error && (
        <Box className="space-y-4">
          <AnimatePresence>
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  elevation={0}
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: "12px",
                    borderColor: addr.isDefault ? "primary.main" : "divider",
                    borderWidth: addr.isDefault ? "2px" : "1px",
                  }}
                >
                  <Box className="flex justify-between items-start">
                    <Box>
                      <Box className="flex items-center gap-2 " sx={{ mb: 2 }}>
                        <Typography className="font-bold">
                          {addr.fullName || "N/A"}
                        </Typography>
                        {addr.isDefault && (
                          <Chip label="Default" color="primary" size="small" />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {addr.address}, {addr.district}, {addr.city}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phone: {addr.phone || "N/A"}
                      </Typography>
                      {addr.note && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5, fontStyle: "italic" }}
                        >
                          Note: {addr.note}
                        </Typography>
                      )}
                    </Box>
                    <Box className="flex flex-col sm:flex-row gap-1">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(addr)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => removeAddress(addr.id)}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  {!addr.isDefault && (
                    <Button
                      variant="text"
                      onClick={() => setDefault(addr.id)}
                      sx={{ mt: 2, p: 0, color: "primary.main" }}
                    >
                      Set as Default
                    </Button>
                  )}
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}

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
    </motion.div>
  );
};

export default AddressBook;
