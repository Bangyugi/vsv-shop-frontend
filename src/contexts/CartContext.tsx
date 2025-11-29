import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import * as cartService from "../services/cartService";
import type { ApiCartData, ApiCartResponse } from "../types/cart";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info";
}

interface CartContextType {
  cartData: ApiCartData | null;
  isInitialLoading: boolean;
  isLoading: boolean;
  snackbar: SnackbarState | null;
  fetchCart: (showInitialLoading?: boolean) => Promise<void>;
  addToCart: (
    variantId: number,
    quantity: number
  ) => Promise<ApiCartResponse | null>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<void>;
  closeSnackbar: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartData, setCartData] = useState<ApiCartData | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const closeSnackbar = () => {
    setSnackbar(null);
  };

  const fetchCart = useCallback(async (showInitialLoading = false) => {
    if (showInitialLoading) {
      setIsInitialLoading(true);
    }
    try {
      const response = await cartService.getMyCart();
      if (response.code === 200 || response.code === 404) {
        setCartData(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch cart");
      }
    } catch (error: any) {
      console.error("Fetch cart error:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "Could not load cart.",
        severity: "error",
      });
    } finally {
      if (showInitialLoading) {
        setIsInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("AuthContext: User is authenticated, fetching cart...");
      fetchCart(true);
    } else {
      console.log("AuthContext: User logged out, clearing cart data.");
      setCartData(null);
      setIsInitialLoading(false);
    }
  }, [isAuthenticated, fetchCart]);

  /**
   * Hàm thêm sản phẩm vào giỏ hàng (dùng ở ProductCard, ProductInfo)
   */
  const addToCart = useCallback(
    async (
      variantId: number,
      quantity: number
    ): Promise<ApiCartResponse | null> => {
      if (!isAuthenticated) {
        setSnackbar({
          open: true,
          message: "Please log in to add items to your cart.",
          severity: "error",
        });
        navigate("/login", { state: { from: location } });
        return null;
      }
      if (!variantId || quantity <= 0) {
        console.error("Invalid variantId or quantity", { variantId, quantity });
        setSnackbar({
          open: true,
          message: "Invalid product information.",
          severity: "error",
        });
        return null;
      }

      setIsLoading(true);
      try {
        const response = await cartService.addToCart({ variantId, quantity });
        if (response.code === 200 || response.code === 201) {
          setCartData(response.data);
          setSnackbar({
            open: true,
            message: "Product added to cart successfully!",
            severity: "success",
          });
          return response;
        } else {
          throw new Error(response.message || "Failed to add to cart");
        }
      } catch (error: any) {
        console.error("Error adding to cart:", error);
        setSnackbar({
          open: true,
          message:
            error.response?.data?.message ||
            error.message ||
            "An error occurred.",
          severity: "error",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, navigate]
  );

  const updateQuantity = useCallback(
    async (cartItemId: number, quantity: number) => {
      try {
        const response = await cartService.updateCartItemQuantityById(
          cartItemId,
          quantity
        );
        if (response.code === 200) {
          await fetchCart();
          setSnackbar({
            open: true,
            message: "Quantity updated!",
            severity: "success",
          });
        } else {
          throw new Error(response.message || "Failed to update quantity");
        }
      } catch (error: any) {
        console.error("Update quantity error:", error);
        setSnackbar({
          open: true,
          message:
            error.response?.data?.message ||
            error.message ||
            "Could not update quantity.",
          severity: "error",
        });
        throw error;
      }
    },
    [fetchCart]
  );

  // --- HÀM ĐƯỢC TỐI ƯU ---
  const removeItem = useCallback(
    async (cartItemId: number) => {
      try {
        const response = await cartService.removeFromCart(cartItemId);
        if (response.code === 200 || response.code === 204) {
          // --- THAY ĐỔI: Sử dụng response.data thay vì fetchCart() ---
          // Nếu API trả về 204 (No Content) nhưng vẫn xóa thành công,
          // thì response.data có thể là null.
          // Trong trường hợp đó, chúng ta vẫn cần fetchCart.
          // Tuy nhiên, service/cartService.ts định nghĩa response là ApiCartResponse.
          // Giả định API luôn trả về giỏ hàng mới.
          if (response.data) {
            setCartData(response.data);
          } else {
            // Fallback nếu API trả về 204/No Content
            await fetchCart();
          }
          // --- KẾT THÚC THAY ĐỔI ---

          setSnackbar({
            open: true,
            message: "Item removed from cart!",
            severity: "success",
          });
        } else {
          throw new Error(response.message || "Failed to remove item");
        }
      } catch (error: any) {
        console.error("Remove item error:", error);
        setSnackbar({
          open: true,
          message:
            error.response?.data?.message ||
            error.message ||
            "Could not remove item.",
          severity: "error",
        });
        throw error;
      }
    },
    [fetchCart] // Vẫn giữ fetchCart trong dependencies phòng trường hợp fallback
  );
  // --- KẾT THÚC TỐI ƯU ---

  const applyCoupon = useCallback(async (couponCode: string) => {
    try {
      const response = await cartService.applyCoupon(couponCode);
      if (response.code === 200) {
        setCartData(response.data);
        setSnackbar({
          open: true,
          message: "Coupon applied successfully!",
          severity: "success",
        });
      } else {
        throw new Error(response.message || "Invalid coupon code");
      }
    } catch (error: any) {
      console.error("Apply coupon error:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message ||
          error.message ||
          "Could not apply coupon.",
        severity: "error",
      });
      throw error;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      cartData,
      isInitialLoading,
      isLoading,
      snackbar,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      applyCoupon,
      closeSnackbar,
    }),
    [
      cartData,
      isInitialLoading,
      isLoading,
      snackbar,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      applyCoupon,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
