import React, { useRef, useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Fade,
  Popper,
  Divider,
  ListItemIcon,
  CircularProgress,
  Alert,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";
import MegaMenu from "./MenagMenu";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";

import * as categoryService from "../../services/categoryService";
import type { ApiCategory, MegaMenuData } from "../../types/category";
import { buildMegaMenuData } from "../../utils/categoryUtils";

const contactItem = "Contact";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { cartData } = useCart();
  const { wishlistData } = useWishlist();

  const isAdmin =
    user?.roles.some((role) => role.name === "ROLE_ADMIN") || false;
  const isSeller =
    user?.roles.some((role) => role.name === "ROLE_SELLER") || false;

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [level1Categories, setLevel1Categories] = useState<ApiCategory[]>([]);
  const [megaMenuStructure, setMegaMenuStructure] = useState<MegaMenuData>({});
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [megaMenuAnchorEl, setMegaMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const timeoutRef = useRef<number | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoryError(null);
      try {
        const response = await categoryService.getCategories();
        if (response.code === 200 && response.data) {
          setCategories(response.data);
        } else {
          throw new Error(response.message || "Failed to fetch categories");
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setCategoryError(
          err.message || "Could not load categories. Please try again later."
        );
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const level1 = categories.filter((cat) => cat.level === 1);
      setLevel1Categories(level1);

      setMegaMenuStructure(buildMegaMenuData(categories));
    }
  }, [categories]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    logout();
    handleClose();
  };
  const handleDrawerToggle = () => setMobileOpen((prevState) => !prevState);

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLElement>,
    item: string
  ) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (megaMenuStructure[item] && megaMenuStructure[item].length > 0) {
      setMegaMenuAnchorEl(event.currentTarget);
      setHoveredMenu(item);
    } else {
      setMegaMenuAnchorEl(null);
      setHoveredMenu(null);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setMegaMenuAnchorEl(null);
      setHoveredMenu(null);
    }, 150);
  };

  const isMegaMenuOpen = Boolean(megaMenuAnchorEl);

  const cartItemCount = cartData?.totalItem || 0;
  const wishlistCount = wishlistData?.products?.length || 0;

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography
        variant="h6"
        sx={{
          my: 2,
          fontFamily: "'Pacifico', cursive",
          color: "primary.main",
          whiteSpace: "nowrap",
        }}
      >
        VSV Shop
      </Typography>
      <List sx={{ whiteSpace: "nowrap" }}>
        {level1Categories.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={`/shop/${item.name.toLowerCase()}`}
              sx={{ textAlign: "center" }}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}

        <ListItem key={contactItem} disablePadding>
          <ListItemButton
            component={RouterLink}
            to="/contact"
            sx={{ textAlign: "center" }}
          >
            <ListItemText primary={contactItem} />
          </ListItemButton>
        </ListItem>

        {isAuthenticated && user && (
          <>
            {isAdmin ? (
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/admin"
                  sx={{ textAlign: "center" }}
                >
                  <ListItemText primary="Admin Page" />
                </ListItemButton>
              </ListItem>
            ) : !isSeller ? (
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/become-seller"
                  sx={{ textAlign: "center" }}
                >
                  <ListItemText primary="Become Seller" />
                </ListItemButton>
              </ListItem>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to="/seller/dashboard"
                  sx={{ textAlign: "center" }}
                >
                  <ListItemText primary="Seller Dashboard" />
                </ListItemButton>
              </ListItem>
            )}
          </>
        )}

        {!isAuthenticated ? (
          <ListItem disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/login"
              sx={{ textAlign: "center" }}
            >
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/profile?tab=account"
                sx={{ textAlign: "center" }}
              >
                <ListItemText primary="My Account" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{ textAlign: "center", color: "error.main" }}
              >
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  const menuButtonSx = {
    color: "text.primary",
    px: 3,
    height: "100%",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      width: "100%",
      transform: "scaleX(0)",
      height: "2px",
      bottom: 0,
      left: 0,
      backgroundColor: "primary.main",
      transformOrigin: "bottom right",
      transition: "transform 0.25s ease-out",
    },
    "&:hover::after": {
      transform: "scaleX(1)",
      transformOrigin: "bottom left",
    },
  };

  const renderRoleButton = () => {
    if (!isAuthenticated || !user) {
      return null;
    }

    const buttonProps = {
      variant: "outlined",
      sx: {
        marginLeft: 1,
        borderRadius: "5px",
        whiteSpace: "nowrap",
        border: "1px solid",
        display: { md: "none", lg: "flex" },
        mr: 1,
      },
    } as const;

    if (isAdmin) {
      return (
        <Button
          {...buttonProps}
          component={RouterLink}
          to="/admin"
          startIcon={<AdminPanelSettingsOutlined />}
          color="secondary"
        >
          Admin Page
        </Button>
      );
    }

    if (!isSeller) {
      return (
        <Button
          {...buttonProps}
          component={RouterLink}
          to="/become-seller"
          startIcon={<StorefrontOutlinedIcon />}
          color="primary"
        >
          Become Seller
        </Button>
      );
    }
    if (isSeller && !isAdmin) {
      return (
        <Button
          {...buttonProps}
          component={RouterLink}
          to="/seller"
          startIcon={<StorefrontOutlinedIcon />}
          color="primary"
        >
          Seller DashBoard
        </Button>
      );
    }

    return null;
  };

  return (
    <>
      <AppBar
        component="nav"
        position="static"
        sx={{
          backgroundColor: "white",
          color: "black",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          padding: { xs: "5px", lg: "0px" },
        }}
        onMouseLeave={handleMouseLeave}
      >
        <Toolbar className="flex items-center flex-nowrap">
          <Box className="flex items-center h-full">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: "none" }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                fontFamily: "'Pacifico', cursive",
                fontStyle: "italic",
                color: "primary.main",
                textDecoration: "none",
                fontSize: "1.5rem",
                whiteSpace: "nowrap",
                mx: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
              }}
            >
              VSV Shop
            </Typography>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              marginLeft: "20px",
              alignSelf: "stretch",
              whiteSpace: "nowrap",
            }}
          >
            {loadingCategories && (
              <CircularProgress size={24} sx={{ my: "auto", mx: 2 }} />
            )}
            {categoryError && (
              <Alert severity="error" sx={{ my: "auto", mx: 2 }}>
                {categoryError}
              </Alert>
            )}

            {!loadingCategories &&
              !categoryError &&
              level1Categories.map((item) => (
                <Button
                  key={item.id}
                  component={RouterLink}
                  to={`/shop/${item.name.toLowerCase()}`}
                  onMouseEnter={(e) => handleMouseEnter(e, item.name)}
                  sx={menuButtonSx}
                >
                  {item.name}
                </Button>
              ))}

            <Button
              key={contactItem}
              component={RouterLink}
              to="/contact"
              onMouseEnter={(e) => handleMouseEnter(e, contactItem)}
              sx={menuButtonSx}
            >
              {contactItem}
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box className="flex items-center gap-2">
            <IconButton
              component={RouterLink}
              to="/search"
              sx={{ color: "text.primary" }}
            >
              <SearchIcon />
            </IconButton>

            {isAuthenticated && user ? (
              <>
                <IconButton
                  component={RouterLink}
                  to="/wishlist"
                  sx={{
                    color: "text.primary",
                    display: { xs: "none", sm: "flex" },
                  }}
                  aria-label="wishlist"
                >
                  <Badge badgeContent={wishlistCount} color="error">
                    <FavoriteBorderIcon />
                  </Badge>
                </IconButton>

                <IconButton
                  component={RouterLink}
                  to="/cart"
                  sx={{
                    color: "text.primary",
                    display: { xs: "none", sm: "flex" },
                  }}
                  aria-label="shopping cart"
                >
                  <Badge badgeContent={cartItemCount} color="error">
                    <ShoppingCartOutlinedIcon />
                  </Badge>
                </IconButton>

                <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                  <Avatar alt={user.firstName} src={user.avatar} />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  slotProps={{
                    paper: {
                      elevation: 0,
                      sx: {
                        overflow: "visible",
                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                        mt: 1.5,
                        "& .MuiAvatar-root": {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        "&:before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: "background.paper",
                          transform: "translateY(-50%) rotate(45deg)",
                          zIndex: 0,
                        },
                      },
                    },
                  }}
                >
                  <MenuItem
                    disabled
                    sx={{ mb: 1, opacity: "1 !important", cursor: "default" }}
                  >
                    <Avatar alt={user.firstName} src={user.avatar} />
                    <Box>
                      <Typography variant="subtitle2" className="font-semibold">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />

                  <MenuItem
                    component={RouterLink}
                    to="/profile?tab=account"
                    onClick={handleClose}
                  >
                    <ListItemIcon>
                      <AccountCircleOutlined fontSize="small" />
                    </ListItemIcon>{" "}
                    My Account
                  </MenuItem>
                  <MenuItem
                    component={RouterLink}
                    to="/profile?tab=orders"
                    onClick={handleClose}
                  >
                    <ListItemIcon>
                      <ShoppingCartOutlinedIcon fontSize="small" />
                    </ListItemIcon>{" "}
                    My Orders
                  </MenuItem>

                  <MenuItem
                    component={RouterLink}
                    to="/wishlist"
                    onClick={handleClose}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={wishlistCount} color="error">
                        <FavoriteBorderIcon fontSize="small" />
                      </Badge>
                    </ListItemIcon>{" "}
                    Wishlist
                  </MenuItem>

                  <MenuItem
                    component={RouterLink}
                    to="/cart"
                    sx={{ display: { xs: "flex", sm: "none" } }}
                    onClick={handleClose}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={cartItemCount} color="error">
                        <ShoppingCartOutlinedIcon fontSize="small" />
                      </Badge>
                    </ListItemIcon>{" "}
                    Shopping Cart
                  </MenuItem>

                  <Divider sx={{ my: 0.5 }} />

                  {/* (Logic trong dropdown menu giữ nguyên) */}
                  {isAdmin ? (
                    <MenuItem
                      component={RouterLink}
                      to="/admin"
                      onClick={handleClose}
                    >
                      <ListItemIcon>
                        <AdminPanelSettingsOutlined fontSize="small" />
                      </ListItemIcon>{" "}
                      Admin Page
                    </MenuItem>
                  ) : !isSeller ? (
                    <MenuItem
                      component={RouterLink}
                      to="/become-seller"
                      onClick={handleClose}
                    >
                      <ListItemIcon>
                        <StorefrontOutlinedIcon fontSize="small" />
                      </ListItemIcon>{" "}
                      Become Seller
                    </MenuItem>
                  ) : (
                    <MenuItem
                      component={RouterLink}
                      to="/seller/dashboard"
                      onClick={handleClose}
                    >
                      <ListItemIcon>
                        <StorefrontOutlinedIcon fontSize="small" />
                      </ListItemIcon>{" "}
                      Seller Dashboard
                    </MenuItem>
                  )}

                  <MenuItem onClick={handleClose}>
                    {" "}
                    <ListItemIcon>
                      <SettingsOutlined fontSize="small" />
                    </ListItemIcon>{" "}
                    Settings
                  </MenuItem>

                  <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                    <ListItemIcon>
                      <LogoutOutlined fontSize="small" color="error" />
                    </ListItemIcon>{" "}
                    Logout
                  </MenuItem>
                </Menu>
                {renderRoleButton()}
              </>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                sx={{
                  backgroundColor: "primary.main",
                  "&:hover": { backgroundColor: "primary.dark" },
                  borderRadius: "20px",
                  paddingX: 3,
                  whiteSpace: "nowrap",
                }}
              >
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Popper
        open={isMegaMenuOpen}
        anchorEl={megaMenuAnchorEl}
        placement="bottom-start"
        transition
        disablePortal
        sx={{ zIndex: 1200, width: "auto" }}
        onMouseEnter={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }}
        onMouseLeave={handleMouseLeave}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={250}>
            <Box>
              {hoveredMenu && megaMenuStructure[hoveredMenu] && (
                <MegaMenu categories={megaMenuStructure[hoveredMenu]} />
              )}
            </Box>
          </Fade>
        )}
      </Popper>

      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
};

export default Navbar;
