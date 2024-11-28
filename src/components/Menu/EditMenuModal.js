import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useSelector } from "react-redux"; // Import to access Redux store
import axios from "axios";
import { baseURL } from "../../config/apiConfig";

const EditMenuModal = ({ open, menu, onClose, onSave, onInputChange }) => {
  const [errors, setErrors] = useState({ name: "", link: "", sortOrder: "" });
  const [sortOrderOptions, setSortOrderOptions] = useState([]);

  // Access maxSortOrder from Redux store
  const maxSortOrder = useSelector((state) => state.sortOrder.maxSortOrder); // Get from Redux store

  // Fetch used sort orders from API
  useEffect(() => {
    if (open) {
      axios
        .get(`${baseURL}/menus/used-sort-orders`)
        .then((response) => {
          console.log(response.data.sortOrders);
          setSortOrderOptions(response.data.sortOrders); // Assume API returns an array of used sort orders
        })
        .catch((error) => {
          console.error("Error fetching sort orders:", error);
        });
    }
  }, [open]);

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", link: "", sortOrder: "" };

    if (!menu.name.trim()) {
      newErrors.name = "Menu name is required";
      valid = false;
    }

    if (!menu.link.trim()) {
      newErrors.link = "Link is required";
      valid = false;
    } else if (!/^\/[^\s]+$/.test(menu.link)) {
      newErrors.link =
        "Link must start with / followed by text (e.g., /example)";
      valid = false;
    }

    if (!menu.sortOrder) {
      newErrors.sortOrder = "Sort order is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(menu);
    }
  };

  // Generate options from 1 to maxSortOrder
  const allSortOrders = Array.from({ length: maxSortOrder }, (_, i) => i + 1);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Menu</DialogTitle>
      <DialogContent>
        <TextField
          label="Menu Name"
          value={menu.name || ""}
          onChange={(e) => onInputChange("name", e.target.value)}
          fullWidth
          margin="dense"
          error={Boolean(errors.name)}
          helperText={errors.name}
        />
        <TextField
          label="Slug"
          value={menu.link || ""}
          onChange={(e) => onInputChange("link", e.target.value)}
          fullWidth
          margin="dense"
          error={Boolean(errors.link)}
          helperText={errors.link}
        />
        <Select
          label="Sort Order"
          value={menu.sortOrder || ""}
          onChange={(e) => onInputChange("sortOrder", e.target.value)}
          fullWidth
          margin="dense"
          error={Boolean(errors.sortOrder)}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Select Sort Order
          </MenuItem>
          {allSortOrders.map((order) => (
            <MenuItem
              key={order}
              value={order}
              disabled={
                sortOrderOptions.includes(order) && order !== menu.sortOrder
              }
            >
              {order}
            </MenuItem>
          ))}
        </Select>
        {errors.sortOrder && (
          <div style={{ color: "red", fontSize: "0.8rem", marginTop: "5px" }}>
            {errors.sortOrder}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMenuModal;
