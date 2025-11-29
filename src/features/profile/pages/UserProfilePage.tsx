// src/features/profile/pages/UserProfilePage.tsx
import {
  Box,
  Container,
  Grid,
  Paper,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
// import { mockUser } from "../../../data/profileData"; // <-- 1. XÓA import mockUser
import { useSearchParams, Navigate } from "react-router-dom"; // <-- 2. Thêm Navigate
import { useAuth } from "../../../contexts/AuthContext"; // <-- 3. IMPORT useAuth

// Import các components con
import ProfileSidebar from "../components/ProfileSidebar";
import AccountDetails from "../components/AccountDetails";
import AddressBook from "../components/Addressbook";
import OrderHistory from "../components/OrderHistory";
import ProfileWishlist from "../components/ProfileWishlist";
import SecuritySettings from "../components/SecuritySetting";

// Định nghĩa các tab
export type ProfileTab =
  | "account"
  | "addresses"
  | "orders"
  | "wishlist"
  | "security";

// Mảng các tab hợp lệ để kiểm tra
const validTabs: ProfileTab[] = [
  "account",
  "addresses",
  "orders",
  "wishlist",
  "security",
];

const UserProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user, isAuthenticated, isLoading } = useAuth(); // <-- 4. LẤY user, isAuthenticated, isLoading từ context

  // --- Tính toán activeTab từ URL ---
  const getActiveTabFromUrl = (): ProfileTab => {
    const tabFromUrl = searchParams.get("tab") as ProfileTab;
    return validTabs.includes(tabFromUrl) ? tabFromUrl : "account";
  };

  const activeTab = getActiveTabFromUrl();

  // --- Hàm cập nhật URL ---
  const handleTabChange = (tab: ProfileTab) => {
    setSearchParams({ tab: tab });
  };

  // --- 5. Xử lý trạng thái Loading và Chưa xác thực ---
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Nếu không loading và không xác thực (hoặc user là null), chuyển hướng về login
  if (!isAuthenticated || !user) {
    // Bạn có thể lưu lại trang hiện tại để redirect về sau khi login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  // --- Kết thúc xử lý ---

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return <AccountDetails />; // AccountDetails sẽ tự lấy user từ context
      case "addresses":
        return <AddressBook />;
      case "orders":
        return <OrderHistory />;
      case "wishlist":
        return <ProfileWishlist />;
      case "security":
        return <SecuritySettings />;
      default:
        return <AccountDetails />;
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* --- Sidebar (Cột Trái) --- */}
          <Grid item xs={12} md={4}>
            <ProfileSidebar
              // userAvatar={mockUser.avatar} // <-- 6. XÓA dòng này
              // userName={mockUser.fullName} // <-- 6. XÓA dòng này
              userAvatar={user.avatar} // <-- 7. DÙNG user từ context
              userName={`${user.firstName} ${user.lastName}`} // <-- 7. DÙNG user từ context
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </Grid>

          {/* --- Content (Cột Phải) --- */}
          <Grid item xs={12} md={8}>
            {isMobile ? (
              <Box sx={{ overflow: "hidden" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </Box>
            ) : (
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 4,
                  borderRadius: "12px",
                  minHeight: 500, // Giữ lại minHeight nếu muốn
                  overflow: "hidden", // Giữ lại overflow
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserProfilePage;
