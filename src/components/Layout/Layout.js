import React from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import { Outlet, Link } from "react-router-dom";

const Layout = () => {
  const menuItems = [
    { text: "Dashboard", path: "/" },
    { text: "Blogs", path: "/blogs" },
    { text: "Menu", path: "/menu" },
    { text: "Forms", path: "/forms" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            My Application
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar /> {/* This adds space below the AppBar */}
        <List>
          {menuItems.map((item, index) => (
            <ListItem button component={Link} to={item.path} key={index}>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: 8, // Adjust for AppBar height
        }}
      >
        <Toolbar /> {/* This keeps content below the AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
