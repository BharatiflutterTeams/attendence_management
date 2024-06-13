import React, { useEffect, useState } from 'react';
import Sidenav from '../components/Sidenav';
import Navbar from '../components/Navbar';
import { Box, Grid, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import {
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Avatar,
  InputAdornment,
  Card,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import useAppStore from '../appStore';

const drawerWidth = 240;

export default function CompanyProfile() {
  const navigate = useNavigate();
  const setCompanyData = useAppStore((state) => state.setCompanyData);

  useEffect(() => {
    fetchDetails();
    checkAuth();
  }, [setCompanyData]);

  const [formValues, setFormValues] = useState({});
  const [isEdit, setIsEdit] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem('jwtToken');
    if (token && token !== '' && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
    } else {
      console.log('Token not Found');
      navigate('/login');
    }
  };

  const fetchDetails = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin/adminprofile');
      setFormValues(response.data?.adminprofile[0]);
      setCompanyData(response.data?.adminprofile[0]);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!formValues._id) {
        await axios.post('http://localhost:8000/api/admin/adminprofile', formValues);
      } else {
        await axios.put(`http://localhost:8000/api/admin/adminprofile/${formValues._id}`, formValues);
      }
      setIsEdit(false);
      fetchDetails();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleEditClick = () => {
    setIsEdit(true);
  };

  const handleClose = () => {
    setIsEdit(false);
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
            <Paper elevation={3} sx={{ p: 3, mt: 5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" component="h1">
                  Company Profile
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ background: "#ffffff", color: '#867AE9', textTransform: "none", fontWeight: 'bold' }}
                  onClick={handleEditClick}
                >
                  Edit Profile
                </Button>
              </Box>
              <Card sx={{ p: 3, boxShadow: 3, mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" color="primary">
                      {formValues?.name}
                    </Typography>
                    <Avatar
                      sx={{ width: 120, height: 120, mt: 2 }}
                      alt="Company Logo"
                      src={formValues?.logo}
                    />
                  </Grid>
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="logo"
                  label="Company Logo URL"
                  name="logo"
                  value={formValues?.logo}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  label="Company Name"
                  name="name"
                  value={formValues?.name}
                  onChange={handleChange}
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        +91
                      </InputAdornment>
                    ),
                  }}
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
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            sx={{ background: "#ffffff", color: '#867AE9', textTransform: "none", fontWeight: 'bold' }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outlined"
            sx={{ background: "#ffffff", color: '#867AE9', textTransform: "none", fontWeight: 'bold' }}
            onClick={handleSubmit}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
