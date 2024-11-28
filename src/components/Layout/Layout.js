import React from "react";
import { Drawer, Box, List, ListItem, ListItemText } from "@mui/material";
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
      <Drawer
        variant="permanent"
        sx={{ width: 240, "& .MuiDrawer-paper": { width: 240 } }}
      >
        <List>
          {menuItems.map((item, index) => (
            <ListItem button component={Link} to={item.path} key={index}>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
