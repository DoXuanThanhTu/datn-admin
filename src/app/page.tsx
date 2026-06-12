"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "./store/useAuthStore";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AdminLayout from "../components/layout/AdminLayout";

export default function Home() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2
            className="animate-spin text-blue-600"
            size={32}
          />
          <p className="text-sm text-gray-500 font-medium">
            Đang chuyển hướng...
          </p>
        </div>
      </div>
    );
  }

  return (
   <AdminLayout>
     <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        fontWeight={700}
        mb={1}
      >
        Dashboard
      </Typography>

      <Typography
        color="text.secondary"
        mb={4}
      >
        Xin chào {user.name}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    color="text.secondary"
                  >
                    Người dùng
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                  >
                    1,245
                  </Typography>
                </Box>

                <Avatar
                  sx={{
                    bgcolor: "#1976d2",
                    width: 56,
                    height: 56,
                  }}
                >
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    color="text.secondary"
                  >
                    Tin đăng
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                  >
                    3,862
                  </Typography>
                </Box>

                <Avatar
                  sx={{
                    bgcolor: "#2e7d32",
                    width: 56,
                    height: 56,
                  }}
                >
                  <InventoryIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    color="text.secondary"
                  >
                    Đơn hàng
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                  >
                    856
                  </Typography>
                </Box>

                <Avatar
                  sx={{
                    bgcolor: "#ed6c02",
                    width: 56,
                    height: 56,
                  }}
                >
                  <ShoppingCartIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    color="text.secondary"
                  >
                    Doanh thu
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                  >
                    158M
                  </Typography>
                </Box>

                <Avatar
                  sx={{
                    bgcolor: "#9c27b0",
                    width: 56,
                    height: 56,
                  }}
                >
                  <AttachMoneyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid
        container
        spacing={3}
        sx={{ mt: 1 }}
      >
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              borderRadius: 4,
              height: 350,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={600}
                mb={2}
              >
                Thống kê doanh thu
              </Typography>

              <Box
                sx={{
                  height: 250,
                  borderRadius: 2,
                  bgcolor: "#f5f7fb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Biểu đồ doanh thu
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              borderRadius: 4,
              height: 350,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={600}
                mb={2}
              >
                Hoạt động gần đây
              </Typography>

              <Box
                display="flex"
                flexDirection="column"
                gap={2}
              >
                <Typography>
                  Người dùng Nguyễn Văn A đăng tin mới
                </Typography>

                <Typography>
                  Đơn hàng #12345 đã thanh toán
                </Typography>

                <Typography>
                  Admin khóa tài khoản user01
                </Typography>

                <Typography>
                  Tin đăng Laptop Dell đã duyệt
                </Typography>

                <Typography>
                  Đơn hàng #12340 hoàn tất
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
   </AdminLayout>
  );
}