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
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { baseURL } from "../../config/apiConfig";
// Add the Source Editing plugin
ClassicEditor.defaultConfig = {
  plugins: [...ClassicEditor.builtinPlugins],
  toolbar: [
    "heading",
    "|",
    "bold",
    "italic",
    "link",
    "bulletedList",
    "numberedList",
    "blockQuote",
    "|",
    "undo",
    "redo",
    "|",
  ],
};

const CMS = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); // Modal state
  const [editMode, setEditMode] = useState(false); // Edit or Add mode
  const [currentPageId, setCurrentPageId] = useState(null); // ID of the page being edited
  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    body: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePageId, setDeletePageId] = useState(null);
  const token = useSelector((state) => state.auth.token);

  const fetchPages = async () => {
    try {
      const response = await axios.get(`${baseURL}/contents`);
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid API response structure");
      }
      const pages = response.data.map((page) => ({
        id: page._id,
        title: page.title || "Untitled",
        slug: page.slug || "No slug",
        body: page.body || "No content",
      }));
      setRows(pages);
    } catch (err) {
      console.error("Error fetching pages:", err.message);
      setError("Failed to fetch pages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpen = (page = null) => {
    setOpen(true);
    if (page) {
      setEditMode(true);
      setCurrentPageId(page.id);
      setNewPage({
        title: page.title,
        slug: page.slug,
        body: page.body,
      });
    } else {
      setEditMode(false);
      setCurrentPageId(null);
      setNewPage({
        title: "",
        slug: "",
        body: "",
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNewPage({
      title: "",
      slug: "",
      body: "",
    });
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPage({ ...newPage, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const handleBodyChange = (value) => {
    setNewPage({ ...newPage, body: value });
    if (validationErrors.body) {
      setValidationErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors.body;
        return updatedErrors;
      });
    }
  };

  const handleSubmit = async () => {
    const errors = {};

    if (!newPage.title.trim()) errors.title = "Title is required.";
    if (!newPage.slug.trim()) errors.slug = "Slug is required.";
    if (!newPage.body.trim()) errors.body = "Body content is required.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      const config = {
        headers: { "Content-Type": "application/json" },
        Authorization: `Bearer ${token}`,
      };

      if (editMode) {
        await axios.put(
          `${baseURL}/contents/${currentPageId}`,
          newPage,
          config
        );
        fetchPages();
      } else {
        await axios.post(`${baseURL}/contents`, newPage, config);
        fetchPages();
      }

      handleClose();
    } catch (error) {
      console.error("Error submitting page:", error.message);
    }
  };

  const handleDelete = (id) => {
    setDeletePageId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${baseURL}/contents/${deletePageId}`);
      setRows((prevRows) => prevRows.filter((row) => row.id !== deletePageId));
      console.log(`Page with ID ${deletePageId} deleted.`);
    } catch (error) {
      console.error("Error deleting page:", error.message);
    } finally {
      setDeleteDialogOpen(false);
      setDeletePageId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletePageId(null);
  };

  const columns = [
    { field: "title", headerName: "Title", flex: 1, minWidth: 120 },
    { field: "slug", headerName: "Slug", flex: 1, minWidth: 150 },
    { field: "body", headerName: "Content", flex: 1, minWidth: 250 },
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
        <Typography variant="h5">CMS Pages</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Page
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
            Are you sure you want to delete this page? This action cannot be
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

      {/* Add/Edit Page Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" component="h2">
            {editMode ? "Edit Page" : "Add Page"}
          </Typography>
          <TextField
            label="Title"
            name="title"
            value={newPage.title}
            onChange={handleChange}
            error={!!validationErrors.title}
            helperText={validationErrors.title}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Slug"
            name="slug"
            value={newPage.slug}
            onChange={handleChange}
            error={!!validationErrors.slug}
            helperText={validationErrors.slug}
            fullWidth
            margin="normal"
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Body Content
            </Typography>
            <CKEditor
              editor={ClassicEditor}
              data={newPage.body}
              onChange={(event, editor) => handleBodyChange(editor.getData())}
            />
          </Box>
          {validationErrors.body && (
            <Typography color="error">{validationErrors.body}</Typography>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={handleClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained">
              {editMode ? "Update" : "Create"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default CMS;
