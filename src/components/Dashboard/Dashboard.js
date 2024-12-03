import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { baseURL } from "../../config/apiConfig";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalQueries: 0,
    totalBlogs: 0,
    totalClients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch blogs
        const blogsResponse = await axios.get(`${baseURL}/blogs/`);
        const totalBlogs = blogsResponse.data.data.length;

        // Fetch menu (replace with your actual menu API)
        const menuResponse = await axios.get(`${baseURL}/clients/`);
        const totalClients = menuResponse.data.length || 0;

        // Fetch queries (replace with your actual queries API)
        const queriesResponse = await axios.get(`${baseURL}/contacts/`);
        console.log(queriesResponse.data);
        const totalQueries = queriesResponse.data.length || 0;

        setStats({
          totalBlogs,
          totalQueries,
          totalClients,
        });
        console.log("Updated Stats:", stats);
      } catch (error) {
        console.error("Error fetching stats:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Total Inquires Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Total Inquires
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                {stats.totalQueries}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Blogs Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              backgroundColor: "#4caf50",
              color: "#fff",
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Total Blogs
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                {stats.totalBlogs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Menu Items Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              backgroundColor: "#ff9800",
              color: "#fff",
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom>
                User
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                {stats.totalClients}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
