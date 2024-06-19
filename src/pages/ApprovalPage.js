import React from 'react'
import { useState , useEffect } from 'react';
import Sidenav from '../components/Sidenav'
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar';
import Navbar from '../components/Navbar';
import axios from 'axios';
import {  Button, Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import endpoints from '../Endpoints/endpoint';
const drawerWidth = 240;

export default function ApprovalPage() {
    const Navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [open, setOpen] = useState(false);
  
    useEffect(() => {
      checkAuth();
      const fetchBookings = async () => {
        try {
          const response = await axios.get(`${endpoints.serverBaseURL}/api/bookings`);
         const complementaryBookings = response.data.filter(booking => booking?.paymentMethod === 'complementary');
        setBookings(complementaryBookings);
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      };
      fetchBookings();
       
    }, []);
   
   
    const checkAuth = ()=>{
      const token = sessionStorage.getItem('jwtToken')

      if( token  && token !== '' && token !== null){
      const decoded = jwtDecode(token);
      const role = decoded.role
      
      if( role !== 'superadmin'){
          Navigate('/');
      }
      
     }
     else{
        console.log('Token not Found');
        Navigate('/login');
     }
  }
    const handleViewDetails = (booking) => {
      setSelectedBooking(booking);
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };
  
    const columns = [
      { field: 'name', headerName: 'Name', width: 150 },
      { field: 'date', headerName: 'Date', width: 150 },
      { field: 'complementaryPerson', headerName: 'Complementary Person', width: 200 },
      { field: 'plan', headerName: 'Plan', width: 150 },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        renderCell: (params) => (
          <Button onClick={() => handleViewDetails(params?.row)} color="primary">
            View Details
          </Button>
        ),
      },
    ];

  return (
    <>
      <Navbar />
      <Box sx={{ display: "flex" }}>
        <Sidenav />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          <h1>Below are people who came via complimentary entries.</h1>

          <Box sx={{ height: 400, width: "100%", marginTop: 2 }}>
            <DataGrid
              rows={bookings}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              pagination
            />
          </Box>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogContent>
              {selectedBooking && (
                <>
                  <Typography>Name: {selectedBooking?.name}</Typography>
                  <Typography>Date: {selectedBooking?.date}</Typography>
                  <Typography>
                    Complementary Person: {selectedBooking?.complementaryPerson}
                  </Typography>
                  <Typography>Plan: {selectedBooking?.plan}</Typography>
                
                  <Typography>Email: {selectedBooking.email}</Typography>
                  <Typography>Phone: {selectedBooking?.phone}</Typography>
                  <Typography>
                    GST Number: {selectedBooking.gstNumber}
                  </Typography>
                  <Typography>Address: {selectedBooking.address}</Typography>
                  <Typography>
                    Booking Date:{" "}
                    {new Date(selectedBooking.bookingDate).toLocaleDateString()}
                  </Typography>
                  <Typography>Adults: {selectedBooking.adult}</Typography>
                  <Typography>Children: {selectedBooking.children}</Typography>
                 
                
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </>
  );
}
