import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import {
  PlaceOutlined,
  PhoneOutlined,
  EmailOutlined,
  AccessTimeOutlined,
  Facebook,
  Instagram,
  Twitter,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24"
    height="24"
  >
    <path d="M12 2.00098C6.47715 2.00098 2 6.47813 2 12.001C2 17.5238 6.47715 22.001 12 22.001C17.5228 22.001 22 17.5238 22 12.001C22 6.47813 17.5228 2.00098 12 2.00098ZM16.1044 10.3343C16.1044 10.3456 16.1044 10.3569 16.1043 10.3681C16.0374 12.285 14.542 13.7842 12.6303 13.8475C12.6033 13.8485 12.5762 13.849 12.5492 13.849C10.741 13.849 9.243 12.449 9.121 10.662C9.111 10.5103 9.106 10.358 9.106 10.205C9.106 10.194 9.106 10.183 9.106 10.172C9.106 8.36301 10.51 6.96201 12.316 6.84001C12.469 6.83101 12.622 6.82601 12.776 6.82601C14.734 6.82601 16.29 8.38401 16.29 10.3453C16.223 10.3433 16.16 10.3393 16.1044 10.3343ZM12.7752 15.6491C12.0462 15.6491 11.3172 15.5411 10.6432 15.3401C10.5702 15.3181 10.4902 15.3671 10.4672 15.4381C10.4102 15.6181 10.3222 15.7891 10.2102 15.9461C10.1702 16.0021 10.1982 16.0791 10.2602 16.1051C11.3212 16.5181 12.0422 16.7111 12.7752 16.7111C14.0532 16.7111 15.2012 16.3261 16.1302 15.7081C16.1822 15.6731 16.2052 15.6021 16.1722 15.5481C16.0882 15.4181 16.0232 15.2791 15.9762 15.1321C15.9572 15.0741 15.8852 15.0501 15.8232 15.0801C15.1762 15.4381 14.4172 15.6491 12.7752 15.6491Z" />
  </svg>
);

const infoItems = [
  {
    icon: <PlaceOutlined />,
    primary: "Store Address",
    secondary: "Số 298 Đ. Cầu Diễn, Minh Khai, Bắc Từ Liêm, Hà Nội, Việt Nam",
  },
  {
    icon: <PhoneOutlined />,
    primary: "Hotline",
    secondary: "0334236824",
  },
  {
    icon: <EmailOutlined />,
    primary: "Support Email",
    secondary: "support@vsvshop.com",
  },
  {
    icon: <AccessTimeOutlined />,
    primary: "Opening Hours",
    secondary: "Mon - Sun: 07:00 AM - 10:00 PM",
  },
];

const ContactInfo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: { xs: 3, md: 5 }, borderRadius: "12px", height: "100%" }}
      >
        <Typography
          variant="h4"
          component="h2"
          className="font-bold"
          sx={{ mb: 4 }}
        >
          Get in touch
        </Typography>

        <List>
          {infoItems.map((item) => (
            <ListItem key={item.primary} sx={{ px: 0, mb: 2 }}>
              <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography className="font-semibold">
                    {item.primary}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {item.secondary}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />

        <Typography
          variant="subtitle1"
          className="font-semibold "
          sx={{ mb: 2 }}
        >
          Follow Us
        </Typography>
        <Box className="flex gap-2">
          <IconButton
            href="#"
            target="_blank"
            sx={{
              color: "text.primary",
              "&:hover": { bgcolor: "action.hover", color: "#1877F2" },
            }}
          >
            <Facebook />
          </IconButton>
          <IconButton
            href="#"
            target="_blank"
            sx={{
              color: "text.primary",
              "&:hover": { bgcolor: "action.hover", color: "#E1306C" },
            }}
          >
            <Instagram />
          </IconButton>
          <IconButton
            href="#"
            target="_blank"
            sx={{
              color: "text.primary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <TikTokIcon />
          </IconButton>
          <IconButton
            href="#"
            target="_blank"
            sx={{
              color: "text.primary",
              "&:hover": { bgcolor: "action.hover", color: "#1DA1F2" },
            }}
          >
            <Twitter />
          </IconButton>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default ContactInfo;
