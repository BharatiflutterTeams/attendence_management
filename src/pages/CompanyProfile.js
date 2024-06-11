import React, { useEffect, useState } from 'react';
import Sidenav from '../components/Sidenav';
import Navbar from '../components/Navbar';
import { Box, CardMedia, Grid, CardContent } from '@mui/material';
import {
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Avatar,
    InputAdornment,
    Card,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const drawerWidth = 240;

export default function CompanyProfile() {
    const Navigate = useNavigate();
    useEffect(() => { fetchDetails(); checkAuth() },[]);

    const [formValues, setFormValues] = useState({});

    const [isEdit, setIsEdit] = useState(false);

    const checkAuth = ()=>{
        const token = localStorage.getItem('jwtToken')
        
        if( token  && token !== '' && token !== null){
        const decoded = jwtDecode(token);
        const role = decoded.role
        
       
       }
       else{
          console.log('Token not Found');
          Navigate('/login');
       }
    }

    const fetchDetails = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/admin/adminprofile');
            setFormValues(response.data?.adminprofile[0]);
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
                // If there is no ID, we assume we are creating a new profile.
                await axios.post('http://localhost:8000/api/admin/adminprofile', formValues);
            } else {
                // If there is an ID, we update the existing profile.
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

    return (
        <>
            <Navbar />
            <Box sx={{ display: 'flex' }}>
                <Sidenav />
                <Box
                    component="main"
                    sx={{ flexGrow: 1, mt: 5, p: 4, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
                >
                    <Container component="main" maxWidth="md">
                        <Paper elevation={3} sx={{ p: 3, mt: 5 }}>
                            <Typography variant="h5" component="h1" gutterBottom>
                                Company Profile
                            </Typography>
                            <Card sx={{ display: 'flex', mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <CardMedia
                                    component="img"
                                    sx={{ width: { xs: '100%', sm: 150 }, height: 'auto' }}
                                    image={formValues?.logo}
                                    alt="Company Logo"
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="h6">Company Name</Typography>
                                                <Typography variant="body1">{formValues?.name}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="h6">Email</Typography>
                                                <Typography variant="body1">{formValues?.email}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="h6">Mobile Number</Typography>
                                                <Typography variant="body1">{formValues?.phone}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="h6">Address</Typography>
                                                <Typography variant="body1">{formValues?.address}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="h6">Description</Typography>
                                                <Typography variant="body1">{formValues?.description}</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Box>
                            </Card>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2 }}
                                onClick={handleEditClick}
                            >
                                Edit Profile
                            </Button>
                            {isEdit && (
                                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sx={{ textAlign: 'center' }}>
                                            <Avatar
                                                src={formValues?.logo}
                                                sx={{ width: 80, height: 80, margin: '0 auto' }}
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
                                                    startAdornment: <InputAdornment position="start">+91</InputAdornment>,
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
                                        <Grid item xs={12}>
                                            <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
                                                Save
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Paper>
                    </Container>
                </Box>
            </Box>
        </>
    );
}
