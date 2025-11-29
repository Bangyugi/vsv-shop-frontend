import React, {
  useState,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type FC,
} from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import * as authService from "../../../services/authService";

interface OtpInputProps {
  length?: number;
  value: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
}

const OtpInput: FC<OtpInputProps> = ({ length = 6, value, onChange }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value.slice(-1);

    if (!/^\d*$/.test(newValue)) return;

    const newOtp = [...value];
    newOtp[index] = newValue;
    onChange(newOtp);

    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .slice(0, length)
      .replace(/\D/g, "");

    if (pasteData) {
      const newOtp = Array(length).fill("");
      pasteData.split("").forEach((char, i) => {
        newOtp[i] = char;
      });
      onChange(newOtp);
      inputRefs.current[Math.min(pasteData.length - 1, length - 1)]?.focus();
    }
  };

  return (
    <Box className="flex justify-center gap-2 sm:gap-4" onPaste={handlePaste}>
      {Array.from({ length }, (_, index) => (
        <TextField
          key={index}
          inputRef={(el) => (inputRefs.current[index] = el)}
          value={value[index]}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange(e, index)
          }
          onKeyDown={(e: KeyboardEvent<HTMLDivElement>) =>
            handleKeyDown(e, index)
          }
          type="tel"
          inputProps={{
            maxLength: 1,
            style: {
              textAlign: "center",
              fontSize: "1.5rem",
              fontWeight: "bold",
            },
          }}
          sx={{
            width: { xs: 45, sm: 60 },
            height: { xs: 50, sm: 65 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              height: "100%",
            },
          }}
        />
      ))}
    </Box>
  );
};

const VerificationPage = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  } | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  React.useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const isButtonDisabled = otp.some((val) => val === "") || isLoading;
  const fullOtp = otp.join("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isButtonDisabled || !email) return;

    setIsLoading(true);

    try {
      const response = await authService.verifyOtp({ email, otp: fullOtp });
      if (response.code === 200) {
        setSnackbar({
          open: true,
          message: "OTP verified successfully! Redirecting to Login...",
          severity: "success",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Invalid OTP, please try again.";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    setSnackbar({
      open: true,
      message: "A new OTP has been sent to your email.",
      severity: "info",
    });
    setOtp(Array(6).fill(""));
  };

  return (
    <>
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-screen"
        sx={{
          background:
            "linear-gradient(135deg, rgba(230, 247, 250, 0.5) 0%, rgba(255, 240, 245, 0.5) 100%)",
          p: 2,
        }}
      >
        <Paper
          elevation={0}
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          sx={{
            p: { xs: 3, md: 5 },
            width: "100%",
            maxWidth: 500,
            borderRadius: "16px",
            boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e0e0e0",
            textAlign: "center",
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography
              variant="h4"
              component="h1"
              className="font-bold"
              sx={{ mb: 3 }}
            >
              Verify Your Account
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              className="max-w-sm mx-auto"
              sx={{ mb: 8 }}
            >
              We’ve sent a 6-digit OTP code to your email. Please enter it below
              to verify your account.
            </Typography>

            {/* Sử dụng component OtpInput nội bộ */}
            <OtpInput value={otp} onChange={setOtp} />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isButtonDisabled}
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Verify"
              )}
            </Button>
            <Typography
              variant="body2"
              color="text.secondary"
              className="text-center"
            >
              Didn’t receive the code?{" "}
              <Link
                onClick={handleResendOtp}
                variant="body2"
                underline="hover"
                className="cursor-pointer"
              >
                Resend OTP
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar?.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert
            onClose={() => setSnackbar(null)}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};

export default VerificationPage;
