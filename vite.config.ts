import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Import plugin Tailwind v4

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Thêm plugin vào đây
  ],
  resolve: {
    alias: {
      // Trỏ MUI đến styled-components thay vì emotion
      "@mui/styled-engine": "@mui/styled-engine-sc",
    },
  },
});
