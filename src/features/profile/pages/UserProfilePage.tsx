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
import { useSearchParams, Navigate, useLocation } from "react-router-dom"; // <-- Thêm useLocation
import { useAuth } from "../../../contexts/AuthContext";

import ProfileSidebar from "../components/ProfileSidebar";
import AccountDetails from "../components/AccountDetails";
import AddressBook from "../components/Addressbook";
import OrderHistory from "../components/OrderHistory";
import ProfileWishlist from "../components/ProfileWishlist";
import SecuritySettings from "../components/SecuritySetting";

export type ProfileTab =
  | "account"
  | "addresses"
  | "orders"
  | "wishlist"
  | "security";

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation(); // <-- Khai báo location

  const getActiveTabFromUrl = (): ProfileTab => {
    const tabFromUrl = searchParams.get("tab") as ProfileTab;
    return validTabs.includes(tabFromUrl) ? tabFromUrl : "account";
  };

  const activeTab = getActiveTabFromUrl();

  const handleTabChange = (tab: ProfileTab) => {
    setSearchParams({ tab: tab });
  };

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

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return <AccountDetails />;
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
          <Grid item xs={12} md={4}>
            <ProfileSidebar
              userAvatar={user.avatar}
              userName={`${user.firstName} ${user.lastName}`}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </Grid>

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
                  minHeight: 500,
                  overflow: "hidden",
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
