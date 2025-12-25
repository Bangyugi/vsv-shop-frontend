import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  AccountCircleOutlined,
  LocationOnOutlined,
  ShoppingBagOutlined,
  FavoriteBorderOutlined,
  LockOutlined,
  LogoutOutlined,
  CameraAlt,
} from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import type { ProfileTab } from "../pages/UserProfilePage";
import * as uploadService from "../../../services/uploadService";
import * as authService from "../../../services/authService";
import type { UpdateProfileRequest } from "../../../types/auth";

// Người dùng có thể quản lý sidebar profile của họ
interface ProfileSidebarProps {
  userAvatar: string;
  userName: string;
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const navItems = [
  { tab: "account", icon: <AccountCircleOutlined />, text: "My Account" },
  { tab: "addresses", icon: <LocationOnOutlined />, text: "Address Book" },
  { tab: "orders", icon: <ShoppingBagOutlined />, text: "My Orders" },
  { tab: "wishlist", icon: <FavoriteBorderOutlined />, text: "Wishlist" },
  { tab: "security", icon: <LockOutlined />, text: "Change Password" },
];

const ProfileSidebar = ({
  userAvatar,
  userName,
  activeTab,
  onTabChange,
}: ProfileSidebarProps) => {
  const { user, logout, setRefreshedUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  } | null>(null);

  const handleLogout = () => {
    logout();
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Reset value so same file can be selected again if needed (though mostly for retries)
    event.target.value = "";

    setIsUploading(true);
    setSnackbar(null);

    try {
      // 1. Upload the image
      const newAvatarUrl = await uploadService.uploadFile(file);

      // 2. Prepare the full update payload
      // API usually requires all fields for a PUT request
      const updateData: UpdateProfileRequest = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        // Ensure date is formatted YYYY-MM-DD if it exists
        birthDate: user.birthDate ? user.birthDate.split("T")[0] : "",
        gender: user.gender,
        avatar: newAvatarUrl, // The new URL
      };

      // 3. Update the user profile
      const response = await authService.updateUserProfile(updateData);

      if (response.code === 200 && response.data) {
        // 4. Update Context immediately
        setRefreshedUser(response.data);

        setSnackbar({
          open: true,
          message: "Avatar updated successfully!",
          severity: "success",
        });
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Avatar update error:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to update avatar. Please try again.",
        severity: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(null);
  };

  return (
    <>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{ p: 3, borderRadius: "12px", height: "100%" }}
      >
        <Box className="flex flex-col items-center text-center" sx={{ mb: 4 }}>
          <Box
            sx={{
              position: "relative",
              mb: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Wrapper for Avatar and Loading Overlay to ensure perfect circle clipping */}
            <Box
              sx={{
                position: "relative",
                width: 100,
                height: 100,
                borderRadius: "50%",
                overflow: "hidden", // This clips the overlay to a perfect circle
                mb: 1,
                border: "4px solid white",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <Avatar
                src={userAvatar}
                alt={userName}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
              {/* Loading Overlay */}
              {isUploading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(255,255,255,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              )}
            </Box>

            <Button
              size="small"
              variant="contained"
              component="label"
              disabled={isUploading}
              startIcon={<CameraAlt sx={{ fontSize: "1rem !important" }} />}
              sx={{
                borderRadius: "20px",
                fontSize: "0.7rem",
                py: 0.5,
                px: 1.5,
                mt: 0.5,
                minWidth: "auto",
                textTransform: "none",
              }}
            >
              {isUploading ? "Uploading..." : "Change"}
              <input
                type="file"
                hidden
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleAvatarChange}
              />
            </Button>
          </Box>
          <Typography variant="h6" className="font-bold">
            {userName}
          </Typography>
        </Box>

        <List>
          {navItems.map((item) => (
            <ListItem key={item.tab} disablePadding>
              <ListItemButton
                selected={activeTab === item.tab}
                onClick={() => onTabChange(item.tab as ProfileTab)}
                sx={{
                  borderRadius: "8px",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "& .MuiListItemIcon-root": {
                      color: "white",
                    },
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  },
                  mb: 0.5,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}

          <ListItem disablePadding sx={{ mt: 2 }}>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: "8px" }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutOutlined color="error" />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ color: "error.main" }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
};

export default ProfileSidebar;
