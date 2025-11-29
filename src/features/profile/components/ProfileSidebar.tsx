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
} from "@mui/material";
import {
  AccountCircleOutlined,
  LocationOnOutlined,
  ShoppingBagOutlined,
  FavoriteBorderOutlined,
  LockOutlined,
  LogoutOutlined,
} from "@mui/icons-material";
import { useAuth } from "../../../contexts/AuthContext";
import type { ProfileTab } from "../pages/UserProfilePage";

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
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: 3, borderRadius: "12px", height: "100%" }}
    >
      <Box className="flex flex-col items-center text-center" sx={{ mb: 4 }}>
        <Box sx={{ position: "relative", mb: 2 }}>
          <Avatar
            src={userAvatar}
            alt={userName}
            sx={{ width: 100, height: 100, mb: 1 }}
          />
          {/* Nút Change Avatar - Cần thêm logic xử lý */}
          <Button
            size="small"
            variant="contained"
            component="label"
            sx={{ borderRadius: "20px", fontSize: "0.7rem", py: 0.5, px: 1.5 }}
          >
            Change
            <input
              type="file"
              hidden
              accept="image/*" /* onChange={handleAvatarChange} */
            />
          </Button>
        </Box>
        <Typography variant="h6" className="font-bold">
          {userName} {/* Dùng prop */}
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
        {/* --- 3. Cập nhật nút Logout --- */}
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
  );
};

export default ProfileSidebar;
