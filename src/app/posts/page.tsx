"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/src/components/layout/AdminLayout";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Divider,
  CircularProgress,
  Badge,
  TextField,
  MenuItem,
  Pagination,
  Menu,
  MenuItem as MUIMenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import api from "@/src/app/lib/api";

// --- 1. Định nghĩa các Interfaces ---
interface Category {
  _id: string;
  name: string;
}

interface Seller {
  _id: string;
  name: string;
}

interface Post {
  _id: string;
  title: string;
  price: number;
  priceNegotiable?: boolean;
  images: string[];
  seller: Seller;
  status: "pending" | "active" | "hidden" | "rejected";
  views: number;
  createdAt: string;
  description: string;
  condition: "new" | "used";
  location?: {
    fullAddress: string;
  };
}

interface FetchPostsParams {
  page: number;
  limit: number;
  keyword?: string;
  user?: string;
  category?: string;
  status?: string;
}

// --- 2. Component chính ---
export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [openDetail, setOpenDetail] = useState<boolean>(false);
  const [openReason, setOpenReason] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Search & Filter
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [searchUser, setSearchUser] = useState<string>("");
  const [searchCategory, setSearchCategory] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);

  // Fetch posts
  const fetchPosts = async (page: number = 1) => {
    try {
      setLoadingPosts(true);
      const params: FetchPostsParams = { page, limit: 10 };
      if (searchTitle) params.keyword = searchTitle;
      if (searchUser) params.user = searchUser;
      if (searchCategory) params.category = searchCategory;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get("/posts", { params });
      setPosts(response.data.data || []);
      setTotalPage(response.data.totalPage || 1);
      setCurrentPage(response.data.currentPage || 1);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách tin:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data || []);
    } catch (err) {
      console.error("Không lấy được category", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPosts(1);
  }, []);

  const handleSearchApply = () => fetchPosts(1);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    fetchPosts(page);
  };

  const handleOpenDetail = (post: Post) => {
    setSelectedPost(post);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedPost(null);
  };

  // --- Actions ---
  const handleApprove = async (id: string) => {
    try {
      await api.post(`/posts/admin/${id}/approve`);
      fetchPosts(currentPage);
      setOpenDetail(false);
      alert("Đã duyệt tin!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleHide = async (id: string, reasonText: string) => {
    try {
      await api.post(`/posts/admin/${id}/hide`, { reason: reasonText });
      fetchPosts(currentPage);
      setOpenDetail(false);
      setOpenReason(false);
      setReason("");
      alert("Đã ẩn tin!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string, reasonText: string) => {
    try {
      await api.post(`/posts/admin/${id}/reject`, { reason: reasonText });
      fetchPosts(currentPage);
      setOpenDetail(false);
      setOpenReason(false);
      setReason("");
      alert("Đã từ chối duyệt tin!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnhide = async (id: string) => {
    if (!confirm("Bạn có muốn hiển thị lại tin đăng này?")) return;
    try {
      await api.post(`/posts/admin/${id}/approve`);
      fetchPosts(currentPage);
      setOpenDetail(false);
      alert("Đã hiển thị lại tin!");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi hiện lại tin.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa tin này?")) return;
    try {
      await api.delete(`/posts/${id}`);
      fetchPosts(currentPage);
      setOpenDetail(false);
      alert("Đã xóa tin!");
    } catch (err) {
      console.error(err);
    }
  };

  const openReasonModal = () => setOpenReason(true);
  const closeReasonModal = () => {
    setOpenReason(false);
    setReason("");
  };

  const handleActionClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    post: Post,
  ) => {
    setSelectedPost(post);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <AdminLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "85vh",
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
          Quản lý tin đăng ({posts.length})
        </Typography>
        {/* Search + Filter */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
          <TextField
            label="Tiêu đề"
            size="small"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
          {/* <TextField
          label="Người bán"
          size="small"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        /> */}
          <TextField
            select
            label="Trạng thái"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              minWidth: 150,
              "& .MuiSelect-select": {
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="pending">Chờ duyệt</MenuItem>
            <MenuItem value="active">Đang hiện</MenuItem>
            <MenuItem value="hidden">Đã ẩn</MenuItem>
          </TextField>
          <Button variant="contained" onClick={handleSearchApply}>
            Áp dụng
          </Button>
        </Box>
        {/* Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650, tableLayout: "fixed" }}>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Hình ảnh</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Người bán</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadingPosts ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Không có tin đăng
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post._id} hover>
                    <TableCell>
                      <Badge
                        badgeContent={post.images?.length || 0}
                        color="primary"
                      >
                        <Avatar
                          src={post.images?.[0]}
                          variant="rounded"
                          sx={{ width: 64, height: 64 }}
                        />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Typography noWrap>{post.title}</Typography>
                    </TableCell>
                    <TableCell>{post.price?.toLocaleString("vi-VN")}</TableCell>
                    <TableCell>{post.seller?.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          post.status === "pending"
                            ? "Chờ duyệt"
                            : post.status === "active"
                              ? "Đang hiển thị"
                              : "Đã ẩn"
                        }
                        color={
                          post.status === "active"
                            ? "success"
                            : post.status === "pending"
                              ? "warning"
                              : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Thao tác">
                        <IconButton
                          onClick={(e) => handleActionClick(e, post)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          sx={{
            mt: "auto",
            pt: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Pagination
            count={totalPage}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
      </Box>

      {/* Menu thao tác */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MUIMenuItem
          disabled={
            selectedPost?.status !== "pending" &&
            selectedPost?.status !== "rejected"
          }
          onClick={() => {
            if (selectedPost) handleApprove(selectedPost._id);
            handleCloseMenu();
          }}
        >
          Duyệt tin
        </MUIMenuItem>
        <MUIMenuItem
          disabled={selectedPost?.status !== "active"}
          onClick={() => {
            openReasonModal();
            handleCloseMenu();
          }}
        >
          Ẩn tin
        </MUIMenuItem>
        <MUIMenuItem
          disabled={selectedPost?.status !== "hidden"}
          onClick={() => {
            if (selectedPost) handleUnhide(selectedPost._id);
            handleCloseMenu();
          }}
        >
          Hiện tin
        </MUIMenuItem>
        <MUIMenuItem
          disabled={selectedPost?.status !== "pending"}
          onClick={() => {
            openReasonModal();
            handleCloseMenu();
          }}
        >
          Từ chối duyệt
        </MUIMenuItem>
        <Divider />
        <MUIMenuItem
          onClick={() => {
            if (selectedPost) handleDelete(selectedPost._id);
            handleCloseMenu();
          }}
        >
          Xóa tin
        </MUIMenuItem>
        <MUIMenuItem
          onClick={() => {
            if (selectedPost) handleOpenDetail(selectedPost);
            handleCloseMenu();
          }}
        >
          Xem chi tiết
        </MUIMenuItem>
      </Menu>

      {/* Modal lý do */}
      <Dialog open={openReason} onClose={closeReasonModal}>
        <DialogTitle>Nhập lý do</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 1 }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do từ chối hoặc ẩn tin"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReasonModal}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!reason) return alert("Vui lòng nhập lý do!");
              if (!selectedPost) return;
              if (selectedPost.status === "pending") {
                handleReject(selectedPost._id, reason);
              } else if (selectedPost.status === "active") {
                handleHide(selectedPost._id, reason);
              }
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal chi tiết */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        fullWidth
        maxWidth="md"
      >
        {selectedPost && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "#f5f5f5",
                fontWeight: "bold",
              }}
            >
              {selectedPost.title}
              <Chip
                label={
                  selectedPost.status === "pending"
                    ? "Chờ duyệt"
                    : selectedPost.status === "active"
                      ? "Đang hiển thị"
                      : "Đã ẩn"
                }
                color={
                  selectedPost.status === "active"
                    ? "success"
                    : selectedPost.status === "pending"
                      ? "warning"
                      : "default"
                }
                size="small"
              />
            </DialogTitle>

            <DialogContent dividers>
              {selectedPost.images?.length > 0 && (
                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                  {selectedPost.images.map((img, idx) => (
                    <Avatar
                      key={idx}
                      src={img}
                      variant="rounded"
                      sx={{ width: 120, height: 120, border: "1px solid #eee" }}
                    />
                  ))}
                </Box>
              )}

              <Box mb={2}>
                <Typography variant="body2">
                  <strong>Người bán:</strong>{" "}
                  {selectedPost.seller?.name || "Người dùng"}
                </Typography>
                <Typography variant="body2">
                  <strong>Giá:</strong>{" "}
                  {selectedPost.price?.toLocaleString("vi-VN") || "Liên hệ"} VNĐ
                  {selectedPost.priceNegotiable ? " (Thương lượng)" : ""}
                </Typography>
                <Typography variant="body2">
                  <strong>Lượt xem:</strong> {selectedPost.views || 0}
                </Typography>
                <Typography variant="body2">
                  <strong>Ngày tạo:</strong>{" "}
                  {new Date(selectedPost.createdAt).toLocaleString("vi-VN")}
                </Typography>
                {selectedPost.location?.fullAddress && (
                  <Typography variant="body2">
                    <strong>Địa chỉ:</strong>{" "}
                    {selectedPost.location.fullAddress}
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Điều kiện:</strong>{" "}
                  {selectedPost.condition === "new" ? "Mới" : "Đã sử dụng"}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                <strong>Mô tả:</strong>
                {selectedPost.description || "Không có mô tả."}
              </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={handleCloseDetail} color="inherit">
                Đóng
              </Button>
              {selectedPost.status === "pending" && (
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => handleApprove(selectedPost._id)}
                >
                  Duyệt tin
                </Button>
              )}
              {selectedPost.status === "active" && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={openReasonModal}
                >
                  Ẩn tin
                </Button>
              )}
              {selectedPost.status === "pending" && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={openReasonModal}
                >
                  Từ chối
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDelete(selectedPost._id)}
              >
                Xóa tin
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </AdminLayout>
  );
}
