import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import { useState } from 'react';

import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';

import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DashboardIcon from '@mui/icons-material/Dashboard';
import {useNavigate} from 'react-router-dom';
import {useAppStore} from '../appStore'
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import { jwtDecode } from 'jwt-decode';


const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));



const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function Sidenav() {
  const theme = useTheme();
  const [isSuperAdmin , setisSuperAdmin] = useState(false);
  //const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();
  
  const open = useAppStore((state)=>state.dopen);
  
  
  React.useEffect(()=>{roleCheck()},[])

  let role = '';
  const roleCheck = async()=>{
     const token =  localStorage.getItem('jwtToken');
     if( token  && token !== '' && token !== null){
         const decoded = jwtDecode(token);
         role = decoded.role;
         //console.log('sidenav' , role);
        if(role == 'superadmin'){
           setisSuperAdmin(true);
        }
      }
    }
   
   

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <Drawer variant="permanent" open={open}  PaperProps={{
    sx: {
      backgroundColor: "#27374D",
       color:'white'
    }
  }}>
        <DrawerHeader>
          <IconButton >
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          
            <ListItem  disablePadding sx={{ display: 'block' }} onClick={()=>{navigate('/')}}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                <DashboardIcon style={{ fill: '#ffffff' }}/>
                </ListItemIcon>
                <ListItemText primary="Dashboard" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>

            <ListItem  disablePadding sx={{ display: 'block' }} onClick={()=>{navigate('/bookings')}}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                     
                  }}
                >
                 <EventAvailableIcon style={{ fill: '#ffffff' }}/>
                </ListItemIcon>
                <ListItemText primary="Bookings" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
             
            <ListItem  disablePadding sx={{ display: 'block' }} onClick={()=>{navigate('/plans')}}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                 <LocalOfferIcon style={{ fill: '#ffffff' }}/>
                </ListItemIcon>
                <ListItemText primary="Plans" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
             
            <ListItem  disablePadding sx={{ display: 'block' }} onClick={()=>{navigate('/coupons')}}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                 <ConfirmationNumberIcon style={{ fill: '#ffffff' }}/>
                </ListItemIcon>
                <ListItemText primary="Coupons" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>

            <ListItem  disablePadding sx={{ display: 'block' }} onClick={()=>{navigate('/companyprofile')}}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                 <CorporateFareIcon style={{ fill: '#ffffff' }}/>
                </ListItemIcon>
                <ListItemText primary="Company Profile" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
              

              
             { isSuperAdmin && <ListItem  disablePadding sx={{ display: 'block' }} onClick={()=>{navigate('/approval')}}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                 <CorporateFareIcon style={{ fill: '#ffffff' }}/>
                </ListItemIcon>
                <ListItemText primary="Approval" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>}
        </List>
       
      </Drawer>
     
    </Box>
  );
}
