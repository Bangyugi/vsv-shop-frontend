import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { motion, AnimatePresence } from "framer-motion";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

const validationSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: yup.string(),
  subject: yup.string().required("Subject is required"),
  message: yup
    .string()
    .min(10, "Message must be at least 10 characters")
    .required("Message is required"),
});

const subjects = [
  "Order Support",
  "Product Inquiry",
  "Feedback & Complaints",
  "Business Partnership",
  "Other",
];

const ContactForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting, resetForm }) => {
      setTimeout(() => {
        console.log("Form data submitted:", values);
        setSubmitting(false);
        setIsSubmitted(true);
        resetForm();
      }, 1500);
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.4 }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: { xs: 3, md: 5 }, borderRadius: "12px", minHeight: "100%" }}
      >
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <Box className="flex flex-col items-center justify-center text-center h-[500px] gap-3">
                <CheckCircleOutlineIcon
                  sx={{ fontSize: "5rem", color: "primary.main" }}
                />
                <Typography variant="h5" component="h3" className="font-bold">
                  Message Sent!
                </Typography>
                <Typography color="text.secondary">
                  Thank you for contacting us. We will get back to you soon.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setIsSubmitted(false)}
                  sx={{ mt: 3, borderRadius: "50px" }}
                >
                  Send Another Message
                </Button>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                variant="h4"
                component="h2"
                className="font-bold "
                sx={{ mb: 4 }}
              >
                Send us a message
              </Typography>
              <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="fullName"
                      name="fullName"
                      label="Full Name"
                      value={formik.values.fullName}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.fullName &&
                        Boolean(formik.errors.fullName)
                      }
                      helperText={
                        formik.touched.fullName && formik.errors.fullName
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.email && Boolean(formik.errors.email)
                      }
                      helperText={formik.touched.email && formik.errors.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Phone (Optional)"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={
                        formik.touched.subject && Boolean(formik.errors.subject)
                      }
                    >
                      <InputLabel>Subject</InputLabel>
                      <Select
                        id="subject"
                        name="subject"
                        label="Subject"
                        value={formik.values.subject}
                        onChange={formik.handleChange}
                      >
                        {subjects.map((sub) => (
                          <MenuItem key={sub} value={sub}>
                            {sub}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="message"
                      name="message"
                      label="Message"
                      multiline
                      rows={6}
                      value={formik.values.message}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.message && Boolean(formik.errors.message)
                      }
                      helperText={
                        formik.touched.message && formik.errors.message
                      }
                    />
                  </Grid>
                  <Grid item xs={12} className="text-right">
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={formik.isSubmitting}
                      startIcon={
                        formik.isSubmitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SendOutlinedIcon />
                        )
                      }
                      sx={{
                        bgcolor: "primary.main",
                        borderRadius: "50px",
                        px: 4,
                        py: 1.5,
                        "&:hover": {
                          bgcolor: "primary.dark",
                          transform: "scale(1.02)",
                        },
                        transition: "all 0.3s ease-in-out",
                      }}
                    >
                      {formik.isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </motion.div>
  );
};

export default ContactForm;
