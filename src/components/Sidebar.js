import * as React from 'react';
import Box from '@mui/material/Box';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';

import ListItemButton from '@mui/material/ListItemButton';

import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import {Link} from 'react-router-dom';



const FireNav = styled(List)({
  '& .MuiListItemButton-root': {
    paddingLeft: 24,
    paddingRight: 24,
  },
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginRight: 16,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 20,
  },
});

export default function CustomizedList() {

  
 
  
  return (
    <Box sx={{ display: 'flex',  }}>
      <ThemeProvider
        theme={createTheme({
          components: {
            MuiListItemButton: {
              defaultProps: {
                disableTouchRipple: true,
              },
            },
          },
          palette: {
            mode: 'dark',
            primary: { main: 'rgb(102, 157, 246)' },
            background: { paper: 'rgb(5, 30, 52)' },
          },
        })}
      >
        <Paper elevation={0} sx={{ maxWidth: 256 }}>
          <FireNav component="nav" disablePadding>
            <ListItemButton component="a" href="#customized-list">
              <ListItemIcon sx={{ fontSize: 20 }}></ListItemIcon>
              <ListItemText
                sx={{ my: 0 }}
                primary="Bharti resort"
                primaryTypographyProps={{
                  fontSize: 20,
                  fontWeight: 'medium',
                  letterSpacing: 0,
                }}
              />
            </ListItemButton>
            <Divider />
            
            <Divider />
                   
            {/* <ListItemButton><Link to='/' style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link></ListItemButton> */}
             <ListItemButton><Link to='/bookings' style={{ color: 'white', textDecoration: 'none' }}>booking</Link></ListItemButton>
             <ListItemButton><Link to='/attendence' style={{ color: 'white', textDecoration: 'none' }}>Attendence</Link></ListItemButton>
            <ListItemButton><Link to='/plans' style={{ color: 'white', textDecoration: 'none' }}>Plans</Link></ListItemButton>
            <ListItemButton><Link to='/coupons' style={{ color: 'white', textDecoration: 'none' }}>Coupons</Link></ListItemButton>
          </FireNav>
        </Paper>
      </ThemeProvider>
    </Box>
  );
}


