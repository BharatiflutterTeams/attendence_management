
import React from 'react';
import { ClipLoader } from 'react-spinners';
import { Box , Toolbar, Typography } from '@mui/material';
import Navbar from './Navbar';
import Sidenav from './Sidenav';

const drawerWidth = 240;

const Preloader = () => {
  return (
    <>
    <Navbar/>
    <Box sx={{ display: 'flex' }}>
    
      <Sidenav/>

    <Box
        component="main"
        sx={{ flexGrow: 1, p:'1', width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
     <Toolbar />
         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection:'column', height: '80vh' }}>
         <ClipLoader size={65} color={"#123abc"} loading={true} />
          <Typography sx={{fontWeight: 'bold' , color:"#123abc" , margin:'10px'}}>Please Wait</Typography>
         </div>
      </Box>
    </Box>
    </>

  );
};

export default Preloader;
