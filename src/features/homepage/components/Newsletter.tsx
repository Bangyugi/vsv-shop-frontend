import { Box, Button, Container, TextField, Typography } from "@mui/material";

const Newsletter = () => (
  <Box sx={{ bgcolor: "background.default", py: 8 }}>
    <Container maxWidth="sm" className="text-center">
      <Typography variant="h5" component="h2" className="font-bold">
        Sign up for the latest deals & trends
      </Typography>
      <Box component="form" className="flex gap-2" sx={{ mt: 4 }}>
        <TextField
          fullWidth
          label="Your Email"
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ whiteSpace: "nowrap" }}
        >
          Subscribe
        </Button>
      </Box>
    </Container>
  </Box>
);

export default Newsletter;
