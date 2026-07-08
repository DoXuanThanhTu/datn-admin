"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "./store/useAuthStore";
import api from "@/src/app/lib/api";

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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AdminLayout from "../components/layout/AdminLayout";

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
  };
  users: {
    newToday: number;
  };
  orders: {
    today: number;
  };
  products: {
    total: number;
    active: number;
  };
}

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const res = await api.get("/admin/dashboard");
        setStats(res.data.data);
      } catch (error) {
        console.error("Lỗi tải thống kê dashboard:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm text-gray-500 font-medium">
            Đang chuyển hướng...
          </p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Tổng người dùng",
      value: stats?.overview.totalUsers,
      subLabel: stats ? `+${stats.users.newToday} hôm nay` : undefined,
      icon: <PeopleIcon />,
      color: "#1976d2",
    },
    {
      label: "Tổng tin đăng",
      value: stats?.overview.totalProducts,
      subLabel: stats ? `${stats.products.active} đang hoạt động` : undefined,
      icon: <InventoryIcon />,
      color: "#2e7d32",
    },
    {
      label: "Tổng đơn hàng",
      value: stats?.overview.totalOrders,
      subLabel: stats ? `+${stats.orders.today} hôm nay` : undefined,
      icon: <ShoppingCartIcon />,
      color: "#ed6c02",
    },
    // {
    //   label: "Tin đang hoạt động",
    //   value: stats?.products.active,
    //   subLabel: stats ? `trên tổng ${stats.products.total} tin` : undefined,
    //   icon: <CheckCircleIcon />,
    //   color: "#9c27b0",
    // },
  ];

  return (
    <AdminLayout>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={700} mb={1}>
          Dashboard
        </Typography>

        <Typography color="text.secondary" mb={4}>
          Xin chào {user.name}
        </Typography>

        <Grid container spacing={3}>
          {cards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
              <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography color="text.secondary" fontSize={14}>
                        {card.label}
                      </Typography>

                      {loadingStats ? (
                        <Box
                          sx={{
                            width: 60,
                            height: 32,
                            bgcolor: "#f0f0f0",
                            borderRadius: 1,
                            mt: 0.5,
                          }}
                        />
                      ) : (
                        <Typography variant="h4" fontWeight={700}>
                          {card.value?.toLocaleString("vi-VN") ?? "-"}
                        </Typography>
                      )}

                      {card.subLabel && !loadingStats && (
                        <Typography
                          fontSize={12}
                          color="text.secondary"
                          mt={0.5}
                        >
                          {card.subLabel}
                        </Typography>
                      )}
                    </Box>

                    <Avatar sx={{ bgcolor: card.color, width: 56, height: 56 }}>
                      {card.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </AdminLayout>
  );
}
