import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import { useState } from 'react';

import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import { Typography } from '@mui/material';
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
import useAppStore from '../appStore'
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';

//Add agent role

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
  const companyData = useAppStore(state=>state.companyData);
  const theme = useTheme();
  const [isSuperAdmin , setisSuperAdmin] = useState(false);
  const [isAgent , setAgent] = useState(false);
console.log("isAgent",isAgent);

  //const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();
  
  const open = useAppStore((state)=>state.dopen);

  
  
  React.useEffect(()=>{roleCheck()},[])

  let role = '';
  const roleCheck = async () => {
    const token = sessionStorage.getItem('jwtToken');
    if (token && token !== '' && token !== null) {
      const decoded = jwtDecode(token);
      role = decoded.role;
      //console.log('sidenav', role);
  
      if (role === 'superadmin') {
        setisSuperAdmin(true);
      } else if (role === 'agent') {
        setAgent(true);  // Set agent state when role is 'agent'
      }
    }
  };
  
   
   

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        open={open}
        PaperProps={{
          sx: {
            backgroundColor: "#ffffff",
            color: "black",
          },
        }}
      >
        <DrawerHeader>
          <IconButton>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />

        {/* Company Data Section */}
{open && companyData && (
  <Box sx={{ px: 2, py: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <img src={companyData.logo} alt="Company Logo" width="50" height="50" style={{ borderRadius: '50%', marginRight: '12px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }} />
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>{companyData.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/companyprofile" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center' ,  }}>
              Profile 
              <Box component="span" sx={{ ml: 0, mt:1 }}>
                <ChevronRightIcon style={{ fontSize: '1rem' }} />
              </Box>
            </Typography>
          </Link>
        </Box>
      </Box>
    </Box>
    <Divider/>
  </Box>
)}


        <List>
          <ListItem
            disablePadding
            sx={{ display: "block" }}
            onClick={() => {
              navigate("/");
            }}
          >
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <DashboardIcon style={{ fill: "#867AE9" }} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>



          {/* <ListItem
            disablePadding
            sx={{ display: "block" }}
            onClick={() => {
              navigate("/bookings");
            }}
          >
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <EventAvailableIcon style={{ fill: "#867AE9" }} />
              </ListItemIcon>
              <ListItemText primary="Bookings" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem> */}


          <ListItem
            disablePadding
            sx={{ display: "block" }}
            onClick={() => {
              navigate("/attendence");
            }}
          >
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <EventAvailableIcon style={{ fill: "#867AE9" }} />
              </ListItemIcon>
              <ListItemText primary="Attendence" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>


          {/* { isSuperAdmin &&(<ListItem
            disablePadding
            sx={{ display: "block" }}
            onClick={() => {
              navigate("/attendence");
            }}
          >
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <CorporateFareIcon style={{ fill: "#867AE9" }} />
              </ListItemIcon>
              <ListItemText
                primary="Attendence"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>)} */}

          
          {/* {!isAgent && (
        <>
          <ListItem
            disablePadding
            sx={{ display: "block" }}
            onClick={() => {
              navigate("/plans");
            }}
          >
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <LocalOfferIcon style={{ fill: "#867AE9" }} />
              </ListItemIcon>
              <ListItemText primary="Plans" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>

          <ListItem
            disablePadding
            sx={{ display: "block" }}
            onClick={() => {
              navigate("/coupons");
            }}
          >
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <ConfirmationNumberIcon style={{ fill: "#867AE9" }} />
              </ListItemIcon>
              <ListItemText primary="Coupons" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </>
      )}
     */}
           
          { isSuperAdmin &&(<ListItem
            disablePadding
            sx={{ display: "block" }}
            onClick={() => {
              navigate("/reportpage");
            }}
          >
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <CorporateFareIcon style={{ fill: "#867AE9" }} />
              </ListItemIcon>
              <ListItemText
                primary="Reports"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>)}



         { isSuperAdmin &&(<ListItem
            disablePadding
            sx={{ display: "block" }}
            onClick={() => {
              navigate("/companyprofile");
            }}
          >
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <CorporateFareIcon style={{ fill: "#867AE9" }} />
              </ListItemIcon>
              <ListItemText
                primary="Company Profile"
                sx={{ opacity: open ? 1 : 0 }}
              />
            </ListItemButton>
          </ListItem>)}

          {/* {isSuperAdmin && (
            <ListItem
              disablePadding
              sx={{ display: "block" }}
              onClick={() => {
                navigate("/approval");
              }}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <VerifiedUserIcon style={{ fill: "#867AE9" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Approval"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          )} */}
           
           {isSuperAdmin && (
            <ListItem
              disablePadding
              sx={{ display: "block" }}
              onClick={() => {
                navigate("/addadminchecker");
              }}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  <SupervisorAccountIcon style={{ fill: "#867AE9" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Manage Roles"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>

            
          )}
        </List>
      </Drawer>
    </Box>
  );
}
