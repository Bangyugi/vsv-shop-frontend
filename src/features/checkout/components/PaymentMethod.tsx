import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Collapse,
  TextField,
  Grid,
  Paper,
} from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

export type PaymentValue = "cod" | "vnpay-card" | "vnpay-wallet";

interface PaymentMethodProps {
  value: PaymentValue;
  onChange: (newValue: PaymentValue) => void;
}

const PaymentMethod = ({ value, onChange }: PaymentMethodProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value as PaymentValue);
  };

  const renderPaymentOption = (
    optionValue: PaymentValue,
    icon: React.ReactNode,
    title: string,
    subtitle: string
  ) => (
    <FormControlLabel
      key={optionValue}
      value={optionValue}
      control={<Radio />}
      label={
        <Box className="flex items-center gap-3">
          {icon}
          <Box>
            <Typography className="font-semibold">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
      }
      sx={{
        mb: 1,
        mx: 0,
        p: 2,
        border: "1px solid",

        borderColor: value === optionValue ? "primary.main" : "divider",

        borderRadius: "8px",
        "&:hover": {
          borderColor: "primary.light",
        },
      }}
    />
  );

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: { xs: 2, md: 4 }, borderRadius: "12px", mt: 4 }}
    >
      <Typography
        variant="h6"
        component="h2"
        className="font-bold"
        sx={{ mb: 4 }}
      >
        Payment Method
      </Typography>

      {/* --- THAY ĐỔI: Dùng prop `value` và `handleChange` --- */}
      <RadioGroup value={value} onChange={handleChange}>
        {/* COD */}
        {renderPaymentOption(
          "cod",
          <LocalShippingOutlinedIcon />,
          "Cash on Delivery (COD)",
          "Pay with cash upon delivery"
        )}

        {/* E-Wallet (Giả định là VNPAY) */}
        {renderPaymentOption(
          "vnpay-wallet",
          <AccountBalanceWalletOutlinedIcon />,
          "E-Wallet (VNPAY)",
          "Pay securely via e-wallet"
        )}

        {/* Credit Card (Giả định là VNPAY) */}
        {renderPaymentOption(
          "vnpay-card",
          <CreditCardOutlinedIcon />,
          "Credit / Debit Card (VNPAY)",
          "Pay with Visa, Mastercard, JCB"
        )}
      </RadioGroup>

      {/* Credit Card Form (Collapse) */}
      <Collapse in={value === "vnpay-card"} timeout="auto" unmountOnExit>
        <Box
          sx={{ mt: 3, p: 3, border: "1px solid #eee", borderRadius: "8px" }}
        >
          <Typography
            variant="subtitle1"
            className="font-semibold "
            sx={{ mb: 3 }}
          >
            Card Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                placeholder="XXXX XXXX XXXX XXXX"
                disabled
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name on Card"
                placeholder="JOHN M. DOE"
                disabled
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiration Date"
                placeholder="MM/YY"
                disabled
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV Code"
                placeholder="XXX"
                disabled
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                You will be redirected to the VNPAY gateway to enter your card
                details securely.
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default PaymentMethod;
