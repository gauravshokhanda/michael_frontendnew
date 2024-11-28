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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PublishIcon from "@mui/icons-material/Publish";
import { DataGrid } from "@mui/x-data-grid";

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
    published: "false",
  });
  const [image, setImage] = useState(null); // Image file
  const [preview, setPreview] = useState(null); // Image preview URL

  // Fetch blogs from the API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/blogs/");
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
          published: blog.published || "No",
        }));
        setRows(blogs);
      } catch (err) {
        console.error("Error fetching blogs:", err.message);
        setError("Failed to fetch blogs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

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
        published: blog.published,
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
        published: "false",
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
      published: "false",
    });
    setImage(null);
    setPreview(null);
    setEditMode(false);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewBlog({ ...newBlog, [name]: value });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file)); // Generate preview URL
  };

  // Handle blog submission (Add or Edit)
  const handleSubmit = async () => {
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
          Authorization: "Bearer YOUR_ACCESS_TOKEN", // Replace with your token
        },
      };

      if (editMode) {
        // Edit existing blog
        const response = await axios.put(
          `http://localhost:5000/api/blogs/${currentBlogId}`,
          formData,
          config
        );
        console.log("Blog updated:", response.data);
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === currentBlogId ? response.data : row
          )
        );
      } else {
        // Add new blog
        const response = await axios.post(
          "http://localhost:5000/api/blogs/",
          formData,
          config
        );
        console.log("Blog added:", response.data);
        setRows((prevRows) => [...prevRows, response.data]);
      }

      handleClose();
    } catch (error) {
      console.error("Error submitting blog:", error.message);
    }
  };

  // Handle blog delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
        headers: { Authorization: "Bearer YOUR_ACCESS_TOKEN" },
      });
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      console.log(`Blog with ID ${id} deleted.`);
    } catch (error) {
      console.error("Error deleting blog:", error.message);
    }
  };

  const columns = [
    { field: "title", headerName: "Title", flex: 2, minWidth: 200 },
    { field: "content", headerName: "Content", flex: 3, minWidth: 150 },
    { field: "author", headerName: "Author", flex: 1, minWidth: 150 },
    { field: "tags", headerName: "Tags", flex: 2, minWidth: 200 },
    { field: "published", headerName: "Published", width: 120 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      minWidth: 250,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton color="primary" onClick={() => handleOpen(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
          <IconButton color="success" onClick={() => handleOpen(params.row)}>
            <PublishIcon />
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
      sx={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: 3 }}
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
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>

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
          />
          <TextField
            fullWidth
            label="Content"
            name="content"
            value={newBlog.content}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Author"
            name="author"
            value={newBlog.author}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            name="tags"
            value={newBlog.tags}
            onChange={handleChange}
            margin="normal"
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
