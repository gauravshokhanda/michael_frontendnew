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

const Blogs = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); // Modal state
  const [editMode, setEditMode] = useState(false); // Edit or Add mode
  const [currentBlogId, setCurrentBlogId] = useState(null); // ID of blog being edited
  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    author: "",
    tags: "",
    published: "Yes",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteBlogId, setDeleteBlogId] = useState(null);
  const [image, setImage] = useState(null); // Image file
  const [preview, setPreview] = useState(null); // Image preview URL
  const token = useSelector((state) => state.auth.token);
  const [validationErrors, setValidationErrors] = useState({});

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${baseURL}/blogs/`);
      if (
        !response.data ||
        !response.data.data ||
        !Array.isArray(response.data.data)
      ) {
        throw new Error("Invalid API response structure");
      }
      const blogs = response.data.data.map((blog) => ({
        id: blog._id,
        title: blog.title || "Untitled",
        content: blog.content || "No content",
        author: blog.author || "Unknown",
        tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : "No tags",
        published: "Yes",
      }));
      setRows(blogs);
    } catch (err) {
      console.error("Error fetching blogs:", err.message);
      setError("Failed to fetch blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Fetch blogs from the API
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Handle modal open/close
  const handleOpen = (blog = null) => {
    setOpen(true);
    if (blog) {
      setEditMode(true);
      setCurrentBlogId(blog.id);
      setNewBlog({
        title: blog.title,
        content: blog.content,
        author: blog.author,
        tags: blog.tags,
        published: "Yes",
      });
      setPreview(null); // You can set an image preview here if the blog has an image URL
    } else {
      setEditMode(false);
      setCurrentBlogId(null);
      setNewBlog({
        title: "",
        content: "",
        author: "",
        tags: "",
        published: "Yes",
      });
      setPreview(null);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNewBlog({
      title: "",
      content: "",
      author: "",
      tags: "",
      published: "Yes",
    });
    setImage(null);
    setPreview(null);
    setEditMode(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBlog({ ...newBlog, [name]: value });
    if (validationErrors[name]) {
      setValidationErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file)); // Generate preview URL
  };

  // Handle blog submission (Add or Edit)
  const handleSubmit = async () => {
    const errors = {};

    if (!newBlog.title.trim()) errors.title = "Title is required.";
    if (!newBlog.content.trim()) errors.content = "Content is required.";
    if (!newBlog.author.trim()) errors.author = "Author is required.";
    if (!newBlog.tags.trim()) errors.tags = "Tags are required.";
    if (!image) errors.image = "Image is required.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Reset validation errors
    setValidationErrors({});

    const formData = new FormData();
    formData.append("title", newBlog.title);
    formData.append("content", newBlog.content);
    formData.append("author", newBlog.author);
    formData.append("tags", newBlog.tags);
    formData.append("published", newBlog.published);
    if (image) {
      formData.append("image", image);
    }

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      if (editMode) {
        const response = await axios.put(
          `${baseURL}/blogs/${currentBlogId}`,
          formData,
          config
        );
        console.log("Blog updated:", response.data);
        fetchBlogs();
      } else {
        const response = await axios.post(
          `${baseURL}/blogs/`,
          formData,
          config
        );
        console.log("Blog added:", response.data);
        fetchBlogs();
      }

      handleClose();
    } catch (error) {
      console.error("Error submitting blog:", error.message);
    }
  };

  // Handle blog delete
  const handleDelete = (id) => {
    setDeleteBlogId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${baseURL}/blogs/${deleteBlogId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows((prevRows) => prevRows.filter((row) => row.id !== deleteBlogId));
      console.log(`Blog with ID ${deleteBlogId} deleted.`);
    } catch (error) {
      console.error("Error deleting blog:", error.message);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteBlogId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteBlogId(null);
  };
  const columns = [
    { field: "title", headerName: "Title", flex: 1, minWidth: 120 },
    { field: "content", headerName: "Content", flex: 1, minWidth: 250 },
    { field: "author", headerName: "Author", flex: 1, minWidth: 150 },
    { field: "tags", headerName: "Tags", flex: 1, minWidth: 150 },
    { field: "published", headerName: "Published", width: 120 },
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
        <Typography variant="h5">Blogs</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Blog
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
            Are you sure you want to delete this blog? This action cannot be
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

      {/* Add/Edit Blog Modal */}
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
            {editMode ? "Edit Blog" : "Add New Blog"}
          </Typography>
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={newBlog.title}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors.title}
            helperText={validationErrors.title}
          />
          <TextField
            fullWidth
            label="Content"
            name="content"
            value={newBlog.content}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors.content}
            helperText={validationErrors.content}
          />
          <TextField
            fullWidth
            label="Author"
            name="author"
            value={newBlog.author}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors.author}
            helperText={validationErrors.author}
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            name="tags"
            value={newBlog.tags}
            onChange={handleChange}
            margin="normal"
            error={!!validationErrors.tags}
            helperText={validationErrors.tags}
          />
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <Button variant="contained" component="label">
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {preview && (
              <Box
                component="img"
                src={preview}
                alt="Preview"
                sx={{ width: 100, height: 100, ml: 2, borderRadius: 1 }}
              />
            )}
          </Box>
          {validationErrors.image && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {validationErrors.image}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            onClick={handleSubmit}
          >
            {editMode ? "Update Blog" : "Submit"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Blogs;
