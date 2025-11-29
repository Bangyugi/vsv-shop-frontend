import {
  Box,
  Container,
  Grid,
  Link,
  Typography,
  IconButton,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#f1f1f1",
        py: 6,
        mt: "auto",
        borderTop: "1px solid #ddd",
      }}
    >
      <Container>
        <Grid container spacing={4}>
          {/* Cột 1: Thông tin shop */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom className="tw-font-bold">
              VSV Shop
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Style That Defines You. High-quality fashion for the modern
              individual.
            </Typography>
          </Grid>

          {/* Cột 2: Menu Shop */}
          <Grid item xs={6} md={2}>
            <Typography
              variant="subtitle1"
              gutterBottom
              className="tw-font-bold"
            >
              Shop
            </Typography>
            <Link
              href="#"
              color="inherit"
              display="block"
              underline="hover"
              sx={{ mb: 1 }}
            >
              Men
            </Link>
            <Link
              href="#"
              color="inherit"
              display="block"
              underline="hover"
              sx={{ mb: 1 }}
            >
              Women
            </Link>
            <Link href="#" color="inherit" display="block" underline="hover">
              Accessories
            </Link>
          </Grid>

          {/* Cột 3: Dịch vụ khách hàng */}
          <Grid item xs={6} md={3}>
            <Typography
              variant="subtitle1"
              gutterBottom
              className="tw-font-bold"
            >
              Customer Service
            </Typography>
            <Link
              href="#"
              color="inherit"
              display="block"
              underline="hover"
              sx={{ mb: 1 }}
            >
              Contact Us
            </Link>
            <Link
              href="#"
              color="inherit"
              display="block"
              underline="hover"
              sx={{ mb: 1 }}
            >
              Shipping & Returns
            </Link>
            <Link href="#" color="inherit" display="block" underline="hover">
              Privacy Policy
            </Link>
          </Grid>

          {/* Cột 4: Mạng xã hội */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="subtitle1"
              gutterBottom
              className="tw-font-bold"
            >
              Follow Us
            </Typography>
            <Box>
              <IconButton href="#" color="inherit">
                <FacebookIcon />
              </IconButton>
              <IconButton href="#" color="inherit">
                <InstagramIcon />
              </IconButton>
              <IconButton href="#" color="inherit">
                <TwitterIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Dòng bản quyền */}
        <Box mt={5} textAlign="center" pt={3} borderTop="1px solid #ddd">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} VSV Shop. All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
