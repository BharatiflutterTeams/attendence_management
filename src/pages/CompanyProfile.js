import React, { useEffect, useState } from "react";
import Sidenav from "../components/Sidenav";
import Navbar from "../components/Navbar";
import {
  Box,
  // Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  Button,
  TextField,
  // Typography,
  Container,
  Paper,
  Avatar,
  InputAdornment,
  Card,
  // Divider,
  // IconButton,
} from "@mui/material";
import { Grid, Typography, Divider, IconButton, Tooltip } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import endpoints from "../Endpoints/endpoint";
import Preloader from "../components/Preloader";
import useAppStore from "../appStore";
import DeleteIcon from "@mui/icons-material/Delete";

const drawerWidth = 240;

export default function CompanyProfile() {
  const navigate = useNavigate();

  useEffect(() => {
    //fetchDetails();
    checkAuth();
  }, []);

  const companyData = useAppStore((state) => state.companyData);
  //const[loading , setLoading] = useState(true);
  const [formValues, setFormValues] = useState({ ...companyData });
  const [formprivacyValues, setFormPrivacyValues] = useState({ ...companyData });
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [errors, setErrors] = useState({});
  // const [complementaryPersons, setComplementaryPersons] = useState([
  //   ...companyData.complementaryPersons,
  // ]);
  // const [socialMediaLinks, setSocialMediaLinks] = useState([
  //   ...companyData.socialMediaLinks,
  // ]);
  // const [paymentMethods, setPaymentMethods] = useState([
  //   ...companyData.paymentMethods,
  // ]);


  // const baseURL = "http://localhost:5001/?platform=";
  const baseURL = "https://brtengine.bhartisofttech.in/?platform="

  const platforms = ["instagram", "youtube", "facebook", "twitter"];
  // State to track which URL is being hovered over
  const [hoveredUrl, setHoveredUrl] = useState(null);

  const handleMouseEnter = (platform) => {
    setHoveredUrl(platform);
  };

  const handleMouseLeave = () => {
    setHoveredUrl(null);
  };

  const checkAuth = () => {
    const token = sessionStorage.getItem("jwtToken");
    if (token && token !== "" && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
      if (role !== "superadmin") {
        navigate("/");
      }
    } else {
      console.log("Token not Found");
      navigate("/login");
    }
  };

  if (!formValues) {
    return <Preloader />;
  }
  if (!formprivacyValues) {
    return <Preloader></Preloader>
  }
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };
  const privacyhandleChange = (event) => {
    const { name, value } = event.target;
    setFormPrivacyValues({ ...formValues, [name]: value });
  };

  // const handleComplementaryPersonChange = (index, field, value) => {
  //   const updatedPersons = [...complementaryPersons];

  //   updatedPersons[index] = { ...updatedPersons[index], [field]: value };
  //   setComplementaryPersons(updatedPersons);
  // };

  // const handleSocialMediaLinksChange = (index, field, value) => {
  //   const updatedMedias = [...socialMediaLinks];
  //   updatedMedias[index] = { ...updatedMedias[index], [field]: value };
  //   setSocialMediaLinks(updatedMedias);
  // };

  // const handlePaymentMethodChange = (index, value) => {
  //   // const updatedMethods = [...paymentMethods];
  //   updatedMethods[index] = value;
  //   setPaymentMethods(updatedMethods);
  // };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    const previewImages = files.map((file) => URL.createObjectURL(file));
    setImages(previewImages);
  };

  const handleDeleteImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setImages(newImages);
    setSelectedFiles(newFiles);
  };

  const handleCarousalSave = async () => {
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("carousal[]", file));

    formData.append("adminId", companyData._id);

    try {
      const response = await axios.post(
        `${endpoints.serverBaseURL}/api/admin/carousal/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Images uploaded successfully", response.data);
    } catch (error) {
      console.error("Error uploading images", error);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    //Append non-file fields

    try {
      const updatedFormValues = {
        ...formValues,
        
      };
      if (!formValues._id) {
        await axios.post(
          `${endpoints.serverBaseURL}/api/admin/adminprofile`,
          updatedFormValues
        );
      } else {
        await axios.put(
          `${endpoints.serverBaseURL}/api/admin/adminprofile/${formValues._id}`,
          updatedFormValues
        );
      }
      setIsEdit(false);
      //fetchDetails();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleEditClick = () => {
    setIsEdit(true);
  };

  const handleClose = () => {
    setIsEdit(false);
  };

  //**********form validation */
  const validate = () => {
    const newErrors = {};

    // URL validation for logo
    if (!formValues.logo) {
      newErrors.logo = "Please enter a valid image URL";
    }

    // Email format validation
    if (formValues.email && !/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = "Email address is invalid";
    }

    // Phone number validation
    if (formValues.phone && !/^\d{10}$/.test(formValues.phone)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    }

    // Description length validation
    if (formValues.description && formValues.description.length > 400) {
      newErrors.description = "Description should be less than 400 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = (event) => {
    event?.preventDefault();
    if (validate()) {
      handleSubmit(event);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 3,
            p: 2,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Container component="main" maxWidth="md">
            <Paper elevation={2} sx={{ p: 3, mt: 5 }}>
              {/* Heading and Edit Button Section */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3, // margin bottom for spacing
                }}
              >
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontWeight: "bold",
                    color: "#333",
                    letterSpacing: "0.5px",
                    fontSize: "2rem", 
                  }}
                >
                  Company Profile
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    background: "#ffffff",
                    color: "#867AE9",
                    textTransform: "none",
                    fontWeight: "bold",
                    borderRadius: "20px",
                  }}
                  onClick={handleEditClick}
                >
                  Edit Profile
                </Button>
              </Box>

              {/* Profile Card */}
              <Card sx={{ p: 3, boxShadow: 0 }}>
                <Grid container spacing={3}>
                  {/* Left Section: Company Info */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: "bold" }}>
                      {formValues?.name}
                    </Typography>
                    <Avatar
                      sx={{ width: 120, height: 120, mt: 2 }}
                      alt="Company Logo"
                      src={formValues.logo}
                    />
                  
                  </Grid>

                  {/* Right Section: Contact Info & Description */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" color="#867AE9" gutterBottom>
                      Contact Information
                    </Typography>
                    <Typography variant="body1">
                      <strong>Email:</strong> {formValues?.email}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Mobile Number:</strong> {formValues?.phone}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Address:</strong> {formValues?.address}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" color="#867AE9" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {formValues?.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Paper>
          </Container>
        </Box>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog open={isEdit} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Company Profile</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sx={{ textAlign: "center" }}>
                <Avatar
                  src={formValues?.logo}
                  sx={{ width: 80, height: 80, margin: "0 auto" }}
                />
              </Grid>
              {/* Logo Input */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="logo"
                  label="Company Logo URL"
                  name="logo"
                  value={formValues?.logo}
                  onChange={handleChange}
                  error={!!errors.logo}
                  helperText={errors.logo}
                />
              </Grid>
              {/* Other Form Fields */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  label="Company Name"
                  name="name"
                  value={formValues?.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  label="Company Email"
                  name="email"
                  type="email"
                  value={formValues?.email}
                  onChange={handleChange}
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Company Mobile Number"
                  name="phone"
                  value={formValues?.phone}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">+91</InputAdornment>
                    ),
                  }}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="address"
                  label="Company Address"
                  name="address"
                  value={formValues?.address}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  label="Company Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formValues?.description}
                  onChange={handleChange}
                  required
                  inputProps={{ maxLength: 400 }}
                  error={!!errors.description}
                  helperText={errors.description ? errors.description : `${formValues?.description?.length}/400`}
                />
              </Grid>
              {/* Complementary Persons, Social Media, Payment Methods */}
              {/* (Use similar pattern as above for these sections) */}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            sx={{
              background: "#ffffff",
              color: "#867AE9",
              textTransform: "none",
              fontWeight: "bold",
              borderRadius: "20px",
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outlined"
            sx={{
              background: "#ffffff",
              color: "#867AE9",
              textTransform: "none",
              fontWeight: "bold",
              borderRadius: "20px",
            }}
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
