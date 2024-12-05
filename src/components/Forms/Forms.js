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
  // const [currentContactId, setCurrentContactId] = useState(null);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    number: "",
    inquires: "", // Added inquires field
    message: "",
    findus: "",
    resolved: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const [validationErrors, setValidationErrors] = useState({});

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${baseURL}/contacts`);
      console.log("Fetched Data:", response.data);

      const contacts = response.data.map((contact) => ({
        id: contact._id,
        name: contact.name || "Unknown",
        email: contact.email || "No email",
        number: contact.number || "No number",
        inquires: contact.inquires || "No inquires", // Adjusted for inquires
        message: contact.message || "No message",
        resolved: contact.resolved ? "Yes" : "No",
        findus: contact.find_us,
      }));

      setRows(contacts);
    } catch (err) {
      console.error("Error fetching contacts:", err.message);
      setError("Failed to fetch contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpen = (contact = null) => {
    setOpen(true);
    if (contact) {
      setEditMode(true);
      // setCurrentContactId(contact.id);
      setNewContact({
        name: contact.name,
        email: contact.email,
        number: contact.number,
        inquires: contact.inquires, // Set inquires for editing
        message: contact.message,
        findus: contact.find_us,
        resolved: contact.resolved === "Yes",
      });
    } else {
      setEditMode(false);
      // setCurrentContactId(null);
      setNewContact({
        name: "",
        email: "",
        number: "",
        inquires: "", // Reset inquires for adding new
        message: "",
        findus: "",
        resolved: false,
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNewContact({
      name: "",
      email: "",
      number: "",
      inquires: "", // Reset inquires on close
      message: "",
      findus: "",
      resolved: false,
    });
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewContact({ ...newContact, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  // const handleSubmit = async () => {
  //   const errors = {};
  //   if (!newContact.name.trim()) errors.name = "Name is required.";
  //   if (!newContact.email.trim()) errors.email = "Email is required.";
  //   if (!newContact.number.trim()) errors.number = "Number is required.";
  //   if (!newContact.inquires.trim()) errors.inquires = "Subject is required."; // Validation for inquires
  //   if (!newContact.message.trim()) errors.message = "Message is required.";
  //   if (!newContact.findus.trim()) errors.findus = "Message is required.";

  //   if (Object.keys(errors).length > 0) {
  //     setValidationErrors(errors);
  //     return;
  //   }

  //   setValidationErrors({});

  //   try {
  //     const config = {
  //       headers: { Authorization: `Bearer ${token}` },
  //     };

  //     if (editMode) {
  //       await axios.put(
  //         `${baseURL}/contacts/${currentContactId}`,
  //         newContact,
  //         config
  //       );
  //     } else {
  //       await axios.post(`${baseURL}/contacts`, newContact, config);
  //     }

  //     fetchContacts();
  //     handleClose();
  //   } catch (error) {
  //     console.error("Error submitting contact:", error.message);
  //   }
  // };

  const handleDelete = (id) => {
    setDeleteContactId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${baseURL}/contacts/${deleteContactId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows((prevRows) =>
        prevRows.filter((row) => row.id !== deleteContactId)
      );
    } catch (error) {
      console.error("Error deleting contact:", error.message);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteContactId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteContactId(null);
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 100 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "number", headerName: "Number", flex: 1, minWidth: 100 },
    { field: "findus", headerName: "find us", flex: 1, minWidth: 150 },
    { field: "message", headerName: "Message", flex: 1, minWidth: 250 },
    // { field: "resolved", headerName: "Resolved", width: 100 },

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
        <Typography variant="h5">Inquires</Typography>
        {/* <Button variant="contained" onClick={() => handleOpen()}>
          Add Contact
        </Button> */}
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
            Are you sure you want to delete this contact? This action cannot be
            undone.
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
            {editMode ? "Edit Contact" : "Add New Contact"}
          </Typography>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={newContact.name}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors.name}
            helperText={validationErrors.name}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={newContact.email}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors.email}
            helperText={validationErrors.email}
          />
          <TextField
            fullWidth
            label="Number"
            name="number"
            value={newContact.number}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors.number}
            helperText={validationErrors.number}
          />
          <TextField
            fullWidth
            label="Subject" // New inquires field
            name="inquires"
            value={newContact.inquires}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors.inquires}
            helperText={validationErrors.inquires}
          />
          <TextField
            fullWidth
            label="Message"
            name="message"
            value={newContact.message}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors.message}
            helperText={validationErrors.message}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Resolved
            </Typography>
            <select
              name="resolved"
              value={newContact.resolved}
              onChange={(e) =>
                setNewContact({
                  ...newContact,
                  resolved: e.target.value === "true",
                })
              }
              style={{ width: "100%", padding: "10px", borderRadius: "4px" }}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </Box>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            // onClick={handleSubmit}
          >
            {editMode ? "Update Contact" : "Submit"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Forms;
