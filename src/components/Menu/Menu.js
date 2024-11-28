import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import AddMenuModal from './AddMenuModal.js';
import EditMenuModal from './EditMenuModal.js';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useSelector } from 'react-redux';

const MenuTable = ({ refreshTable }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [currentMenu, setCurrentMenu] = useState({ id: '', name: '', link: '', sortOrder: '' });
  const token = useSelector((state) => state.auth.token);

  const fetchMenus = () => {
    setLoading(true);
    axios
      .get('http://localhost:5000/api/menus/', {
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
        }));

        setRows(newRows);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:5000/api/menus/${menuToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setRows((prevRows) => prevRows.filter((row) => row.id !== menuToDelete));
        console.log('Menu deleted successfully.');
        setDeleteDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error deleting menu:', error);
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
        `http://localhost:5000/api/menus/${currentMenu.id}`,
        {
          name: currentMenu.name,
          link: currentMenu.link,
          sortOrder: currentMenu.sortOrder,
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
              ? {
                ...row,
                name: currentMenu.name,
                link: currentMenu.link,
                sortOrder: currentMenu.sortOrder,
              }
              : row
          )
        );
        setEditModalOpen(false);
      })
      .catch((error) => {
        console.error('Error updating menu:', error);
      });
  };

  const handleInputChange = (field, value) => {
    setCurrentMenu((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSave = (menuData) => {
    axios
      .post(
        'http://localhost:5000/api/menus/',
        {
          name: menuData.name,
          link: menuData.link,
          sortOrder: menuData.sortOrder,
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
          },
        ]);
        setAddModalOpen(false);
      })
      .catch((error) => {
        console.error('Error adding menu:', error);
      });
  };

  useEffect(() => {
    fetchMenus();
  }, [refreshTable]);

  if (loading) {
    return <Typography variant="h6" align="center">Loading data...</Typography>;
  }

  return (
    <>
      <Grid item xs={11} lg={11} sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <Button variant="contained" onClick={() => setAddModalOpen(true)}>Add Menu</Button>
      </Grid>
      <Card>
        <DataGrid
          rows={rows}
          columns={[
            { field: 'serialNumber', headerName: 'S.No', flex: 0.1, minWidth: 100 },
            { field: 'name', headerName: 'Menu Name', flex: 0.3, minWidth: 200 },
            { field: 'link', headerName: 'Slug', flex: 0.3, minWidth: 200 },
            { field: 'sortOrder', headerName: 'Sort Order', flex: 0.2, minWidth: 150 },
            {
              field: 'Action',
              headerName: 'Action',
              flex: 0.3,
              minWidth: 200,
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
          hideFooter
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
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Menu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this menu
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

export default MenuTable;
