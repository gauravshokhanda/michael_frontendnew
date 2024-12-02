import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Typography,
    Modal,
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
        logo: "",
        address: "",
        script: "",
        contactNumber: "",
        email: "",
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteSettingId, setDeleteSettingId] = useState(null);
    const token = useSelector((state) => state.auth.token);
    const [validationErrors, setValidationErrors] = useState({});

    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${baseURL}/settings`);
            console.log("Fetched Data:", response.data);

            const settings = response.data.map((setting) => ({
                id: setting._id,
                address: setting.address || "No Address",
                contactNumber: setting.contactNumber || "No contact Number",
                email: setting.email || "No email",
                logo: setting.logo || "No logo",
                script: setting.script || "No script",
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
                address: setting.address,
                contactNumber: setting.contactNumber,
                email: setting.email,
                logo: setting.logo,
                script: setting.script,
            });
        } else {
            setEditMode(false);
            setCurrentSettingId(null);
            setNewSetting({
                address: "",
                contactNumber: "",
                email: "",
                logo: "",
                script: "",
            });
        }
    };

    const handleClose = () => {
        setOpen(false);
        setNewSetting({
            address: "",
            contactNumber: "",
            email: "",
            logo: "",
            script: "",
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

    const handleSubmit = async () => {
        const errors = {};
        if (!newSetting.logo.trim()) errors.logo = "Logo is required.";
        if (!newSetting.address.trim()) errors.address = "Address is required.";
        if (!newSetting.contactNumber.trim())
            errors.contactNumber = "Contact number is required.";
        if (!newSetting.email.trim()) errors.email = "Email is required.";
        if (!newSetting.script.trim()) errors.script = "Script is required.";

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors({});

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            if (editMode) {
                await axios.put(
                    `${baseURL}/settings/${currentSettingId}`,
                    newSetting,
                    config
                );
                fetchSettings();
            } else {
                await axios.post(`${baseURL}/settings`, newSetting, config);
                fetchSettings();
            }

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
        
        { field: "logo", headerName: "Logo", flex: 1, minWidth: 150 },
        { field: "address", headerName: "Address", flex: 1, minWidth: 200 },
        { field: "contactNumber", headerName: "Contact Number", flex: 1, minWidth: 150 },
        { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
        { field: "script", headerName: "Script", flex: 1, minWidth: 250 },
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
        <Box
            sx={{ width: "100%", maxWidth: "1000px", margin: "0 auto", padding: 3 }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h5">Forms</Typography>
                <Button variant="contained" onClick={() => handleOpen()}>
                    Add Setting
                </Button>
            </Box>
            <Box sx={{ height: 600 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableRowSelectionOnClick
                />
            </Box>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete this setting? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Modal open={open} onClose={handleClose}>
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
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        {editMode ? "Edit Setting" : "Add New Setting"}
                    </Typography>
                    <TextField
                        fullWidth
                        label="Logo"
                        name="logo"
                        value={newSetting.logo}
                        onChange={handleChange}
                        error={!!validationErrors.logo}
                        helperText={validationErrors.logo}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={newSetting.address}
                        onChange={handleChange}
                        error={!!validationErrors.address}
                        helperText={validationErrors.address}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Contact Number"
                        name="contactNumber"
                        value={newSetting.contactNumber}
                        onChange={handleChange}
                        error={!!validationErrors.contactNumber}
                        helperText={validationErrors.contactNumber}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={newSetting.email}
                        onChange={handleChange}
                        error={!!validationErrors.email}
                        helperText={validationErrors.email}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Script"
                        name="script"
                        value={newSetting.script}
                        onChange={handleChange}
                        error={!!validationErrors.script}
                        helperText={validationErrors.script}
                        margin="normal"
                    />
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 2,
                        }}
                    >
                        <Button onClick={handleClose} sx={{ mr: 1 }}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            color="primary"
                        >
                            {editMode ? "Update" : "Save"}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
};

export default Forms;
