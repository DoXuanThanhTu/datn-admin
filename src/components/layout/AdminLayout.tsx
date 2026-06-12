"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PostAddIcon from "@mui/icons-material/PostAdd";
import PeopleIcon from "@mui/icons-material/People";

const drawerWidth = 240;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      href: "/",
    },
    {
      text: "Quản lý tin đăng",
      icon: <PostAddIcon />,
      href: "/posts",
    },
    {
      text: "Người dùng",
      icon: <PeopleIcon />,
      href: "/users",
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6">
            Admin Đồ Cũ Market
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />

        <List>
          {menuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  sx={{
                    bgcolor: active ? "#e3f2fd" : "transparent",
                    color: active ? "#1976d2" : "inherit",
                    borderRight: active ? "4px solid #1976d2" : "4px solid transparent",

                    "& .MuiListItemIcon-root": {
                      color: active ? "#1976d2" : "inherit",
                    },

                    "&:hover": {
                      bgcolor: "#e3f2fd",
                      color: "#1976d2",

                      "& .MuiListItemIcon-root": {
                        color: "#1976d2",
                      },
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {children}
      </Box>
      <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
    </Box>
  );
}