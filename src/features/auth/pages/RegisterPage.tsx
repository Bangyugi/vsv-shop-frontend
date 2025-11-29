import { Box } from "@mui/material";
import RegisterForm from "../components/RegisterForm";

const RegisterPage = () => {
  return (
    <Box
      className="flex items-center justify-center min-h-screen"
      sx={{
        background:
          "linear-gradient(135deg, rgba(230, 247, 250, 0.5) 0%, rgba(255, 240, 245, 0.5) 100%)",
        p: 2,
      }}
    >
      <RegisterForm />
    </Box>
  );
};

export default RegisterPage;
