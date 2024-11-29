import React, { useState } from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  AppBar,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./LogoBlack.png";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArticleIcon from "@mui/icons-material/Article";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import { useDispatch } from "react-redux";
import { setLogin } from "../../redux/slices/authSlice"; // Adjust according to your slice

const Layout = () => {
  const location = useLocation(); // Get current URL
  const navigate = useNavigate(); // For navigation
  const dispatch = useDispatch(); // For dispatching logout action
  const [mobileOpen, setMobileOpen] = useState(false); // Sidebar toggle for mobile

  // Menu items with icons
  const menuItems = [
    { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
    { text: "Blogs", path: "/blogs", icon: <ArticleIcon /> },
    { text: "Page", path: "/page", icon: <MenuBookIcon /> },
    { text: "Forms", path: "/forms", icon: <FormatAlignJustifyIcon /> },
    { text: "CMS", path: "/cms", icon: <FormatAlignJustifyIcon /> },
  ];

  // Toggle sidebar
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Logout function
  const handleLogout = () => {
    // Clear user session from Redux store and localStorage
    dispatch(setLogin({ token: null, user: null })); // Adjust according to your Redux slice
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to the login page
    navigate("/login");
  };

  // Sidebar content
  const drawerContent = (
    <Box>
      <Toolbar /> {/* Adds space below the AppBar */}
      <List>
        {menuItems.map((item, index) => (
          <Box key={index}>
            <ListItem
              button
              component={Link}
              to={item.path}
              sx={{
                position: "relative", // Necessary for the hover effect
                backgroundColor:
                  location.pathname === item.path ? "#1976d2" : "inherit", // Highlight active route
                color: location.pathname === item.path ? "#fff" : "inherit", // Change text color for active route
                "&:hover": {
                  backgroundColor: "5AA3EC", // Hover effect background
                  color: "#fff",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? "#fff" : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {/* Divider on hover */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "0%",
                  height: "2px",
                  backgroundColor: "secondary.main", // Secondary color
                  transition: "width 0.3s",
                  "&:hover": {
                    width: "100%",
                  },
                }}
              />
            </ListItem>
            <Divider /> {/* Optional: Divider between list items */}
          </Box>
        ))}
      </List>
      <Divider sx={{ mt: 2 }} />
      {/* Logout Button */}
      <Box sx={{ mt: "auto", mb: 2, textAlign: "center" }}>
        <ListItem
          button
          onClick={handleLogout} // Trigger logout logic
          sx={{
            justifyContent: "center",
            color: "error.main",
            "&:hover": {
              backgroundColor: "error.light",
              color: "#fff",
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Box
            component="img"
            src={Logo} // Path to your logo (e.g., public/logo.png)
            alt="Logo"
            sx={{
              height: 40, // Adjust the logo height
              mr: 2, // Margin right for spacing
            }}
          />
          {/* Optional: Add a name or branding beside the logo */}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Associated Income Tax Services
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
        aria-label="sidebar"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Improve performance on mobile
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 240,
              backgroundColor: "#F5F5F5",
            },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 240,
              backgroundColor: "#F5F5F5",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: 8, // Adjust for AppBar height
          backgroundColor: "#FAFAFA", // Subtle background for content area
          minHeight: "100vh", // Ensure it covers the viewport height
        }}
      >
        <Toolbar /> {/* This keeps content below the AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
