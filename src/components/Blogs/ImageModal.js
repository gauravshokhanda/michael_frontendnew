import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Box, Button, Typography, TextField, CircularProgress, Alert, AlertTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { baseURL } from "../../config/apiConfig";

const ImageModal = ({ open, onClose }) => {
    const [imageData, setImageData] = useState([]);
    const [formData, setFormData] = useState({ title: '', file: null });
    const [editingImageId, setEditingImageId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info');

    useEffect(() => {
        if (open) {
            fetchImages();
        }
    }, [open]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${baseURL}/featureimages/`);
            setImageData(response.data.images || []);
        } catch (error) {
            setAlertMessage('Failed to fetch images. Please try again later.');
            setAlertSeverity('error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const resetForm = () => {
        setFormData({ title: '', file: null });
        setEditingImageId(null);
        setAlertMessage('');
        onClose(); // Close the modal when resetting
    };

    const handleSave = async () => {
        if (!formData.title || (!editingImageId && !formData.file)) {
            setAlertMessage('Please provide a title and select a file.');
            setAlertSeverity('error');
            return;
        }

        const formPayload = new FormData();
        formPayload.append('title', formData.title);
        if (formData.file) formPayload.append('image', formData.file);

        try {
            setLoading(true);
            if (editingImageId) {
                await axios.put(`${baseURL}/featureimages/${editingImageId}`, formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setAlertMessage('Image updated successfully!');
                setAlertSeverity('success');
            } else {
                const response = await axios.post(`${baseURL}/featureimages`, formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setImageData((prev) => [...prev, response.data.image]);
                setAlertMessage('Image added successfully!');
                setAlertSeverity('success');
            }
            resetForm();
            fetchImages();
        } catch (error) {
            setAlertMessage('Failed to save the image. Please try again.');
            setAlertSeverity('error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (image) => {
        setFormData({ title: image.title, file: null });
        setEditingImageId(image._id);
        setAlertMessage('');
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            await axios.delete(`${baseURL}/featureimages/${id}`);
            setImageData((prev) => prev.filter((image) => image._id !== id));
            setAlertMessage('Image deleted successfully!');
            setAlertSeverity('success');
        } catch (error) {
            setAlertMessage('Failed to delete the image. Please try again.');
            setAlertSeverity('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="image-modal-title" aria-describedby="image-modal-description">
            <Box sx={modalBoxStyle}>
                {/* Header with title and close button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography id="image-modal-title" variant="h6" component="h2">
                        {editingImageId ? 'Edit Image' : 'Add Image'}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Display MUI Alert */}
                {alertMessage && (
                    <Alert severity={alertSeverity} sx={{ mb: 2 }}>
                        <AlertTitle>{alertSeverity === 'error' ? 'Error' : 'Success'}</AlertTitle>
                        {alertMessage}
                    </Alert>
                )}

                <TextField
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                />
                <TextField
                    type="file"
                    name="file"
                    onChange={handleInputChange}
                    size="small"
                    sx={{ mb: 2 }}
                />

                <Box sx={{ mt: 4 }}>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        imageData.map((image) =>
                            image && image.title ? (
                                <Box key={image._id} sx={{ mb: 3, textAlign: 'center' }}>
                                    <img
                                        src={`https://associatedincometax.iamdeveloper.in${image?.imageUrl || ''}`}
                                        alt={image.title}
                                        style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
                                    />
                                    <Typography variant="subtitle1">{image.title}</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                                        <Button variant="contained" color="primary" onClick={() => handleEdit(image)}>
                                            Edit
                                        </Button>
                                        <Button variant="contained" color="error" onClick={() => handleDelete(image._id)}>
                                            Delete
                                        </Button>
                                    </Box>
                                </Box>
                            ) : null
                        )
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : editingImageId ? 'Update Image' : 'Add Image'}
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={resetForm}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ImageModal;

const modalBoxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    width: 400,
    maxHeight: '80vh',
    overflowY: 'auto',
};
