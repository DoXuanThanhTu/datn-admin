"use client";

import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/src/components/layout/AdminLayout";
import api from "@/src/app/lib/api";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem as MUIMenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  Avatar,
  Divider,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";

// --- Types (khớp với schema backend: isActive, parentId, order) ---
interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string | null;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  children?: Category[];
}

interface CategoryRow extends Category {
  depth: number;
  hasChildren: boolean;
}

// --- Helpers ---
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Build a tree from a flat list using the `parentId` field
const buildTree = (items: Category[]): Category[] => {
  const map = new Map<string, Category & { children: Category[] }>();
  items.forEach((item) => map.set(item._id, { ...item, children: [] }));

  const roots: Category[] = [];
  map.forEach((item) => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(item);
    } else {
      roots.push(item);
    }
  });
  return roots;
};

// Flatten tree into rows with depth, respecting collapsed state
const flattenTree = (
  nodes: Category[],
  depth: number,
  expanded: Set<string>, // đổi tên tham số
): CategoryRow[] => {
  let rows: CategoryRow[] = [];
  nodes.forEach((node) => {
    const hasChildren = !!node.children && node.children.length > 0;
    rows.push({ ...node, depth, hasChildren });
    if (hasChildren && expanded.has(node._id)) {
      // <-- đảo lại: chỉ đệ quy khi ĐANG được mở
      rows = rows.concat(
        flattenTree(node.children as Category[], depth + 1, expanded),
      );
    }
  });
  return rows;
};

// Get id của 1 node + toàn bộ id danh mục con cháu (chặn gán cha gây vòng lặp)
const getSelfAndDescendantIds = (
  items: Category[],
  id: string,
): Set<string> => {
  const result = new Set<string>([id]);
  let changed = true;
  while (changed) {
    changed = false;
    items.forEach((item) => {
      if (item.parentId && result.has(item.parentId) && !result.has(item._id)) {
        result.add(item._id);
        changed = true;
      }
    });
  }
  return result;
};

const emptyForm = {
  _id: "",
  name: "",
  slug: "",
  icon: "",
  parentId: "" as string | "",
  order: 0,
};

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]); // flat list
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // rỗng = "chưa ai được mở" => tất cả ĐÓNG mặc định
  // Search & filter
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" | "active" | "hidden"

  // Menu (row actions)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<Category | null>(null);

  // Form dialog (add / edit / add child)
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Fetch ---
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories/admin", {
        params: {
          keyword: keyword || undefined,
          status: statusFilter || undefined, // "active" | "hidden" -> BE map sang isActive
        },
      });
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Không lấy được danh mục:", err);
      toast.error("Không thể tải danh sách danh mục!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchApply = () => fetchCategories();

  // --- Tree building ---
  const tree = useMemo(() => buildTree(categories), [categories]);
  const rows = useMemo(
    () => flattenTree(tree, 0, expanded), // truyền expanded thay vì collapsed
    [tree, expanded],
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id))
        next.delete(id); // đang mở -> đóng lại
      else next.add(id); // đang đóng -> mở ra
      return next;
    });
  };

  // Parent options for select, excluding self + descendants when editing
  const parentOptions = useMemo(() => {
    if (formMode === "edit" && form._id) {
      const excluded = getSelfAndDescendantIds(categories, form._id);
      return categories.filter((c) => !excluded.has(c._id));
    }
    return categories;
  }, [categories, form._id, formMode]);

  // --- Row menu ---
  const handleMenuOpen = (
    e: React.MouseEvent<HTMLButtonElement>,
    cat: Category,
  ) => {
    setSelected(cat);
    setAnchorEl(e.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // --- Form dialog handlers ---
  const openAddDialog = (parentId?: string) => {
    setFormMode("add");
    setForm({ ...emptyForm, parentId: parentId || "" });
    setSlugTouched(false);
    setFormOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setFormMode("edit");
    setForm({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || "",
      parentId: cat.parentId || "",
      order: cat.order ?? 0,
    });
    setSlugTouched(true);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    setFormOpen(false);
    setForm(emptyForm);
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const handleSubmitForm = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục!");
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        icon: form.icon.trim(),
        parentId: form.parentId || null,
        order: Number(form.order) || 0,
      };

      if (formMode === "add") {
        await api.post("/categories/admin", payload);
        toast.success("Đã thêm danh mục!");
      } else {
        await api.put(`/categories/admin/${form._id}`, payload);
        toast.success("Đã cập nhật danh mục!");
      }

      closeFormDialog();
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  // --- Activate / Hide ---
  const handleToggleStatus = async (cat: Category) => {
    const nextActive = !cat.isActive;
    try {
      await api.patch(`/categories/admin/${cat._id}/status`, {
        isActive: nextActive,
      });
      toast.success(nextActive ? "Đã kích hoạt danh mục!" : "Đã ẩn danh mục!");
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Có lỗi xảy ra!");
    } finally {
      handleMenuClose();
    }
  };

  // --- Delete ---
  const handleDelete = async (cat: Category) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) return;
    try {
      await api.delete(`/categories/admin/${cat._id}`);
      toast.success("Đã xóa danh mục!");
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      // BE chặn xóa khi còn danh mục con và trả message tương ứng
      toast.error(err?.message || "Không thể xóa danh mục này!");
    } finally {
      handleMenuClose();
    }
  };

  const countAll = categories.length;
  const countActive = categories.filter((c) => c.isActive).length;
  const countHidden = categories.filter((c) => !c.isActive).length;

  return (
    <AdminLayout>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "85vh" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h4" fontWeight="bold">
            Quản lý danh mục
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openAddDialog()}
          >
            Thêm danh mục
          </Button>
        </Box>

        {/* Summary chips */}
        {/* <Box display="flex" gap={1} mb={2}>
          <Chip label={`Tổng: ${countAll}`} size="small" />
          <Chip
            label={`Đang hoạt động: ${countActive}`}
            color="success"
            size="small"
            variant="outlined"
          />
          <Chip
            label={`Đã ẩn: ${countHidden}`}
            color="default"
            size="small"
            variant="outlined"
          />
        </Box> */}

        {/* Search + Filter */}
        <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
          <TextField
            label="Tên danh mục"
            size="small"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchApply()}
          />
          <TextField
            select
            label="Trạng thái"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="active">Đang hoạt động</MenuItem>
            <MenuItem value="hidden">Đã ẩn</MenuItem>
          </TextField>
          <Button variant="contained" onClick={handleSearchApply}>
            Áp dụng
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Danh mục</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell align="center">Thứ tự</TableCell>
                <TableCell align="center">Danh mục con</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Không có danh mục nào
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        sx={{ pl: row.depth * 3 }}
                      >
                        {row.depth > 0 && (
                          <SubdirectoryArrowRightIcon
                            fontSize="small"
                            sx={{ color: "text.disabled" }}
                          />
                        )}
                        {row.hasChildren ? (
                          <IconButton
                            size="small"
                            onClick={() => toggleExpand(row._id)}
                          >
                            {expanded.has(row._id) ? (
                              <ExpandMoreIcon fontSize="small" />
                            ) : (
                              <ChevronRightIcon fontSize="small" />
                            )}
                          </IconButton>
                        ) : (
                          <Box sx={{ width: 32 }} />
                        )}
                        <Avatar
                          src={row.icon || undefined}
                          variant="rounded"
                          sx={{ width: 28, height: 28, fontSize: 14 }}
                        >
                          {row.name.charAt(0)}
                        </Avatar>
                        <Typography fontWeight={row.depth === 0 ? 600 : 400}>
                          {row.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.slug}</TableCell>
                    <TableCell align="center">{row.order ?? 0}</TableCell>
                    <TableCell align="center">
                      {row.children?.length || 0}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.isActive ? "Hoạt động" : "Đã ẩn"}
                        color={row.isActive ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Thao tác">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, row)}
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
      </Box>

      {/* Row action menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MUIMenuItem
          onClick={() => {
            if (selected) openEditDialog(selected);
            handleMenuClose();
          }}
        >
          Chỉnh sửa
        </MUIMenuItem>
        <MUIMenuItem
          onClick={() => {
            if (selected) openAddDialog(selected._id);
            handleMenuClose();
          }}
        >
          Thêm danh mục con
        </MUIMenuItem>
        <Divider />
        <MUIMenuItem
          disabled={selected?.isActive === true}
          onClick={() => selected && handleToggleStatus(selected)}
        >
          Kích hoạt
        </MUIMenuItem>
        <MUIMenuItem
          disabled={selected?.isActive === false}
          onClick={() => selected && handleToggleStatus(selected)}
        >
          Ẩn danh mục
        </MUIMenuItem>
        <Divider />
        <MUIMenuItem
          onClick={() => selected && handleDelete(selected)}
          sx={{ color: "error.main" }}
        >
          Xóa danh mục
        </MUIMenuItem>
      </Menu>

      {/* Add / Edit dialog */}
      <Dialog open={formOpen} onClose={closeFormDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {formMode === "add" ? "Thêm danh mục" : "Chỉnh sửa danh mục"}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Tên danh mục"
              fullWidth
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              autoFocus
            />
            <TextField
              label="Slug (xem trước)"
              fullWidth
              value={form.slug}
              disabled
              helperText="Slug được server tự sinh từ tên danh mục"
            />
            <TextField
              label="Icon (URL hoặc tên icon)"
              fullWidth
              value={form.icon}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, icon: e.target.value }))
              }
            />
            <TextField
              select
              label="Danh mục cha"
              fullWidth
              value={form.parentId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, parentId: e.target.value }))
              }
              helperText="Để trống nếu đây là danh mục gốc. Đổi mục này để chuyển danh mục con thành danh mục cha hoặc ngược lại."
            >
              <MenuItem value="">— Danh mục gốc (không có cha) —</MenuItem>
              {parentOptions.map((opt) => (
                <MenuItem key={opt._id} value={opt._id}>
                  {opt.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Thứ tự hiển thị"
              type="number"
              fullWidth
              value={form.order}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  order: Number(e.target.value),
                }))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFormDialog} color="inherit">
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitForm}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
