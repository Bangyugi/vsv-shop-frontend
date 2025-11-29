import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import HeartBrokenOutlinedIcon from "@mui/icons-material/HeartBrokenOutlined";
import { motion } from "framer-motion";

const EmptyWishlist = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        className="flex flex-col items-center justify-center text-center p-8 rounded-xl gap-3"
        sx={{
          bgcolor: "background.paper",
          minHeight: "50vh",
          border: "1px dashed #ddd",
        }}
      >
        <HeartBrokenOutlinedIcon
          sx={{ fontSize: "6rem", color: "text.secondary", mb: 2 }}
        />
        <Typography variant="h5" component="h2" className="font-semibold mb-2">
          Your wishlist is empty
        </Typography>
        <Typography color="text.secondary" className="mb-4 max-w-xs">
          Start exploring and add items you love!
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
          Go Shopping
        </Button>
      </Box>
    </motion.div>
  );
};

export default EmptyWishlist;
