import React, { useState } from "react";
import { Button, Menu, MenuItem, Box } from "@mui/material";

type Category = {
  _id: string;
  name: string;
  children?: Category[];
};

export default function CategoryHoverMenu({
  categories,
}: {
  categories: Category[];
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [subAnchorEl, setSubAnchorEl] = useState<null | HTMLElement>(null);
  const [subCategories, setSubCategories] = useState<Category[]>([]);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setSubAnchorEl(null);
  };

  const handleSubMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    children?: Category[],
  ) => {
    if (children) {
      setSubCategories(children);
      setSubAnchorEl(event.currentTarget);
    } else {
      setSubAnchorEl(null);
    }
  };

  const handleSelect = (catId: string) => {
    console.log("Chọn category:", catId);
    handleClose();
  };

  return (
    <Box>
      <Button variant="outlined" onClick={handleOpen}>
        Chọn category
      </Button>

      {/* Menu cha */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {categories.map((cat) => (
          <MenuItem
            key={cat._id}
            onMouseEnter={(e) => handleSubMenuOpen(e, cat.children)}
            onClick={() => !cat.children && handleSelect(cat._id)}
          >
            {cat.name}
          </MenuItem>
        ))}
      </Menu>

      {/* Menu con */}
      <Menu
        anchorEl={subAnchorEl}
        open={Boolean(subAnchorEl)}
        onClose={() => setSubAnchorEl(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {subCategories.map((sub) => (
          <MenuItem key={sub._id} onClick={() => handleSelect(sub._id)}>
            {sub.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
