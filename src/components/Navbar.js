import * as React from 'react';
import { useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import Link from '@mui/material/Link';

import AccountCircle from '@mui/icons-material/AccountCircle';

import NotificationsIcon from '@mui/icons-material/Notifications';
import { Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';
import useAppStore from '../appStore'
import { useNavigate } from 'react-router-dom';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
//import { useAuthStore } from '../appStore';

const AppBar = styled(MuiAppBar, {
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  
}));







export default function Navbar() {
  const companyData = useAppStore(state=>state.companyData);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const updateOpen = useAppStore((state)=>state.updateOpen);
  const dopen = useAppStore((state)=>state.dopen);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
 // const clearToken = useAuthStore((state) => state.clearToken);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };  
  
  
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };
  
const handleLogout=()=>{
  sessionStorage.clear();
   // clearToken();
    navigate('/login');
} 
  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
      <Chip
        icon={<ContactSupportIcon />}
        label="Support"
        onClick={handleOpen}
        clickable
        color="primary"
        variant="outlined"
      />
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1}}>
      <AppBar position="fixed" sx={{backgroundColor:"#867AE9"}}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="white"
            
            aria-label="open drawer"
            sx={{ mr: 2 , color : 'white'}}
            onClick={()=>{updateOpen(!dopen)}}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center'}}>
      <img src={companyData?.logo} alt="Company Logo" width="30" height="30" style={{  background : 'white', borderRadius: '50%', marginRight: '12px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }} />
           </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block', color:'white' } }}
          >
            {companyData?.name}
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            
            {/* <IconButton
              size="large"
              aria-label="show 17 new notifications"
              color="black"
            >
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton> */}
         <Chip
        icon={<ContactSupportIcon color='#ffff' />}
        label="Support"
        onClick={handleOpen}
        
        clickable
        sx={{color:'white' , mt:'0.5rem'}}
        variant="outlined"
          />
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{color:'white'}}
            >
              <AccountCircle />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}

       {/*******************support dialog *******************************************/}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{color:"white", background:'#867AE9'}}>Contact Support</DialogTitle>

<DialogContent sx={{ mt: "1rem" }}>
  <DialogContentText>
    <h3>For assistance, contact us at:</h3>
    <br />
    <Link
      href="tel:9368303030"
      sx={{ display: "flex", alignItems: "center", textDecoration: "none", mt: 1 }}
      color="inherit"
    >
      <PhoneIcon sx={{ mr: 1 }} />
      9368303030
    </Link>
    <br />
    <Link
      href="mailto:support@bhartisofttech.com"
      sx={{ display: "flex", alignItems: "center", textDecoration: "none", mt: 1 }}
      color="inherit"
    >
      <EmailIcon sx={{ mr: 1 }} />
      support@bhartisofttech.com
    </Link>
  </DialogContentText>
</DialogContent>;

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
