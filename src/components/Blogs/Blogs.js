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
import { Editor } from "@tinymce/tinymce-react"; // Import the TinyMCE React component

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
    tags: "",
    published: "Yes",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteBlogId, setDeleteBlogId] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch blogs from the API
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
        tags: blog.tags,
        published: "Yes",
      });
      setPreview(null);
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
    if (!newBlog.author.trim()) errors.author = "Author is required.";
    if (!newBlog.tags.trim()) errors.tags = "Tags are required.";
    if (!image && !editMode) errors.image = "Image is required.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

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
    { field: "tags", headerName: "Tags", flex: 1 },
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
        />
      </Box>
      {/* Delete confirmation modal */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this blog? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Blog creation/edit modal */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80vw",
            p: { xs: 2, sm: 4 },
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            maxHeight: "90vh", // Limit the height of the modal
            overflowY: "auto", // Enable vertical scrolling if content overflows
          }}
        >
          <Typography variant="h6" component="h2" mb={2}>
            {editMode ? "Edit Blog" : "Add Blog"}
          </Typography>
          <TextField
            label="Title"
            name="title"
            fullWidth
            value={newBlog.title}
            onChange={handleChange}
            error={!!validationErrors.title}
            helperText={validationErrors.title}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Editor
              apiKey="e9k37zmak3axn7rdzie5egp1k8hn9f943e71mz093ueusvyn"
              
              initialValue={newBlog.content}
              init={{
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ], 
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                 code_toolbar: "code",
                readonly: false,
              }}
              onEditorChange={(newContent) => {
                setNewBlog({ ...newBlog, content: newContent });
              }}
            />
            {validationErrors.content && (
              <Typography color="error" variant="caption">
                {validationErrors.content}
              </Typography>
            )}
          </Box>
          <TextField
            label="Author"
            name="author"
            fullWidth
            value={newBlog.author}
            onChange={handleChange}
            error={!!validationErrors.author}
            helperText={validationErrors.author}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Tags"
            name="tags"
            fullWidth
            value={newBlog.tags}
            onChange={handleChange}
            error={!!validationErrors.tags}
            helperText={validationErrors.tags}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" component="label">
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {validationErrors.image && (
              <Typography color="error" variant="caption">
                {validationErrors.image}
              </Typography>
            )}
            {preview && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxHeight: "150px",
                    maxWidth: "100%",
                    borderRadius: "8px",
                  }}
                />
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
            }}
          >
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {editMode ? "Update Blog" : "Add Blog"}
            </Button>
          </Box>
        </Box>
      </Modal>

    </Box>
  );
};

export default Blogs;
