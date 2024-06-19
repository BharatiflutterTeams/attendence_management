import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import endpoints from '../Endpoints/endpoint';
import Sidenav from '../components/Sidenav';
import Navbar from '../components/Navbar';
import AddIcon from '@mui/icons-material/Add';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
const drawerWidth = 240;

export default function CouponsPage() {
  const Navigate = useNavigate();
  const [coupons, setCoupons] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [newCoupon, setNewCoupon] = React.useState({
    coupon_code: '',
    redeem_coupon: '',
    total_coupon: '',
    available_coupon: '',
    discount_percentage: '',
    discount_amount: '',
  });
  const [selectedCoupon, setSelectedCoupon] = React.useState(null);

  React.useEffect(() => {
    fetchCoupons();
    checkAuth()
  }, []);
 
  const checkAuth = ()=>{
    const token = sessionStorage.getItem('jwtToken')

    if( token  && token !== '' && token !== null){
    const decoded = jwtDecode(token);
    const role = decoded.role
    if(role == 'checker'){
      Navigate('/scanner');
    }
   
   }
   else{
      console.log('Token not Found');
      Navigate('/login');
   }
}

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${endpoints.serverBaseURL}/api/coupons`);
      setCoupons(response.data.coupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCoupon(null);
  };

  const handleSave = async () => {
    try {
      if (selectedCoupon) {
        await axios.put(`${endpoints.serverBaseURL}/api/coupons/${selectedCoupon._id}`, newCoupon);
      } else {
        await axios.post('${endpoints.serverBaseURL}/api/coupons', newCoupon);
      }
      fetchCoupons();
      setNewCoupon({
        coupon_code: '',
        redeem_coupon: '',
        //total_coupon: '',
        //available_coupon: '',
        discount_percentage: '',
        discount_amount: '',
      });
      handleClose();
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setNewCoupon(coupon);
    setOpen(true);
  };

  const handleDelete = async (couponId) => {
    try {
      await axios.delete(`${endpoints.serverBaseURL}/api/coupons/${couponId}`);
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewCoupon({ ...newCoupon, [name]: value });
  };

  return (
    <>
    <Navbar/>
    
    <Box sx={{ padding: 2 , display:'flex'}}>
        <Sidenav/>
      <Box component='main' sx={{ flexGrow: 1, mt:5,p:4, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Box sx={{display:'flex', justifyContent:"flex-end" , mb:2}}>
      <Button variant="contained" style={{background:"#263238", textTransform:'none' }} onClick={handleOpen} startIcon={<AddIcon />}>
            Add Coupon
       </Button>
       </Box>
      
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedCoupon ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Fill in the details of the coupon.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Coupon Code"
            fullWidth
            variant="outlined"
            name="coupon_code"
            value={newCoupon.coupon_code}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Redeem Coupon"
            fullWidth
            variant="outlined"
            name="redeem_coupon"
            value={newCoupon.redeem_coupon}
            onChange={handleChange}
          />
          {/* <TextField
            margin="dense"
            label="Total Coupon"
            fullWidth
            variant="outlined"
            name="total_coupon"
            value={newCoupon.total_coupon}
            onChange={handleChange}
          /> */}

          {/* <TextField
            margin="dense"
            label="Available Coupon"
            fullWidth
            variant="outlined"
            name="available_coupon"
            value={newCoupon.available_coupon}
            onChange={handleChange}
          /> */}

          <TextField
            margin="dense"
            label="Discount Percentage"
            fullWidth
            variant="outlined"
            name="discount_percentage"
            value={newCoupon.discount_percentage}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Discount Amount"
            fullWidth
            variant="outlined"
            name="discount_amount"
            value={newCoupon.discount_amount}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ marginTop: 2 }}>
        {coupons.map((coupon, index) => (
          <Card key={index} sx={{ width: '100%', m: 2 }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {coupon.coupon_code}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Redeem Coupon: {coupon.redeem_coupon}<br />
                Total Coupon: {coupon.total_coupon}<br />
                Available Coupon: {coupon.available_coupon}<br />
                Discount Percentage: {coupon.discount_percentage}%<br />
                Discount Amount: ${coupon.discount_amount}<br />
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleEdit(coupon)}>Edit</Button>
              <Button size="small" onClick={() => handleDelete(coupon._id)}>Delete</Button>
            </CardActions>
          </Card>
        ))}
      </Box>
      </Box>
    </Box>
    </>
  );
}
