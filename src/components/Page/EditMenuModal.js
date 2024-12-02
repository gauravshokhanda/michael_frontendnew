import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useSelector } from "react-redux";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { baseURL } from "../../config/apiConfig";

const EditMenuModal = ({ open, menu, onClose, onSave, onInputChange }) => {
  const [errors, setErrors] = useState({
    name: "",
    link: "",
    sortOrder: "",
    meta_data: "",
    content: "",
  });
  const [sortOrderOptions, setSortOrderOptions] = useState([]);
  const maxSortOrder = useSelector((state) => state.sortOrder.maxSortOrder);

  useEffect(() => {
    if (open) {
      axios
        .get(`${baseURL}/menus/used-sort-orders`)
        .then((response) => {
          setSortOrderOptions(response.data.sortOrders);
        })
        .catch((error) => {
          console.error("Error fetching sort orders:", error);
        });
    }
  }, [open]);

  const validate = () => {
    let valid = true;
    const newErrors = {
      name: "",
      link: "",
      sortOrder: "",
      meta_data: "",
      content: "",
    };

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

    if (!menu.meta_data.trim()) {
      newErrors.meta_data = "Meta Data is required";
      valid = false;
    }

    if (!menu.content.trim()) {
      newErrors.content = "Content is required";
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

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: "800px", // Matches the `maxWidth="md"` behavior
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Title */}
        <Box
          sx={{
            
            color: "primary.main",
            p: 2,
            fontWeight: "bold",
            fontSize: "1.25rem",
            borderBottom: "1px solid #ddd",
          }}
        >
          Edit Page
        </Box>

        {/* Content */}
        <Box
          sx={{
            maxHeight: "70vh", // Add scrollable content
            overflowY: "auto",
            p: 3,
          }}
        >
          {/* Page Name */}
          <TextField
            label="Page Name"
            value={menu.name || ""}
            onChange={(e) => onInputChange("name", e.target.value)}
            fullWidth
            margin="dense"
            error={Boolean(errors.name)}
            helperText={errors.name}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />

          {/* Meta Data */}
          <TextField
            label="Meta Data"
            value={menu.meta_data || ""}
            onChange={(e) => onInputChange("meta_data", e.target.value)}
            fullWidth
            margin="dense"
            error={Boolean(errors.meta_data)}
            helperText={errors.meta_data}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />

          {/* Content Editor */}
          <Typography variant="body1" mt={2} mb={1}>
            Content
          </Typography>
          <Editor
            apiKey="e9k37zmak3axn7rdzie5egp1k8hn9f943e71mz093ueusvyn"
            value={menu.content || ""}
            init={{
              height: 300,
              menubar: false,
              plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table paste code help wordcount",
              ],
              toolbar: `undo redo | formatselect | bold italic backcolor | 
              alignleft aligncenter alignright alignjustify | 
              bullist numlist outdent indent | removeformat | help`,
            }}
            onEditorChange={(content) => onInputChange("content", content)}
          />
          {Boolean(errors.content) && (
            <Typography color="error" variant="body2">
              {errors.content}
            </Typography>
          )}

          {/* Page Slug */}
          <TextField
            label="Page Slug"
            value={menu.link || ""}
            onChange={(e) => onInputChange("link", e.target.value)}
            fullWidth
            margin="dense"
            error={Boolean(errors.link)}
            helperText={errors.link}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />

          {/* Sort Order */}
          <Typography variant="body1" mt={2} mb={1}>
            Sort Order
          </Typography>
          <Select
            value={menu.sortOrder || ""}
            onChange={(e) => onInputChange("sortOrder", e.target.value)}
            fullWidth
            margin="dense"
            variant="outlined"
          >
            {[...Array(maxSortOrder).keys()].map((num) => (
              <MenuItem
                key={num + 1}
                value={num + 1}
                disabled={sortOrderOptions.includes(num + 1)}
              >
                {num + 1}
              </MenuItem>
            ))}
          </Select>
          {Boolean(errors.sortOrder) && (
            <Typography color="error" variant="body2" mt={1}>
              {errors.sortOrder}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            p: 2,
            bgcolor: "background.default",
            borderTop: "1px solid #ddd",
          }}
        >
          <Button
            onClick={onClose}
            color="secondary"
            variant="outlined"
            sx={{ textTransform: "none", mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              paddingX: 3,
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>

  );
};

export default EditMenuModal;
