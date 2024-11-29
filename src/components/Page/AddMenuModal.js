import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { useDispatch, useSelector } from "react-redux";
import { updateSortOrderLimit } from "../../redux/slices/sortOrderSlice";
import axios from "axios";
import { baseURL } from "../../config/apiConfig";
import { Editor } from "@tinymce/tinymce-react";


const AddMenuModal = ({ open, onClose, onSave }) => {
  const dispatch = useDispatch();
  const maxSortOrder = useSelector((state) => state.sortOrder.maxSortOrder); // Get the limit from Redux

  const [menuData, setMenuData] = useState({
    name: "",
    link: "",
    sortOrder: "",
    meta_data: "",
    content: "",
  });
  const [errors, setErrors] = useState({ name: "", link: "", sortOrder: "", meta_data: "", content: "" });
  const [usedSortOrders, setUsedSortOrders] = useState([]);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [newLimit, setNewLimit] = useState(maxSortOrder);
  const [limitError, setLimitError] = useState("");

  useEffect(() => {
    if (open) {
      axios
        .get(`${baseURL}/menus/used-sort-orders`)
        .then((response) => {
          setUsedSortOrders(response.data.sortOrders);
        })
        .catch((error) => {
          console.error("Failed to fetch sort orders:", error);
        });
    }
  }, [open]);

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", link: "", sortOrder: "", meta_data: "", content: "" };

    if (!menuData.name.trim()) {
      newErrors.name = "Menu name is required";
      valid = false;
    }

    if (!menuData.link.trim()) {
      newErrors.link = "Link is required";
      valid = false;
    } else if (!/^\/[^\s]+$/.test(menuData.link)) {
      newErrors.link =
        "Link must start with / followed by text (e.g., /example)";
      valid = false;
    }

    if (!menuData.sortOrder) {
      newErrors.sortOrder = "Sort order is required";
      valid = false;
    }

    if (!menuData.meta_data.trim()) {
      newErrors.meta_data = "Meta Data is required";
      valid = false;
    }

    if (!menuData.content.trim()) {
      newErrors.content = "Content is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleInputChange = (field, value) => {
    setMenuData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" })); // Clear error when typing
  };

  const handleSave = () => {
    console.log("handleSave data",menuData)
    if (validate()) {
      onSave(menuData);
      setMenuData({ name: "", link: "", sortOrder: "", meta_data: "", content: "" }); // Reset form
      setErrors({ name: "", link: "", sortOrder: "", meta_data: "", content: "" }); // Reset errors
    }
  };

  const handleSaveNewLimit = () => {
    const numericLimit = parseInt(newLimit, 10); // Parse the value as an integer

    if (isNaN(numericLimit)) {
      setLimitError("Please enter a valid number"); // Error for non-numeric input
    } else if (numericLimit > 0) {
      dispatch(updateSortOrderLimit(numericLimit)); // Update Redux state
      setOpenEditModal(false);
      setLimitError(""); // Clear error if successfully saved
    } else {
      setLimitError("Limit must be greater than 0"); // Error for invalid range
    }
  };

  const handleOpenEditModal = () => {
    setNewLimit(maxSortOrder);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          maxHeight: "80vh", // Restrict height to make it scrollable
          overflowY: "auto", // Enable vertical scrolling
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 4,
          border: "2px solid #1976d2",
        }}
      >
        <Typography variant="h5" mb={2} color="primary" fontWeight="bold">
          Add New Page
        </Typography>

        {/* Page Name Input */}
        <TextField
          fullWidth
          label="Page Name"
          value={menuData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          margin="normal"
          error={Boolean(errors.name)}
          helperText={errors.name}
          InputProps={{
            sx: { borderRadius: 2 }, // Rounded input fields
          }}
        />

        {/* Meta Data Input */}
        <TextField
          fullWidth
          label="Meta Data"
          value={menuData.meta_data}
          onChange={(e) => handleInputChange("meta_data", e.target.value)}
          margin="normal"
          error={Boolean(errors.meta_data)}
          helperText={errors.meta_data}
          InputProps={{
            sx: { borderRadius: 2 },
          }}
        />

        {/* Content Editor */}
        <Box mt={3}>
          <Typography variant="body1" mb={1} fontWeight="bold">
            Content
          </Typography>
          <Editor
            apiKey="e9k37zmak3axn7rdzie5egp1k8hn9f943e71mz093ueusvyn"
            value={menuData.content}
            init={{
              height: 300,
              menubar: false,
              plugins: [
                "advlist autolink lists link image charmap print preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table paste code help wordcount",
              ],
              toolbar:
                "undo redo | formatselect | bold italic backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | help",
            }}
            onEditorChange={(content) => handleInputChange("content", content)}
          />
          {Boolean(errors.content) && (
            <Typography color="error" variant="body2" mt={1}>
              {errors.content}
            </Typography>
          )}
        </Box>

        {/* Page Slug Input */}
        <TextField
          fullWidth
          label="Page Slug"
          value={menuData.link}
          onChange={(e) => handleInputChange("link", e.target.value)}
          margin="normal"
          error={Boolean(errors.link)}
          helperText={errors.link}
          InputProps={{
            sx: { borderRadius: 2 },
          }}
        />

        {/* Sort Order */}
        <FormControl fullWidth margin="normal" error={Boolean(errors.sortOrder)}>
          <InputLabel id="sort-order-label">Sort Order</InputLabel>
          <Box display="flex" alignItems="center" gap={2}>
            <Select
              labelId="sort-order-label"
              id="sort-order-label"
              value={menuData.sortOrder}
              onChange={(e) => handleInputChange("sortOrder", e.target.value)}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              {[...Array(maxSortOrder).keys()].map((num) => (
                <MenuItem
                  key={num + 1}
                  value={num + 1}
                  disabled={usedSortOrders.includes(num + 1)}
                >
                  {num + 1}
                </MenuItem>
              ))}
            </Select>
            <IconButton
              color="primary"
              onClick={handleOpenEditModal}
              sx={{ ml: 1, borderRadius: 2, bgcolor: "primary.light", color: "white" }}
            >
              <EditIcon />
            </IconButton>
          </Box>
        </FormControl>

        {/* Footer Buttons */}
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button
            onClick={onClose}
            color="secondary"
            sx={{ mr: 1, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2 }}
          >
            Save
          </Button>
        </Box>

        {/* Nested Modal */}
        <Modal open={openEditModal} onClose={handleCloseEditModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 4,
              border: "2px solid #1976d2",
            }}
          >
            <Typography variant="h6" mb={2} fontWeight="bold">
              Update Sort Order Limit
            </Typography>
            {limitError && (
              <Typography color="error" mb={1} variant="body2">
                {limitError}
              </Typography>
            )}
            <TextField
              label="New Limit"
              type="text"
              value={newLimit}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setNewLimit(value);
                  setLimitError("");
                } else {
                  setLimitError("Please enter a valid number");
                }
              }}
              fullWidth
              margin="normal"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
            <Box mt={3} display="flex" justifyContent="flex-end">
              <Button
                onClick={handleCloseEditModal}
                color="secondary"
                sx={{ mr: 1, borderRadius: 2 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNewLimit}
                variant="contained"
                color="primary"
                sx={{ borderRadius: 2 }}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Modal>

  );
};

export default AddMenuModal;
