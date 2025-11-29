import { createTheme } from "@mui/material/styles";
import { colors, typography } from "./tokens"; // Import từ file tokens

const theme = createTheme({
  palette: {
    primary: {
      // Sử dụng giá trị màu trực tiếp
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    error: {
      main: colors.error,
    },
    background: {
      default: colors.background,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
  },
  typography: {
    fontFamily: typography.fontFamily,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
        },
      },
    },
  },
});

export default theme;
