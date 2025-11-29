import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import * as wishlistService from "../services/wishlistService";
import type {
  WishlistApiResponseData,
  WishlistContextType,
  SnackbarState,
} from "../types/wishlist";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlistData, setWishlistData] =
    useState<WishlistApiResponseData | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  // --- THÊM STATE ERROR ---
  const [error, setError] = useState<string | null>(null);
  // --- KẾT THÚC THÊM ---
  const { isAuthenticated } = useAuth();

  const closeSnackbar = () => {
    setSnackbar(null);
  };

  const fetchWishlist = useCallback(async (showInitialLoading = false) => {
    if (showInitialLoading) {
      setIsInitialLoading(true);
    }
    // --- CẬP NHẬT: Reset error ---
    setError(null);
    // --- KẾT THÚC CẬP NHẬT ---
    try {
      const response = await wishlistService.getMyWishlist();
      if (response.code === 200 || response.code === 404) {
        setWishlistData(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch wishlist");
      }
    } catch (error: any) {
      console.error("Fetch wishlist error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Could not load wishlist.";
      // --- CẬP NHẬT: Set error và snackbar ---
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      // --- KẾT THÚC CẬP NHẬT ---
    } finally {
      if (showInitialLoading) {
        setIsInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("AuthContext: User is authenticated, fetching wishlist...");
      fetchWishlist(true);
    } else {
      console.log("AuthContext: User logged out, clearing wishlist data.");
      setWishlistData(null);
      setIsInitialLoading(false);
    }
  }, [isAuthenticated, fetchWishlist]);

  const addToWishlist = useCallback(
    async (productId: number) => {
      if (!isAuthenticated) {
        setSnackbar({
          open: true,
          message: "Please log in to add items to your wishlist.",
          severity: "error",
        });

        return;
      }

      setIsUpdating(true);
      // --- CẬP NHẬT: Reset error ---
      setError(null);
      // --- KẾT THÚC CẬP NHẬT ---
      try {
        const response = await wishlistService.addToWishlist(productId);
        if (response.code === 200 || response.code === 201) {
          setWishlistData(response.data);
          setSnackbar({
            open: true,
            message: "Added to wishlist!",
            severity: "success",
          });
        } else {
          throw new Error(response.message || "Failed to add to wishlist");
        }
      } catch (error: any) {
        console.error("Error adding to wishlist:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "An error occurred.";
        // --- CẬP NHẬT: Set error và snackbar ---
        setError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error",
        });
        // --- KẾT THÚC CẬP NHẬT ---
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated]
  );

  const removeFromWishlist = useCallback(async (productId: number) => {
    setIsUpdating(true);
    // --- CẬP NHẬT: Reset error ---
    setError(null);
    // --- KẾT THÚC CẬP NHẬT ---
    try {
      const response = await wishlistService.removeFromWishlist(productId);
      if (response.code === 200 || response.code === 204) {
        if (response.data) {
          setWishlistData(response.data);
        } else {
          setWishlistData((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              products: prev.products.filter((p) => p.id !== productId),
            };
          });
        }

        setSnackbar({
          open: true,
          message: "Removed from wishlist",
          severity: "success",
        });
      } else {
        throw new Error(response.message || "Failed to remove from wishlist");
      }
    } catch (error: any) {
      console.error("Error removing from wishlist:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Could not remove item.";
      // --- CẬP NHẬT: Set error và snackbar ---
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
      // --- KẾT THÚC CẬP NHẬT ---
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const wishlistProductIds = useMemo(() => {
    return new Set(wishlistData?.products.map((p) => p.id) || []);
  }, [wishlistData]);

  const isProductInWishlist = useCallback(
    (productId: number) => {
      return wishlistProductIds.has(productId);
    },
    [wishlistProductIds]
  );

  const contextValue = useMemo(
    () => ({
      wishlistData,
      isInitialLoading,
      isUpdating,
      snackbar,
      // --- THÊM TRƯỜNG ERROR ---
      error,
      // --- KẾT THÚC THÊM ---
      fetchWishlist,
      addToWishlist,
      removeFromWishlist,
      closeSnackbar,
      isProductInWishlist,
      wishlistProductIds,
    }),
    [
      wishlistData,
      isInitialLoading,
      isUpdating,
      snackbar,
      // --- THÊM ERROR VÀO DEPENDENCIES ---
      error,
      // --- KẾT THÚC THÊM ---
      fetchWishlist,
      addToWishlist,
      removeFromWishlist,
      isProductInWishlist,
      wishlistProductIds,
    ]
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
