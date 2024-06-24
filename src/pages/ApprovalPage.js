import React, { useState, useEffect } from 'react';
import Sidenav from '../components/Sidenav';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import endpoints from '../Endpoints/endpoint';

const drawerWidth = 240;

export default function ApprovalPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [pageSize, setPageSize] = useState(10); // Default page size
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchBookings();
  }, [page, pageSize, selectedDate]); // Added selectedDate to dependency array

  const checkAuth = () => {
    const token = sessionStorage.getItem('jwtToken');

    if (token && token !== '' && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;

      if (role !== 'superadmin') {
        navigate('/');
      }

    } else {
      console.log('Token not Found');
      navigate('/login');
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${endpoints.serverBaseURL}/api/admin/booking`, {
        params: { page, pageSize, date: selectedDate }
      });
      const complementaryBookings = response.data.bookings.filter(booking => booking?.paymentMethod === 'Complementary');
      setBookings(complementaryBookings);
      setRowCount(response.data.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Error fetching bookings. Please try again later.'); // Set error state
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date.toISOString().split("T")[0]);
    setPage(1); // Reset to first page when date changes
  };

  const columns = [
    {
      field: "userId",
      headerName: "Name",
      width: 250,
      valueGetter: (params) => params?.name || "Unknown",
    },
    //  {
    //    field:'bookingDate',
    //    headerName:'booking Date',
    //    width:150,
    //    valueGetter: (params)=> {return new Date(params.bookingDate).toLocaleDateString("en-GB")}
    //  },
    {
      field: 'complementaryPerson',
      headerName: 'Complementary Person',
      width: 200,
    },
    
      {
        field: "planId",
        headerName: "Plan",
        width: 350,
        valueGetter: (params) => params?.title || "Unknown",
      },
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
          <Typography variant="h6"sx={{mb:'10px'}} gutterBottom>
            Below are people who came via complimentary entries.
          </Typography>

          {/* Date filter */}
          <TextField
            id="selectedDate"
            size='small'
            type="date"
            
            value={selectedDate}
            onChange={(e) => handleDateChange(new Date(e.target.value))}
            sx={{ marginBottom: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* DataGrid */}
          <Box sx={{ height: 350, width: "100%", marginTop: 2 }}>
            <DataGrid
              rows={bookings}
              columns={columns}
              pageSize={pageSize}
              pagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              rowCount={rowCount}
              paginationMode="server"
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              loading={loading}
              getRowId={(row) => row._id}
              error={error}
              sx={{ background: "#f7f5fa" }}
            />
          </Box>

          {/* Dialog for Booking Details */}
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogContent>
              {selectedBooking && (
                <>
                  <Typography>Name: {selectedBooking?.userId.name}</Typography>
                  <Typography>Date: {new Date(selectedBooking.bookingDate).toLocaleDateString("en-GB")}</Typography>
                  <Typography>Complementary Person: {selectedBooking?.complementaryPerson}</Typography>
                  <Typography>Plan: {selectedBooking?.planId.title}</Typography>
                  <Typography>Email: {selectedBooking?.userId.email}</Typography>
                  <Typography>Phone: {selectedBooking?.userId.phone}</Typography>
                  <Typography>GST Number: {selectedBooking?.userId.gstNumber}</Typography>
                  <Typography>Address: {selectedBooking?.userId.address}</Typography>
                  <Typography>Adults: {selectedBooking?.adult}</Typography>
                  <Typography>Children: {selectedBooking?.children}</Typography>
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
