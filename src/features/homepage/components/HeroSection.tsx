import { Box, Button, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import HeroImage from "../../../assets/images/hero-image.jpg";

const HeroSection = () => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      <Box
        component="img"
        src={HeroImage}
        alt="Fashion model"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -2,
        }}
      />
      {/* Lớp overlay gradient */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1))",
          zIndex: -1,
        }}
      />
      <Container maxWidth="md" className=" ">
        <motion.div
          className="flex items-center justify-center flex-col gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h2"
            component="h1"
            className="font-bold tracking-tight"
            sx={{
              fontSize: { xs: "2.5rem", md: "4rem" },
              textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            Style That Defines You
          </Typography>
          <Typography
            variant="h6"
            component="p"
            className=" text-gray-200 text-center"
            sx={{ mt: 3 }}
          >
            Discover our latest collection for you
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{
              mt: 3,
              padding: "12px 32px",
              borderRadius: "50px",
              fontWeight: "bold",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: "primary.dark",
              },
              transition: "transform 0.2s ease-in-out",
            }}
          >
            Shop Now
          </Button>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HeroSection;
