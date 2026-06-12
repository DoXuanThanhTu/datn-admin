"use client";

import { useEffect, useState } from "react";
import api from "@/src/app/lib/api";

import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import AdminLayout from "@/src/components/layout/AdminLayout";
import { toast } from "react-toastify";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  status: "active" | "blocked";
  rating?: number;
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [detailOpen, setDetailOpen] =
    useState(false);

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const fetchUsers = async (
    pageNumber = 1
  ) => {
    try {
      setLoading(true);

      const res = await api.get(
        "/users",
        {
          params: {
            page: pageNumber,
            keyword,
            role,
            status,
          },
        }
      );

      setUsers(res.data.data || []);
      setTotalPages(
        res.data.pagination.totalPage || 1
      );
      setPage(pageNumber);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    user: User
  ) => {
    setSelectedUser(user);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetail = () => {
    setDetailOpen(true);
    handleMenuClose();
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;

    try {
      await api.patch(
        `/users/${selectedUser._id}/status`,
        {
          action: "block",
        }
      );
      toast.success("Đã chặn người dùng");
      fetchUsers(page);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra!");
    }

    handleMenuClose();
  };

  const handleUnblockUser =
    async () => {
      if (!selectedUser) return;

      try {
        await api.patch(
          `/users/${selectedUser._id}/status`,
          {
            action: "unblock",
          }
        );
        toast.success("Đã bỏ chặn người dùng");
        fetchUsers(page);
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra!");
      }

      handleMenuClose();
    };

  return (
   <AdminLayout>
     <Box>
      <Typography
        variant="h4"
        fontWeight={700}
        mb={3}
      >
        Quản lý người dùng
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          display="flex"
          gap={2}
          flexWrap="wrap"
        >
          <TextField
            label="Tên người dùng"
            size="small"
            value={keyword}
            onChange={(e) =>
              setKeyword(e.target.value)
            }
          />

          <TextField
            select
            label="Vai trò"
            size="small"
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">
              Tất cả
            </MenuItem>

            <MenuItem value="user">
              User
            </MenuItem>

            <MenuItem value="admin">
              Admin
            </MenuItem>
          </TextField>

          <TextField
            select
            label="Trạng thái"
            size="small"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">
              Tất cả
            </MenuItem>

            <MenuItem value="active">
              Hoạt động
            </MenuItem>

            <MenuItem value="blocked">
              Đã khóa
            </MenuItem>
          </TextField>

          <Button
            variant="contained"
            onClick={() =>
              fetchUsers(1)
            }
          >
            Tìm kiếm
          </Button>
        </Box>
      </Paper>

      <TableContainer
        component={Paper}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Avatar
              </TableCell>

              <TableCell>
                Họ tên
              </TableCell>

              <TableCell>
                Email
              </TableCell>

              <TableCell>
                Vai trò
              </TableCell>

              <TableCell>
                Trạng thái
              </TableCell>

              <TableCell>
                Đánh giá
              </TableCell>

              <TableCell>
                Ngày tạo
              </TableCell>

              <TableCell
                align="center"
              >
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                >
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user._id}
                  hover
                >
                  <TableCell>
                    <Avatar
                      src={user.avatar}
                    >
                      {user.name?.charAt(
                        0
                      )}
                    </Avatar>
                  </TableCell>

                  <TableCell>
                    {user.name}
                  </TableCell>

                  <TableCell>
                    {user.email}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={
                        user.role
                      }
                      color={
                        user.role ===
                        "admin"
                          ? "primary"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={
                        user.status ===
                        "active"
                          ? "Hoạt động"
                          : "Đã khóa"
                      }
                      color={
                        user.status ===
                        "active"
                          ? "success"
                          : "error"
                      }
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {user.rating || 0}
                  </TableCell>

                  <TableCell>
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString(
                      "vi-VN"
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      onClick={(e) =>
                        handleMenuOpen(
                          e,
                          user
                        )
                      }
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        display="flex"
        justifyContent="center"
        mt={3}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) =>
            fetchUsers(value)
          }
          color="primary"
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={
            handleViewDetail
          }
        >
          Xem chi tiết
        </MenuItem>

        <MenuItem
          onClick={
            handleBlockUser
          }
          sx={{
            opacity: selectedUser?.status === "blocked" ? 0.5 : 1,
            pointerEvents: selectedUser?.status === "blocked" ? "none" : "auto",
          }}
        >
          Khóa tài khoản
        </MenuItem>

        <MenuItem
          onClick={
            handleUnblockUser
          }
          sx={{
            opacity: selectedUser?.status === "active" ? 0.5 : 1,
            pointerEvents: selectedUser?.status === "active" ? "none" : "auto",
          }}
        >
          Mở khóa tài khoản
        </MenuItem>
      </Menu>

      <Dialog
        open={detailOpen}
        onClose={() =>
          setDetailOpen(false)
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Thông tin người dùng
        </DialogTitle>

        <DialogContent>
          {selectedUser && (
            <Box>
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                mb={3}
              >
                <Avatar
                  src={
                    selectedUser.avatar
                  }
                  sx={{
                    width: 80,
                    height: 80,
                  }}
                />

                <Box>
                  <Typography variant="h6">
                    {
                      selectedUser.name
                    }
                  </Typography>

                  <Typography>
                    {
                      selectedUser.email
                    }
                  </Typography>
                </Box>
              </Box>

              <Typography>
                Vai trò:
                {" "}
                {
                  selectedUser.role
                }
              </Typography>

              <Typography>
                Trạng thái:
                {" "}
                {
                  selectedUser.status
                }
              </Typography>

              <Typography>
                Đánh giá:
                {" "}
                {selectedUser.rating ||
                  0}
              </Typography>

              <Typography>
                Ngày tham gia:
                {" "}
                {new Date(
                  selectedUser.createdAt
                ).toLocaleString(
                  "vi-VN"
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDetailOpen(false)
            }
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
   </AdminLayout>
  );
}