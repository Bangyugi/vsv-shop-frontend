import { Box, Button, Typography } from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Link as RouterLink } from "react-router-dom";

const EmptyCart = () => {
  return (
    <Box
      className="flex flex-col items-center justify-center text-center p-8 rounded-xl bg-white shadow-md gap-3"
      sx={{ minHeight: "50vh" }}
    >
      <ShoppingCartOutlinedIcon
        sx={{ fontSize: "6rem", color: "text.secondary", mb: 2 }}
      />
      <Typography variant="h5" component="h2" className="font-semibold mb-2">
        Your cart is empty
      </Typography>
      <Typography color="text.secondary" className="mb-4">
        Looks like you haven’t added anything to your cart yet.
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="contained"
        size="large"
        sx={{
          bgcolor: "primary.main",
          "&:hover": { bgcolor: "primary.dark" },
          borderRadius: "50px",
          px: 4,
        }}
      >
        Continue Shopping
      </Button>
    </Box>
  );
};

export default EmptyCart;
