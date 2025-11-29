import { Box, Container, Grid, Typography } from "@mui/material";
import ContactInfo from "../components/ContactInfo";
import ContactForm from "../components/ContactForm";

const ContactPage = () => {
  return (
    <Box sx={{ bgcolor: "background.default", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h1"
          className="font-bold text-center"
          sx={{ mb: 8 }}
        >
          We'd love to hear from you
        </Typography>

        <Grid container spacing={{ xs: 4, md: 5 }}>
          <Grid item xs={12} md={5}>
            <ContactInfo />
          </Grid>
          <Grid item xs={12} md={7}>
            <ContactForm />
          </Grid>
        </Grid>

        {/* <Box sx={{ mt: 8, borderRadius: "12px", overflow: "hidden" }}>
          <Typography
            variant="h4"
            component="h2"
            className="font-bold text-center"
            sx={{ mb: 4 }}
          >
            Find Us Here
          </Typography>
          <Box
            component="iframe"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.447177890606!2d106.70225331474939!3d10.776991192320984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4ec52431d1%3A0x2d9a6c6e115c0e0e!2sBitexco%20Financial%20Tower!5e0!3m2!1sen!2svn!4v1678888888888!5m2!1sen!2svn"
            width="100%"
            height="450"
            sx={{ border: 0, filter: "grayscale(0.5) opacity(0.8)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></Box>
        </Box> */}
      </Container>
    </Box>
  );
};

export default ContactPage;
