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
    const [bookings, setBookings] = useState([
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '123-456-7890',
          gstNumber: '27AAAPL1234C1ZQ',
          address: '123 Main St, Springfield, IL 62701',
          bookingDate: '2024-06-15',
          adult: 1,
          children: 0,
          paymentMethod: 'complementary',
          referenceId: '',
          complementaryPerson: 'Bharti sir'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '987-654-3210',
          gstNumber: '07AAACP1234B1ZC',
          address: '456 Elm St, Metropolis, IL 62960',
          bookingDate: '2024-07-20',
          adult: 1,
          children: 0,
          paymentMethod: 'complementary',
          referenceId: '',
          complementaryPerson: 'Sagar sir'
        },
        {
          id: 3,
          name: 'Alice Johnson',
          email: 'alice.johnson@example.com',
          phone: '555-123-4567',
          gstNumber: '19AAACR1234F1ZX',
          address: '789 Oak St, Gotham, IL 60007',
          bookingDate: '2024-08-05',
          adult: 1,
          children: 0,
          paymentMethod: 'complementary',
          referenceId: '',
          complementaryPerson: 'Bharti sir'
        },
        {
          id: 4,
          name: 'Bob Brown',
          email: 'bob.brown@example.com',
          phone: '111-222-3333',
          gstNumber: '22AAACD1234G1ZM',
          address: '101 Maple St, Smallville, IL 60901',
          bookingDate: '2024-09-10',
          adult: 1,
          children: 0,
          paymentMethod: 'complementary',
          referenceId: '',
          complementaryPerson: 'Sagar sir'
        },
        {
          id: 5,
          name: 'Cathy Green',
          email: 'cathy.green@example.com',
          phone: '444-555-6666',
          gstNumber: '10AAACE1234H1ZN',
          address: '202 Birch St, Star City, IL 60515',
          bookingDate: '2024-10-25',
          adult: 1,
          children: 0,
          paymentMethod: 'complementary',
          referenceId: '',
          complementaryPerson: 'Bharti sir'
        }
      ]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [open, setOpen] = useState(false);
  
    useEffect(() => {
      checkAuth();
      const fetchBookings = async () => {
        try {
          const response = await axios.get(`${endpoints.serverBaseURL}/api/bookings`);
         const complementaryBookings = response.data.filter(booking => booking.paymentMethod === 'complementary');
        setBookings(complementaryBookings);
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      };
      fetchBookings();
       
    }, []);
   
   
    const checkAuth = ()=>{
      const token = localStorage.getItem('jwtToken')

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
          <Button onClick={() => handleViewDetails(params.row)} color="primary">
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
                  <Typography>Name: {selectedBooking.name}</Typography>
                  <Typography>Date: {selectedBooking.date}</Typography>
                  <Typography>
                    Complementary Person: {selectedBooking.complementaryPerson}
                  </Typography>
                  <Typography>Plan: {selectedBooking.plan}</Typography>
                
                  <Typography>Email: {selectedBooking.email}</Typography>
                  <Typography>Phone: {selectedBooking.phone}</Typography>
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
