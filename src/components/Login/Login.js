import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { API } from "../../config/apiConfig";
import { setLogin } from "../../redux/slices/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { email, password };

    try {
      const response = await API.post("/auth/login", data);
      const { token, user } = response.data;

      // Save login info in Redux
      dispatch(setLogin({ token, user }));

      // Redirect to dashboard
      navigate("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: "linear-gradient(to bottom right, #1976d2, #4caf50)",
        animation: "gradientAnimation 6s ease infinite",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Animations */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 1,
          animation: "floatingCircles 8s infinite",
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(circle, rgba(255, 255, 255, 0.1) 1%, transparent 80%)",
          backgroundSize: "150px 150px",
        }}
      />

      {/* Overlay Text */}
      <Typography
        variant="h1"
        sx={{
          position: "absolute",
          top: "10%",
          fontSize: "2.5rem",
          fontWeight: "bold",
          color: "#ffffff",
          opacity: 0.9,
          textShadow: "2px 2px 10px rgba(0, 0, 0, 0.5)",
          zIndex: 2,
        }}
      >
        Admin Panel AITSTAX
      </Typography>

      <Card
        sx={{
          width: 360,
          padding: 4,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          backgroundColor: "#ffffff",
          position: "relative",
          zIndex: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "600",
            marginBottom: 2,
            textAlign: "center",
            color: "#333333",
          }}
        >
          Sign in
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              marginBottom: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#cccccc",
                },
                "&:hover fieldset": {
                  borderColor: "#666666",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                },
              },
            }}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              marginBottom: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#cccccc",
                },
                "&:hover fieldset": {
                  borderColor: "#666666",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                },
              },
            }}
          />
          <FormControlLabel
            control={<Checkbox sx={{ padding: "0 5px" }} />}
            label="Remember me"
            sx={{
              "& .MuiTypography-root": {
                fontSize: "0.875rem",
              },
              marginBottom: 2,
            }}
          />
          {error && (
            <Typography
              color="error"
              sx={{
                marginBottom: 2,
                fontSize: "0.875rem",
                textAlign: "center",
              }}
            >
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            sx={{
              padding: 1.2,
              backgroundColor: "#000000",
              color: "#ffffff",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "6px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                backgroundColor: "#333333",
              },
            }}
          >
            Sign in
          </Button>
        </form>
      </Card>

      <style>
        {`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes floatingCircles {
            0% { transform: translateY(0); opacity: 1; }
            50% { transform: translateY(-20px); opacity: 0.7; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default Login;
