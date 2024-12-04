import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  DialogContentText,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { DataGrid } from "@mui/x-data-grid";
import { useSelector } from "react-redux";
import { baseURL } from "../../config/apiConfig";

const Client = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState(null);
  const token = useSelector((state) => state.auth.token);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${baseURL}/clients`);
      console.log("Fetched Data:", response.data);

      const contacts = response.data.map((contact) => ({
        id: contact._id,
        name: contact.firstName || "Unknown",
        lastname: contact.lastName || "Unknown",
        email: contact.email || "No email",
        number: contact.phoneNumber || "No number",
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

  const handleDelete = (id) => {
    setDeleteContactId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${baseURL}/clients/${deleteContactId}`, {
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
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "number", headerName: "Number", flex: 1, minWidth: 150 },
    { field: "lastname", headerName: "lastname", flex: 1, minWidth: 150 },

    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
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
        <Typography variant="h5">Client</Typography>
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
    </Box>
  );
};

export default Client;
