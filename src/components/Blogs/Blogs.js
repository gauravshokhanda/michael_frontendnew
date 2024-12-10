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
import ImageModal from "./ImageModal"; // Assuming you have a modal for images
import { DataGrid } from "@mui/x-data-grid";
import { useSelector } from "react-redux";
import { baseURL } from "../../config/apiConfig";

const Blogs = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState(null);
  const [newBlog, setNewBlog] = useState({
    title: "",
    content: "",
    author: "",
    published: "Yes",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteBlogId, setDeleteBlogId] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const [validationErrors, setValidationErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
        image: blog.image || null,
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

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpen = (blog = null) => {
    setOpen(true);
    if (blog) {
      setEditMode(true);
      setCurrentBlogId(blog.id);
      setNewBlog({
        title: blog.title,
        content: blog.content,
        author: blog.author,
        published: "Yes",
      });
      setPreview(blog.image || null);
    } else {
      setEditMode(false);
      setCurrentBlogId(null);
      setNewBlog({
        title: "",
        content: "",
        author: "",
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
      published: "Yes",
    });
    setImage(null);
    setPreview(null);
    setEditMode(false);
  };

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    
    const errors = {};
    if (!newBlog.title.trim()) errors.title = "Title is required.";
    if (!newBlog.content.trim()) errors.content = "Content is required.";


    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    const formData = new FormData();
    formData.append("title", newBlog.title);
    formData.append("content", newBlog.content);
    formData.append("author", newBlog.author);
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
        await axios.put(`${baseURL}/blogs/${currentBlogId}`, formData, config);
      } else {
        await axios.post(`${baseURL}/blogs/`, formData, config);
      }

      fetchBlogs();
      handleClose();
    } catch (error) {
      console.error("Error submitting blog:", error.message);
    }
  };

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
    { field: "title", headerName: "Title", flex: 1 },
    { field: "content", headerName: "Content", flex: 2 },
    { field: "author", headerName: "Author", flex: 1 },
    {
      field: "image",
      headerName: "Image",
      width: 150,
      renderCell: (params) =>
        params.row.image ? (
          <img
            src={params.row.image}
            alt="Blog"
            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
          />
        ) : (
          "No Image"
        ),
    },
    { field: "published", headerName: "Published", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
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
    <Box sx={{ width: "100%", maxWidth: "1000px", margin: "0 auto", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Blogs</Typography>
        <Box sx={{ display: "flex", justifyContent: "end", gap: 2 }}>
          <Button variant="contained" onClick={() => handleOpen()}>
            Add Blog
          </Button>
          <Button variant="contained" onClick={handleOpenModal}>
            Feature image
          </Button>
        </Box>
      </Box>
      {/* Modal Component */}
      {isModalOpen && (
        <ImageModal onClose={handleCloseModal} open={isModalOpen} />
      )}
      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          checkboxSelection
        />
      </Box>

      {/* Dialog for Blog Edit */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ p: 3, bgcolor: "white", maxWidth: 600, maxHeight: 500, margin: "5% auto", overflow: "auto" }}>
          <Typography variant="h6">
            {editMode ? "Edit Blog" : "Add Blog"}
          </Typography>
          <TextField
            name="title"
            label="Title"
            fullWidth
            margin="normal"
            value={newBlog.title}
            onChange={handleChange}
            error={!!validationErrors.title}
            helperText={validationErrors.title}
          />
          <TextField
            name="content"
            label="Content"
            fullWidth
            margin="normal"
            value={newBlog.content}
            onChange={handleChange}
            error={!!validationErrors.content}
            helperText={validationErrors.content}
            multiline
            rows={4}
          />
          <TextField
            name="author"
            label="Author"
            fullWidth
            margin="normal"
            value={newBlog.author}
            onChange={handleChange}
            error={!!validationErrors.author}
            helperText={validationErrors.author}
          />
          <Button variant="contained" component="label" fullWidth>
            Upload Image
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleImageUpload}
            />
          </Button>
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{ maxHeight: 200, marginTop: 20, marginLeft: "35%" }}
            />
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, marginTop: 1 }}>
            <Button variant="outlined" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editMode ? "Update" : "Add"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this blog?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Blogs;
