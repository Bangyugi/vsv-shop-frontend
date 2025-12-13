import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import AddressSelector from "../components/AddressSelector";
import AddressForm from "../components/AddressForm";
import OrderSummary from "../components/OrderSummary";
import PaymentMethod from "../components/PaymentMethod";
import type { PaymentValue } from "../components/PaymentMethod";
import type { UserAddress, CheckoutCartItem } from "../../../types";
// FIX: Xóa ApiAddress
import type { AddAddressRequest } from "../../../types/address";
import type { CreateOrderRequest } from "../../../types/order";

import { useAuth } from "../../../contexts/AuthContext";
import { useCart } from "../../../contexts/CartContext";
import * as addressService from "../../../services/addressService";
import * as orderService from "../../../services/orderService";
import * as paymentService from "../../../services/paymentService";
import { mapApiAddressToUserAddress } from "../../../utils/addressUtils";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const CheckoutPage = () => {
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [addressSubmitError, setAddressSubmitError] = useState<string | null>(
    null
  );
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentValue>("cod");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const { cartData, fetchCart } = useCart();

  const checkoutItems: CheckoutCartItem[] = useMemo(() => {
    if (!cartData) return [];
    return cartData.cartItems.map((item) => ({
      id: item.id,
      name: item.product.title,
      price: item.sellingPrice,
      quantity: item.quantity,
      image: item.product.images?.[0] || "/placeholder.png",
      sku: item.variant.sku,
    }));
  }, [cartData]);

  const apiOriginalSubtotal = useMemo(
    () => cartData?.totalPrice || 0,
    [cartData]
  );
  const apiSellingSubtotal = useMemo(
    () => cartData?.totalSellingPrice || 0,
    [cartData]
  );
  const apiCouponPercentage = useMemo(
    () => cartData?.discount || 0,
    [cartData]
  );

  const hasCoupon = apiCouponPercentage > 0;

  const preCouponSellingTotal = useMemo(() => {
    if (hasCoupon && apiCouponPercentage < 100) {
      return apiSellingSubtotal / (1 - apiCouponPercentage / 100);
    }
    return apiSellingSubtotal;
  }, [apiSellingSubtotal, apiCouponPercentage, hasCoupon]);

  const couponDiscountAmount = useMemo(() => {
    if (hasCoupon) {
      return preCouponSellingTotal - apiSellingSubtotal;
    }
    return 0;
  }, [preCouponSellingTotal, apiSellingSubtotal, hasCoupon]);

  const shippingFee = 0;
  const total = apiSellingSubtotal + shippingFee;

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!cartData || cartData.totalItem === 0) {
      if (!cartData && checkoutItems.length === 0) {
        setSnackbar({
          open: true,
          message: "Your cart is empty. Redirecting...",
          severity: "info",
        });
        setTimeout(() => navigate("/"), 2000);
      }
      return;
    }

    const fetchAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const response = await addressService.getMyAddresses();

        if (response.code === 200 && response.data) {
          const mappedAddresses = response.data.map((apiAddr) =>
            mapApiAddressToUserAddress(apiAddr, user)
          );
          const defaultAddress = mappedAddresses.find((a) => a.isDefault);
          setSavedAddresses(mappedAddresses);

          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id.toString());
            setShowAddressForm(false);
          } else if (mappedAddresses.length > 0) {
            setSelectedAddressId(mappedAddresses[0].id.toString());
            setShowAddressForm(false);
          } else {
            setSelectedAddressId("new");
            setShowAddressForm(true);
          }
        } else if (response.code === 200 && !response.data) {
          setSavedAddresses([]);
          setSelectedAddressId("new");
          setShowAddressForm(true);
        }
      } catch (error: any) {
        setSnackbar({
          open: true,
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to load addresses",
          severity: "error",
        });
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user, navigate, location, cartData, checkoutItems.length]);

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newId = event.target.value;
    setSelectedAddressId(newId);
    setShowAddressForm(newId === "new");
  };

  const handleSaveAddress = async (savedAddressDataFromForm: UserAddress) => {
    if (!user) return;
    setIsSubmittingAddress(true);
    setAddressSubmitError(null);

    const apiRequestData: AddAddressRequest = {
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
      const response = await addressService.addAddress(apiRequestData);

      if ((response.code === 200 || response.code === 201) && response.data) {
        const newUserAddress = mapApiAddressToUserAddress(response.data, user);
        const updatedAddresses = [newUserAddress, ...savedAddresses];
        setSavedAddresses(updatedAddresses);
        setSelectedAddressId(newUserAddress.id.toString());
        setShowAddressForm(false);
      } else {
        throw new Error(response.message || "Failed to add address");
      }
    } catch (err: any) {
      setAddressSubmitError(
        err.response?.data?.message || err.message || "An error occurred"
      );
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (selectedAddressId === "new" || !selectedAddressId) {
      setSnackbar({
        open: true,
        message: "Please select or add a shipping address.",
        severity: "error",
      });
      return;
    }
    if (!termsAccepted) {
      setSnackbar({
        open: true,
        message: "You must agree to the terms.",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);
    let createOrderRequest: CreateOrderRequest;

    const selectedAddress = savedAddresses.find(
      (a) => a.id.toString() === selectedAddressId
    );
    if (!selectedAddress) {
      setSnackbar({
        open: true,
        message: "Selected address is invalid.",
        severity: "error",
      });
      setIsSubmitting(false);
      return;
    }
    createOrderRequest = {
      addressId: Number(selectedAddress.id),
    };

    try {
      const orderResponse = await orderService.createOrder(createOrderRequest);
      if (orderResponse.code !== 200 && orderResponse.code !== 201) {
        throw new Error(orderResponse.message || "Failed to create order");
      }
      if (!orderResponse.data || orderResponse.data.length === 0) {
        throw new Error("Order created, but no order data returned.");
      }

      await fetchCart();

      if (paymentMethod === "cod") {
        setSnackbar({
          open: true,
          message: "Order placed successfully! (COD)",
          severity: "success",
        });
        setTimeout(() => navigate("/profile?tab=orders"), 2000);
      } else {
        setSnackbar({
          open: true,
          message: "Order created. Redirecting to VNPAY...",
          severity: "info",
        });

        const firstOrderUuid = orderResponse.data[0].orderId;

        const paymentResponse = await paymentService.createVnpayPayment(
          firstOrderUuid
        );
        if (paymentResponse.code === 200 && paymentResponse.data?.paymentUrl) {
          window.location.href = paymentResponse.data.paymentUrl;
        } else {
          throw new Error(
            paymentResponse.message || "Failed to create VNPAY link"
          );
        }
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "An error occurred.",
        severity: "error",
      });
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
      message: "",
      severity: "info",
    }));
  };

  return (
    <Box sx={{ bgcolor: "background.default", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h1"
          className="font-bold text-center"
          sx={{ mb: 8 }}
        >
          Checkout
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{ p: { xs: 2, md: 4 }, borderRadius: "12px" }}
            >
              <Typography
                variant="h6"
                component="h2"
                className="font-bold"
                sx={{ mb: 4 }}
              >
                Shipping Information
              </Typography>
              {isLoadingAddresses ? (
                <CircularProgress />
              ) : (
                <AddressSelector
                  savedAddresses={savedAddresses}
                  selectedAddressId={selectedAddressId}
                  onChange={handleAddressChange}
                />
              )}
              {showAddressForm && (
                <AddressForm
                  onSave={handleSaveAddress}
                  onCancel={() => {
                    setShowAddressForm(false);
                    if (savedAddresses.length > 0) {
                      setSelectedAddressId(savedAddresses[0].id.toString());
                    }
                  }}
                  isSubmitting={isSubmittingAddress}
                  submitError={addressSubmitError}
                />
              )}
            </Paper>

            <PaymentMethod
              value={paymentMethod}
              onChange={(newValue) => setPaymentMethod(newValue)}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <OrderSummary
              items={checkoutItems}
              shippingFee={shippingFee}
              termsAccepted={termsAccepted}
              onTermsChange={setTermsAccepted}
              onSubmit={handleSubmitOrder}
              isSubmitting={isSubmitting}
              formatCurrency={formatCurrency}
              originalSubtotal={apiOriginalSubtotal}
              preCouponSellingTotal={preCouponSellingTotal}
              sellingSubtotal={apiSellingSubtotal}
              couponDiscount={couponDiscountAmount}
              total={total}
            />
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar?.open}
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
    </Box>
  );
};

export default CheckoutPage;