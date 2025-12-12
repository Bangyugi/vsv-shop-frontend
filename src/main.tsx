// src/main.tsx
import "./polyfills"; // Fix lỗi "global is not defined" (luôn để dòng này đầu tiên)

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";

import { AuthProvider } from "./contexts/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext.tsx";
import { WishlistProvider } from "./contexts/WishlistContext.tsx";

import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            {/* Bọc App bằng ThemeProvider để áp dụng màu sắc/giao diện cũ */}
            <ThemeProvider theme={theme}>
              <CssBaseline /> {/* Reset CSS chuẩn của MUI */}
              <App />
            </ThemeProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
