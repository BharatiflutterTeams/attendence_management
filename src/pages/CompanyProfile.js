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
    useEffect(() => { fetchDetails(); checkAuth() },);

    const [formValues, setFormValues] = useState({
        companyLogo: 'https://png.pngtree.com/png-clipart/20190604/original/pngtree-creative-company-logo-png-image_1197025.jpg',
        companyName: 'Example Inc.',
        companyEmail: 'info@example.com',
        companyMobile: '9876543210',
        companyAddress: '123 Example Street, Sample City, Country',
        companyDescription: 'Example Inc. is a leading provider of innovative solutions in the tech industry. We specialize in software development, IT consulting, and digital transformation services.',
    });

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
            const response = await axios.get('http://localhost:8000/api/companyprofile');
            setFormValues(response.data.companyprofile);
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
            if (formValues.companyName === '') {
                await axios.post('http://localhost:8000/api/companyprofile', formValues);
            } else {
                await axios.put('http://localhost:8000/api/companyprofile', formValues);
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
                                    image={formValues.companyLogo}
                                    alt="Company Logo"
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="h6">Company Name</Typography>
                                                <Typography variant="body1">{formValues.companyName}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="h6">Email</Typography>
                                                <Typography variant="body1">{formValues.companyEmail}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="h6">Mobile Number</Typography>
                                                <Typography variant="body1">{formValues.companyMobile}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="h6">Address</Typography>
                                                <Typography variant="body1">{formValues.companyAddress}</Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="h6">Description</Typography>
                                                <Typography variant="body1">{formValues.companyDescription}</Typography>
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
                                                src={formValues.companyLogo}
                                                sx={{ width: 80, height: 80, margin: '0 auto' }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                id="companyLogo"
                                                label="Company Logo URL"
                                                name="companyLogo"
                                                value={formValues.companyLogo}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                id="companyName"
                                                label="Company Name"
                                                name="companyName"
                                                value={formValues.companyName}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                id="companyEmail"
                                                label="Company Email"
                                                name="companyEmail"
                                                type="email"
                                                value={formValues.companyEmail}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                id="companyMobile"
                                                label="Company Mobile Number"
                                                name="companyMobile"
                                                value={formValues.companyMobile}
                                                onChange={handleChange}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                id="companyAddress"
                                                label="Company Address"
                                                name="companyAddress"
                                                value={formValues.companyAddress}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                id="companyDescription"
                                                label="Company Description"
                                                name="companyDescription"
                                                multiline
                                                rows={4}
                                                value={formValues.companyDescription}
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
