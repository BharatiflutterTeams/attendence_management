import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Card,
  Typography,
  Box,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import useAppStore from "../appStore";
import endpoints from "../Endpoints/endpoint";
import { jwtDecode } from "jwt-decode";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
//import { useAuthStore } from '../appStore';

const AdminLogin = () => {
  const companyData = useAppStore((state) => state.companyData);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${endpoints.serverBaseURL}/api/admin/login`,
        {
          email,
          password,
          branch: selectedBranch,
        }
      );

      if (response.status === 200) {
        const { token } = response.data;

        // Store the token in sessionStorage
        sessionStorage.setItem("jwtToken", token);
        sessionStorage.setItem(
          "checker",
          JSON.stringify({ selectedBranch, email })
        );
        toast.success("Login successful");

        const { role } = jwtDecode(token);

        // Navigate based on the role
        if (role === "checker") {
          navigate("/scanner");
        } else {
          navigate("/");
        }
      } else {
        setError("Invalid login credentials");
        toast.error("Invalid login credentials");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Error logging in. Please try again.");
      toast.error(
        error.response?.data?.message || "Error logging in. Please try again."
      );
    }
  };

  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${endpoints.serverBaseURL}/api/std/fetch-branches`
        );
        setBranches(response.data.allBranches);
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      <Box minHeight="100vh" bgcolor="#f5f5f5">
        <Grid container>
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "white",
              height: "100vh",
              padding: 4,
            }}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: "#f9a51a",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 2,
              }}
            >
              India's No. 1 Trusted
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: "#f9a51a",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Share Market Training
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: "#f9a51a",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Institute
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={5}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Box sx={{ padding: 5, marginTop: "20px" }}>
              <Avatar
                alt="Company Logo"
                src={companyData?.logo}
                sx={{
                  width: 100,
                  height: 100,
                  margin: "auto",
                }}
              />

              <Typography
                variant="h6"
                component="h2"
                gutterBottom
                align="center"
                sx={{ margin: 3 }}
              >
                Welcome to {companyData?.name}
              </Typography>
              <Card variant="outlined" sx={{ padding: 4 }}>
                <Typography
                  variant="h6"
                  component="h3"
                  gutterBottom
                  align="center"
                >
                  Admin Login
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        required
                        label="Email"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={togglePasswordVisibility}
                                edge="end"
                                aria-label="toggle password visibility"
                              >
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    {/* {isLoading && (
                      <Grid item xs={12} sx={{ textAlign: "center", mt: 1 }}>
                        <CircularProgress size={24} />
                      </Grid>
                    )} */}
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel shrink>Branches</InputLabel>
                        <Select
                          value={selectedBranch}
                          onChange={handleBranchChange}
                          displayEmpty
                          label="Branches"
                        >
                          {/* <MenuItem value="" disabled>Select a branch</MenuItem> */}
                          <MenuItem value="">All</MenuItem>
                          {branches.map((branch, index) => (
                            <MenuItem key={index} value={branch}>
                              {branch}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    {error && (
                      <Grid item xs={12}>
                        <Typography
                          variant="body2"
                          color="error"
                          align="center"
                        >
                          {error}
                        </Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                      >
                        Login
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Card>
            </Box>
          </Grid>
        </Grid>
        <ToastContainer />
      </Box>
      <ToastContainer />
    </>
  );
};

export default AdminLogin;
