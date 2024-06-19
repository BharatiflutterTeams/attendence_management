import React, { useState } from 'react';
import { TextField, Button, Grid, Card, Typography, Box , Avatar } from '@mui/material';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../appStore'
import endpoints from '../Endpoints/endpoint';
//import { useAuthStore } from '../appStore';


const AdminLogin = () => {
  const companyData = useAppStore(state=>state.companyData);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  //const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${endpoints.serverBaseURL}/api/admin/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        const { token } = response.data;
        sessionStorage.setItem('jwtToken', token); // Store the token in sessionStorage
        console.log('Login successful');
        //setToken(String(token));
        toast.success("Login successfull")
        navigate('/');
        // Redirect to the admin dashboard or another protected route
      } else {
        setError('Invalid login credentials');
        toast.error('Invalid login credentials');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Error logging in. Please try again.');
      toast.error('Error logging in. Please try again.');
    }
  };
 // https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg?cs=srgb&dl=pexels-pixabay-261169.jpg&fm=jpg
  return (
    <>
    <Box minHeight="100vh" bgcolor="#f5f5f5">
      <Grid container>
        <Grid 
          item 
          xs={12} 
          md={7} 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundImage: `url(https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg?cs=srgb&dl=pexels-pixabay-261169.jpg&fm=jpg)`, // Replace with your image URL
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            height: '100vh' // Ensure the image covers the entire height
          }} 
        />
        <Grid 
          item 
          xs={12} 
          md={5} 
          display="flex" 
          justifyContent="center" 
          alignItems="center"
        >
          <Box sx={{padding:5 , marginTop:'20px'}}>
            {/* <Typography variant="h5" component="h3" gutterBottom align="center" sx={{margin:2}}>
              Bharti-Resort
            </Typography> */}
              <Avatar
              alt="Company Logo"
              src={companyData?.logo} // use the logo from the store
              sx={{
                width: 100,
                height: 100,
                margin: 'auto',
              }}
            />
            
            <Typography variant="h6" component="h2" gutterBottom align="center" sx={{margin:3}}>
              Welcome to {companyData?.name}
            </Typography>
            <Card variant="outlined" sx={{ padding: 4 }}>
              <Typography variant="h6" component="h3" gutterBottom align="center">
                Admin Login
              </Typography>
              <form onSubmit={handleSubmit} style={{background:"#f5f5f5 !important"}}>
                <Grid container spacing={3} >
                  <Grid item xs={12}>
                    <TextField
                      required
                      label="Email"
                      type="email"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      label="Password"
                      type="password"
                      fullWidth
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Grid>
                  {error && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="error" align="center">
                        {error}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth >
                      Login
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
    <ToastContainer />
  </>
  );
}


export default AdminLogin;

