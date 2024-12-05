import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  TextField,
  CircularProgress,
  IconButton,
  DialogContentText,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid } from "@mui/x-data-grid";
import { useSelector } from "react-redux";
import { baseURL } from "../../config/apiConfig";

const Forms = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSettingId, setCurrentSettingId] = useState(null);
  const [newSetting, setNewSetting] = useState({
    logo: null,
    logoPreview: "",
    address: "",
    script: "",
    contactNumber: "",
    email: "",
    website: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSettingId, setDeleteSettingId] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const [validationErrors, setValidationErrors] = useState({});

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${baseURL}/settings`);

      const settings = response.data.map((setting) => ({
        id: setting._id,
        address: setting.address || "No Address",
        contactNumber: setting.contactNumber || "No contact Number",
        email: setting.email || "No email",
        logo: setting.logo || "No logo",
        script: setting.script || "No script",
        website: setting.website || "No website",
      }));

      setRows(settings);
    } catch (err) {
      console.error("Error fetching settings:", err.message);
      setError("Failed to fetch settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleOpen = (setting = null) => {
    setOpen(true);
    if (setting) {
      setEditMode(true);
      setCurrentSettingId(setting.id);
      setNewSetting({
        logo: null,
        logoPreview: setting.logo,
        address: setting.address,
        contactNumber: setting.contactNumber,
        email: setting.email,
        script: setting.script,
        website: setting.website,
      });
    } else {
      setEditMode(false);
      setCurrentSettingId(null);
      setNewSetting({
        logo: null,
        logoPreview: "",
        address: "",
        contactNumber: "",
        email: "",
        script: "",
        website: "",
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNewSetting({
      logo: null,
      logoPreview: "",
      address: "",
      contactNumber: "",
      email: "",
      script: "",
      website: "",
    });
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSetting({ ...newSetting, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSetting({
        ...newSetting,
        logo: file,
        logoPreview: URL.createObjectURL(file), // For previewing the uploaded image
      });
    }
  };

  const handleSubmit = async () => {
    const errors = {};
    if (!newSetting.logo && !newSetting.logoPreview)
      errors.logo = "Logo is required.";
    if (!newSetting.address.trim()) errors.address = "Address is required.";
    if (!newSetting.contactNumber.trim())
      errors.contactNumber = "Contact number is required.";
    if (!newSetting.email.trim()) errors.email = "Email is required.";
    if (!newSetting.script.trim()) errors.script = "Script is required.";
    if (!newSetting.website.trim()) errors.website = "Website is required.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const formData = new FormData();
      if (newSetting.logo) {
        formData.append("logo", newSetting.logo);
      }
      formData.append("address", newSetting.address);
      formData.append("contactNumber", newSetting.contactNumber);
      formData.append("email", newSetting.email);
      formData.append("script", newSetting.script);
      formData.append("website", newSetting.website);

      if (editMode) {
        await axios.put(
          `${baseURL}/settings/${currentSettingId}`,
          formData,
          config
        );
      } else {
        await axios.post(`${baseURL}/settings`, formData, config);
      }

      fetchSettings();
      handleClose();
    } catch (error) {
      console.error("Error submitting setting:", error.message);
    }
  };

  const handleDelete = (id) => {
    setDeleteSettingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${baseURL}/settings/${deleteSettingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows((prevRows) =>
        prevRows.filter((row) => row.id !== deleteSettingId)
      );
    } catch (error) {
      console.error("Error deleting setting:", error.message);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteSettingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteSettingId(null);
  };

  const columns = [
    {
      field: "logo",
      headerName: "Logo",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <img
          src={params.value || "/path/to/default/logo.png"}
          alt="Logo"
          style={{ width: 50, height: 50, objectFit: "cover" }}
        />
      ),
    },
    { field: "address", headerName: "Address", flex: 1, minWidth: 200 },
    {
      field: "contactNumber",
      headerName: "Contact Number",
      flex: 1,
      minWidth: 150,
    },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "script", headerName: "Script", flex: 1, minWidth: 250 },
    { field: "website", headerName: "Website", flex: 1, minWidth: 150 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton color="primary" onClick={() => handleOpen(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Add New Setting
        </Button>
      </Box>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editMode ? "Edit Setting" : "Add New Setting"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {editMode
              ? "Update the setting details"
              : "Fill in the details to add a new setting."}
          </DialogContentText>
          <TextField
            label="Address"
            name="address"
            value={newSetting.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={Boolean(validationErrors.address)}
            helperText={validationErrors.address}
          />
          <TextField
            label="Contact Number"
            name="contactNumber"
            value={newSetting.contactNumber}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={Boolean(validationErrors.contactNumber)}
            helperText={validationErrors.contactNumber}
          />
          <TextField
            label="Email"
            name="email"
            value={newSetting.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={Boolean(validationErrors.email)}
            helperText={validationErrors.email}
          />
          <TextField
            label="Script"
            name="script"
            value={newSetting.script}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={Boolean(validationErrors.script)}
            helperText={validationErrors.script}
          />
          <TextField
            label="Website"
            name="website"
            value={newSetting.website}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={Boolean(validationErrors.website)}
            helperText={validationErrors.website}
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Upload Logo
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2, // Add spacing between items
                mt: 1,
              }}
            >
              {newSetting.logoPreview && (
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={newSetting.logoPreview}
                    alt="Logo Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              )}
              <Button
                variant="contained"
                component="label"
                sx={{
                  textTransform: "none",
                  backgroundColor: "#1976d2",
                  "&:hover": { backgroundColor: "#115293" },
                }}
              >
                Choose File
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </Button>
            </Box>
            {validationErrors.logo && (
              <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                {validationErrors.logo}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this setting? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Forms;
