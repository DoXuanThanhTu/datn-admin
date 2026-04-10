"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios"; // Import AxiosError
import { useAuthStore } from "../store/useAuthStore";
import api from "../lib/api";

// 1. Định nghĩa Interface cho cấu trúc User và Response
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface LoginResponse {
  data: {
    user: User;
  };
  token: string;
}

interface ApiError {
  message: string;
}

export default function AdminLogin() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 2. Ép kiểu dữ liệu trả về cho API call
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      const { data, token } = response.data;

      if (data.user.role !== "admin") {
        setError("Bạn không có quyền truy cập vào khu vực quản trị!");
        setLoading(false);
        return;
      }

      loginStore(data.user, token);
      router.push("/posts");
    } catch (err) {
      // 3. Xử lý lỗi với AxiosError thay vì any
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f4f6f8",
      }}
    >
      <Card
        sx={{
          maxWidth: 400,
          width: "100%",
          mx: 2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          borderRadius: 4,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                bgcolor: "primary.main",
                p: 1.5,
                borderRadius: "50%",
                mb: 1,
                display: "flex",
              }}
            >
              <LockOutlined sx={{ color: "white" }} />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hệ thống quản lý sàn giao dịch đồ cũ
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email Address"
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              margin="normal"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                mt: 3,
                py: 1.5,
                textTransform: "none",
                fontSize: "1.1rem",
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Đăng nhập hệ thống"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
