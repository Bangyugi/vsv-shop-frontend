import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Remove,
  DeleteOutline,
  VisibilityOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";

import type { CartItemFE } from "../../../types/cart";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

interface CartItemCardProps {
  item: CartItemFE;
  onQuantityChange: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
  formatCurrency: (amount: number) => string;
  isUpdating?: boolean;
}

const CartItemCard = ({
  item,
  onQuantityChange,
  onRemove,
  formatCurrency,
  isUpdating = false,
}: CartItemCardProps) => {
  const [inputValue, setInputValue] = useState(item.quantity.toString());

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (
      document.activeElement?.id !== `quantity-input-${item.id}` &&
      parseInt(inputValue, 10) !== item.quantity
    ) {
      setInputValue(item.quantity.toString());
    }
  }, [item.quantity, item.id, inputValue]);

  const debounceQuantityChange = (id: number, quantity: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      onQuantityChange(id, quantity);
    }, 700);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (/^\d+$/.test(value) || value === "") {
      const quantity = parseInt(value, 10);

      const validValue =
        value === "" ? "" : Math.max(1, Math.min(quantity, 99)).toString();
      setInputValue(validValue);

      if (validValue !== "" && !isNaN(parseInt(validValue, 10))) {
        debounceQuantityChange(item.id, parseInt(validValue, 10));
      }
    }
  };

  const handleBlur = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const quantity = parseInt(inputValue, 10);
    const finalQuantity = isNaN(quantity) || quantity < 1 ? 1 : quantity;

    if (finalQuantity !== item.quantity) {
      onQuantityChange(item.id, finalQuantity);
    }

    setInputValue(finalQuantity.toString());
  };

  const increment = () => {
    if (isUpdating || item.quantity >= 99) return;
    const newQuantity = item.quantity + 1;
    setInputValue(newQuantity.toString());
    onQuantityChange(item.id, newQuantity);
  };

  const decrement = () => {
    if (isUpdating || item.quantity <= 1) return;
    const newQuantity = item.quantity - 1;
    setInputValue(newQuantity.toString());
    onQuantityChange(item.id, newQuantity);
  };

  const content = (
    <CardContent className="p-0" sx={{ minWidth: "100px" }}>
      <Typography component="div" variant="h6" className="font-semibold">
        {item.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mt-1">
        Color: {item.color} | Size: {item.size}
      </Typography>
      <Typography
        variant="h6"
        className="font-bold mt-2 sm:mt-4"
        sx={{ color: "primary.main" }}
      >
        {formatCurrency(item.price)}
      </Typography>
      <Button
        component={RouterLink}
        to={`/product/${item.productId}`}
        startIcon={<VisibilityOutlined />}
        size="small"
        variant="text"
        sx={{
          mt: 1.5,
          color: "text.secondary",
          fontWeight: 400,
          "&:hover": {
            color: "primary.main",
            bgcolor: "action.hover",
          },
        }}
      >
        See Product
      </Button>
    </CardContent>
  );

  const actions = (
    <Box className="flex items-center justify-between mt-4">
      <Box className="flex items-center border border-gray-300 rounded-full relative">
        {/* --- Hiển thị loading overlay --- */}
        {isUpdating && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              borderRadius: "50px",
              zIndex: 1,
            }}
          >
            <CircularProgress size={20} />
          </Box>
        )}
        {/* --- Kết thúc loading overlay --- */}
        <IconButton
          onClick={decrement}
          size="small"
          aria-label="decrease quantity"
          disabled={item.quantity <= 1 || isUpdating}
        >
          <Remove fontSize="small" />
        </IconButton>
        <TextField
          id={`quantity-input-${item.id}`}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          type="tel"
          disabled={isUpdating}
          inputProps={{
            min: 1,
            max: 99,
            inputMode: "numeric",
            pattern: "[0-9]*",
            style: {
              textAlign: "center",
              width: "40px",
              padding: "4px 0",
              MozAppearance: "textfield",
            },
          }}
          sx={{
            "& input": {
              border: "none",
              boxShadow: "none",
              outline: "none",
              padding: "0 !important",
              backgroundColor: "transparent",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { border: "none" },
              "&:hover fieldset": { border: "none" },
              "&.Mui-focused fieldset": { border: "none" },
            },
            "input::-webkit-outer-spin-button, input::-webkit-inner-spin-button":
              {
                display: "none",
              },
          }}
        />
        <IconButton
          onClick={increment}
          size="small"
          aria-label="increase quantity"
          disabled={item.quantity >= 99 || isUpdating}
        >
          <Add fontSize="small" />
        </IconButton>
      </Box>
      <IconButton
        onClick={() => onRemove(item.id)}
        color="error"
        aria-label="remove item"
        disabled={isUpdating}
      >
        <DeleteOutline />
      </IconButton>
    </Box>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Mobile view */}
      <Card
        className="flex flex-col sm:hidden p-4 rounded-xl shadow-md"
        elevation={0}
      >
        <Box className="flex flex-row">
          <CardMedia
            component="img"
            image={item.image}
            alt={item.name}
            className="object-cover rounded-lg"
            sx={{
              width: "150px",
              height: "150px",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <Box className="flex flex-col justify-start pl-4 flex-grow">
            {content}
          </Box>
        </Box>
        {actions}
      </Card>

      {/* Desktop view */}
      <Card
        className="hidden sm:flex flex-row p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
        elevation={0}
      >
        <CardMedia
          component="img"
          image={item.image}
          alt={item.name}
          className="object-cover rounded-lg"
          sx={{
            width: "200px",
            height: "200px",
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
        <Box className="flex flex-col flex-grow justify-between sm:pl-6">
          {content}
          {actions}
        </Box>
      </Card>
    </motion.div>
  );
};

export default CartItemCard;
