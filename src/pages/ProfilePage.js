import React from 'react'

import Sidenav from '../components/Sidenav'
import Box from '@mui/material/Box';
import Navbar from '../components/Navbar';
const drawerWidth = 240;

export default function ProfilePage() {

  return (
    <>
      <Navbar/>
      <Box sx={{ display: 'flex' }}>
        <Sidenav/>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
      

      </Box>
      </Box>
    </>
  )
}
