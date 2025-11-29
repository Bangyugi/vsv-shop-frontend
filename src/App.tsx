// src/App.tsx
import { Box, Snackbar, Alert } from "@mui/material";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./features/homepage/pages/HomePage";
import { Routes, Route, useLocation } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import CartPage from "./features/cart/pages/CartPage";
import WishlistPage from "./features/wishlist/pages/WishlistPage";
import SearchPage from "./features/search/pages/SearchPage";
import ProductDetailPage from "./features/products/pages/ProductDetailPage";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import CheckoutPage from "./features/checkout/pages/CheckoutPage";
import UserProfilePage from "./features/profile/pages/UserProfilePage";
import ContactPage from "./features/contact/pages/ContactPage";
import OrderDetailPage from "./features/order/pages/OrderDetailPage";
import ShoppingPage from "./features/shopping/pages/ShoppingPage";
import VerificationPage from "./features/auth/pages/VerificationPage";

import { useCart } from "./contexts/CartContext";
import { useWishlist } from "./contexts/WishlistContext";

import AdminRoute from "./components/common/AdminRoute";
import AdminLayout from "./features/admin/layouts/AdminLayout";
import DashboardPage from "./features/admin/pages/DashboardPage";
import UserManagementPage from "./features/admin/pages/UserManagementPage";
import SellerManagementPage from "./features/admin/pages/SellerManagementPage";
import OrderManagementPage from "./features/admin/pages/OrderManagementPage";
import CategoryManagementPage from "./features/admin/pages/CategoryManagementPage";

import ProductManagementPage from "./features/admin/pages/ProductManagementPage";

import BecomeSellerPage from "./features/sellers/pages/BecomeSellerPage";

import SellerRoute from "./components/common/SellerRoute";
import SellerLayout from "./features/sellers/layouts/SellerLayout";
import SellerDashboardPage from "./features/sellers/pages/SellerDashboardPage";

// --- THÊM IMPORT MỚI ---
import SellerProductManagementPage from "./features/sellers/pages/SellerProductManagementPage";
import SellerOrderManagementPage from "./features/sellers/pages/SellerOrderManagementPage";
import SellerAnalyticsPage from "./features/sellers/pages/SellerAnalyticsPage";
import SellerProfilePage from "./features/sellers/pages/SellerProfilePage";
// --- KẾT THÚC THÊM ---

/**
 * Component Layout Quyết định hiển thị Navbar/Footer hay không
 */
const LayoutManager: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const isSpecialRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/seller");
  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/verify" ||
    location.pathname === "/become-seller";

  if (isSpecialRoute || isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </>
  );
};

function App() {
  const { snackbar: cartSnackbar, closeSnackbar: closeCartSnackbar } =
    useCart();
  const { snackbar: wishlistSnackbar, closeSnackbar: closeWishlistSnackbar } =
    useWishlist();

  return (
    <Box className="flex flex-col min-h-screen">
      <LayoutManager>
        <Routes>
          {/* === Admin Routes (Được bảo vệ) === */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="sellers" element={<SellerManagementPage />} />
              <Route path="orders" element={<OrderManagementPage />} />
              <Route path="categories" element={<CategoryManagementPage />} />
              <Route path="products" element={<ProductManagementPage />} />
              <Route path="*" element={<DashboardPage />} />
            </Route>
          </Route>

          {/* === CẬP NHẬT: Seller Routes (Được bảo vệ) === */}
          <Route element={<SellerRoute />}>
            <Route path="/seller" element={<SellerLayout />}>
              <Route index element={<SellerDashboardPage />} />
              <Route path="dashboard" element={<SellerDashboardPage />} />
              {/* Thay thế placeholder bằng trang thật */}
              <Route
                path="products"
                element={<SellerProductManagementPage />}
              />
              <Route path="orders" element={<SellerOrderManagementPage />} />
              <Route path="analytics" element={<SellerAnalyticsPage />} />
              <Route path="profile" element={<SellerProfilePage />} />
              <Route path="*" element={<SellerDashboardPage />} />
            </Route>
          </Route>
          {/* --- KẾT THÚC CẬP NHẬT --- */}

          {/* === Public & User Routes === */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/profile/orders/:orderId"
            element={<OrderDetailPage />}
          />
          <Route path="/shop" element={<ShoppingPage />} />
          <Route path="/shop/:category" element={<ShoppingPage />} />
          <Route path="/become-seller" element={<BecomeSellerPage />} />
        </Routes>
      </LayoutManager>

      {/* Global Snackbars (Giữ nguyên) */}
      <Snackbar
        open={cartSnackbar?.open}
        autoHideDuration={4000}
        onClose={closeCartSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {cartSnackbar ? (
          <Alert
            onClose={closeCartSnackbar}
            severity={cartSnackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {cartSnackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>

      <Snackbar
        open={wishlistSnackbar?.open}
        autoHideDuration={4000}
        onClose={closeWishlistSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {wishlistSnackbar ? (
          <Alert
            onClose={closeWishlistSnackbar}
            severity={wishlistSnackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {wishlistSnackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default App;