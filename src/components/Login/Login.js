import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  Checkbox,
  FormControlLabel,
  Link,
} from "@mui/material";
import API from "../../config/apiConfig";
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
        backgroundColor: "#f9fafb",
      }}
    >
      <Card
        sx={{
          width: 360,
          padding: 4,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          backgroundColor: "#ffffff",
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <TextField
              label="Password"
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
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
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 3,
            }}
          >
            <FormControlLabel
              control={<Checkbox sx={{ padding: "0 5px" }} />}
              label="Remember me"
              sx={{
                "& .MuiTypography-root": {
                  fontSize: "0.875rem",
                },
              }}
            />
            <Link
              href="/forgot-password"
              sx={{
                fontSize: "0.875rem",
                color: "#1976d2",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Forgot your password?
            </Link>
          </Box>
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
        <Typography
          sx={{
            marginTop: 3,
            fontSize: "0.875rem",
            textAlign: "center",
            color: "#666666",
          }}
        >
          Don’t have an account?{" "}
          <Link
            href="/register"
            sx={{
              color: "#1976d2",
              textDecoration: "none",
              fontWeight: "500",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Sign up
          </Link>
        </Typography>
      </Card>
    </Box>
  );
};

export default Login;
