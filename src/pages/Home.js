import React, { useEffect } from 'react'
import Sidenav from '../components/Sidenav'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar';
import Navbar from '../components/Navbar';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
const drawerWidth = 240;
function Home() {
  const Navigate = useNavigate();
  useEffect(()=>{checkAuth()},[])


  const checkAuth = ()=>{
    const token = localStorage.getItem('jwtToken')

    if( token && token !== '' && token !== null){
    const decoded = jwtDecode(token);
    const role = decoded.role
    
   
   }
   else{
      console.log('Token not Found');
      Navigate('/login');
   }
}
  return (
    <>
    <Navbar/>
    <Box sx={{ display: 'flex' }}>
    
      <Sidenav/>

    <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <h1>To access the dashboard get premium subscription</h1>
      </Box>
    </Box>
    </>
  )
}

export default Home