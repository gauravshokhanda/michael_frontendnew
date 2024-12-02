import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import AddMenuModal from "./AddMenuModal.js";
import EditMenuModal from "./EditMenuModal.js";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useSelector } from "react-redux";
import { baseURL } from "../../config/apiConfig.js";

const Page = ({ refreshTable }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [currentMenu, setCurrentMenu] = useState({
    id: "",
    name: "",
    link: "",
    sortOrder: "",
    meta_data: "",
    content: "",
  });
  const token = useSelector((state) => state.auth.token);

  // Memoize fetchMenus to avoid unnecessary re-renders
  const fetchMenus = useCallback(() => {
    setLoading(true);
    axios
      .get(`${baseURL}/menus/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const menuData = response.data;

        const newRows = menuData.map((menu, index) => ({
          id: menu._id,
          serialNumber: index + 1,
          name: menu.name,
          link: menu.link,
          sortOrder: menu.sortOrder,
          meta_data: menu.meta_data,
          content: menu.content,
        }));

        setRows(newRows);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [token]); // Only re-create fetchMenus if token changes

  useEffect(() => {
    fetchMenus();
  }, [refreshTable, fetchMenus]); // Add fetchMenus as a dependency

  const handleDelete = () => {
    axios
      .delete(`${baseURL}/menus/${menuToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setRows((prevRows) => prevRows.filter((row) => row.id !== menuToDelete));
        setDeleteDialogOpen(false);
      })
      .catch((error) => {
        console.error("Error deleting menu:", error);
        setDeleteDialogOpen(false);
      });
  };

  const handleDeleteClick = (id) => {
    setMenuToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (row) => {
    setCurrentMenu(row);
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    axios
      .put(
        `${baseURL}/menus/${currentMenu.id}`,
        {
          name: currentMenu.name,
          link: currentMenu.link,
          sortOrder: currentMenu.sortOrder,
          meta_data: currentMenu.meta_data,
          content: currentMenu.content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === currentMenu.id
              ? { ...row, ...currentMenu }
              : row
          )
        );
        setEditModalOpen(false);
      })
      .catch((error) => {
        console.error("Error updating menu:", error);
      });
  };

  const handleInputChange = (field, value) => {
    setCurrentMenu((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSave = (menuData) => {
    axios
      .post(
        `${baseURL}/menus/`,
        {
          name: menuData.name,
          link: menuData.link,
          sortOrder: menuData.sortOrder,
          meta_data: menuData.meta_data,
          content: menuData.content,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        const newMenu = response.data;
        setRows((prevRows) => [
          ...prevRows,
          {
            id: newMenu._id,
            serialNumber: prevRows.length + 1,
            name: newMenu.name,
            link: newMenu.link,
            sortOrder: newMenu.sortOrder,
            meta_data: newMenu.meta_data,
            content: newMenu.content,
          },
        ]);
        setAddModalOpen(false);
      })
      .catch((error) => {
        console.error("Error adding menu:", error);
      });
  };

  if (loading) {
    return (
      <Typography variant="h6" align="center">
        Loading data...
      </Typography>
    );
  }

  return (
    <>
      <Grid
        item
        xs={12}
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
        }}
      >
        <Button variant="contained" onClick={() => setAddModalOpen(true)}>
          Add Page
        </Button>
      </Grid>
      <Card>
        <DataGrid
          rows={rows}
          columns={[
            {
              field: "serialNumber",
              headerName: "S.No",
              flex: 0.1,
              minWidth: 80,
              sortable: false,
            },
            {
              field: "name",
              headerName: "Page Name",
              flex: 0.3,
              minWidth: 150,
              sortable: true,
            },
            {
              field: "content",
              headerName: "Content",
              flex: 0.3,
              minWidth: 150,
              sortable: true,
            },
            {
              field: "meta_data",
              headerName: "Meta Data",
              flex: 0.3,
              minWidth: 150,
              sortable: true,
            },
            {
              field: "link",
              headerName: "Page Slug",
              flex: 0.3,
              minWidth: 150,
              sortable: true,
            },
            {
              field: "sortOrder",
              headerName: "Sort Order",
              flex: 0.2,
              minWidth: 100,
              sortable: true,
            },
            {
              field: "Action",
              headerName: "Action",
              flex: 0.3,
              minWidth: 150,
              renderCell: ({ row }) => (
                <>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(row)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(row.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              ),
            },
          ]}
          autoHeight
          pageSize={5}  // Pagination settings
          rowsPerPageOptions={[5, 10, 25]}  // Allow users to choose rows per page
          pagination  // Enable pagination
          disableSelectionOnClick
        />
      </Card>

      {/* Edit Menu Modal */}
      <EditMenuModal
        open={editModalOpen}
        menu={currentMenu}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        onInputChange={handleInputChange}
      />

      {/* Add Menu Modal */}
      <AddMenuModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Page</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this page?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Page;
