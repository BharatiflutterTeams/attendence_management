import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Table, TableBody, TableCell, TableContainer, TableRow, Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import endpoints from "../Endpoints/endpoint";
import Sidenav from "../components/Sidenav";
import Navbar from "../components/Navbar";
import AddIcon from "@mui/icons-material/Add";
import Autocomplete from "@mui/material/Autocomplete";
import { ToastContainer, toast } from 'react-toastify';
//import useAuth from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
//import styles from './BookingList.module.css';
const drawerWidth = 240;

export default function BookingPage() {
  const Navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pageSize, setPageSize] = useState(100);
  const [rowCount, setRowCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentBooking, setCurrentBooking] = useState(null);
  const [newBooking, setNewBooking] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    gstNumber: "",
    address: "",
    bookingDate: new Date().toISOString().split("T")[0],
    adult: "",
    children: "",
    paymentMethod: "",
    referenceId: "",
    complementaryPerson: "",
    adultPrice: "",
    childrenPrice: "",
  });

  // const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  // const [toDate, setToDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [plans, setPlans] = useState([]);

  const paymentOptions = ["UPI", "Cash", "Card", "In-house", "Complementary"];
  const complementaryPersons = ["Bharti sir", "Bharti Madam"];
  



  useEffect(() => {
    fetchBookings();
    fetchPlans();
  }, [page, pageSize, selectedDate]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = sessionStorage.getItem("jwtToken");

    if (token && token !== "" && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
      if(role == 'checker'){
        Navigate('/scanner');
      }
      //  if(role !== 'admin' || role !== 'superadmin'){
      //      Navigate('/pagenotfound');
      //  }
    } else {
      console.log("Token not Found");
      Navigate("/login");
    }
  };

  const fetchBookings = async () => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
      Navigate("/login");
    }
    try {
      const response = await axios.get(
        `${endpoints.serverBaseURL}/api/admin/booking`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { page, pageSize, date: selectedDate },
        }
      );
      setBookings(response.data.bookings);
      console.log("bookings", response.data.bookings);
      setRowCount(response.data.total);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${endpoints.serverBaseURL}/api/plan`);
      setPlans(response.data.plan);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  // const handleDateChange = (event) => {
  //   setSelectedDate(event.target.value);
  // };
  const handleDateChange = (event) => {
    const inputDate = event.target.value;
    const today = new Date().toISOString().split("T")[0];
    
    // Check if the entered date is before today
    if (inputDate >= today) {
      setSelectedDate(inputDate);
    } else {
      // Optionally, show an error message or alert to the user
      //alert("Date cannot be before today");
      toast.info("Date cannot be before today",{position:'top-center'})
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(`${endpoints.serverBaseURL}/api/admin/postbooking`, newBooking);
      //setBookings([...bookings, response.data]);
      fetchBookings();
      setRowCount(bookings.length + 1);
      setNewBooking({
        name: "",
        email: "",
        phone: "",
        planId: "",
        gstNumber: "",
        address: "",
        bookingDate: new Date().toISOString().split("T")[0],
        adult: "",
        children: "",
        paymentMethod: "",
        referenceId: "",
        complementaryPerson: "",
        adultPrice: "",
        childrenPrice: "",
      });
      handleClose();
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewBooking({ ...newBooking, [name]: value });
  };

  const handlePlanChange = (event, newValue) => {
    setNewBooking({ ...newBooking, planId: newValue?._id || "" });
  };

  const handlePaymentChange = (event, newValue) => {
    setNewBooking({ ...newBooking, paymentMethod: newValue });
  };



  const handleComplementaryChange = (event, newValue) => {
    setNewBooking({ ...newBooking, complementaryPerson: newValue });
  };

  const handleMenuOpen = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setCurrentBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentBooking(null);
  };

  const handleViewOpen = () => {
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
  };

  const handleEditOpen = () => {
    setEditOpen(true);
    setNewBooking(currentBooking);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleDeleteOpen = () => {
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };
  
   
  const handleFilterChange = (event , newValue)=>{
     // const filterBookings = bookings.filter((booking)=> booking.planId == newValue._id);
      //setBookings(filterBookings);
      
      setSelectedPlan(newValue);

  }

  const handleEditSave = async () => {
    try {
      await axios.put(`${endpoints.serverBaseURL}/api/admin/booking/${currentBooking._id}`, newBooking);
      const updatedBookings = bookings.map((booking) =>
        booking._id === currentBooking._id ? newBooking : booking
      );
      setBookings(updatedBookings);
      handleEditClose();
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${endpoints.serverBaseURL}/api/admin/booking/${currentBooking._id}`);
      const updatedBookings = bookings.filter(
        (booking) => booking._id !== currentBooking._id
      );
      setBookings(updatedBookings);
      setRowCount(updatedBookings.length);
      handleDeleteClose();
    } catch (error) {
      console.error("Error deleting booking:", error);
    }
  };

  const columns = [
    {
      field: "userId",
      headerName: "Name",
      width: 200,
      valueGetter: (params) => params?.name || "Unknown",
    },
    {
      field: "planId",
      headerName: "Plan",
      width: 500,
      valueGetter: (params) => params?.title || "Unknown",
    },
    { field: "adult", headerName: "Adult", width: 100 },
    { field: "children", headerName: "Children", width: 100 },
    {
      field: "bookingDate",
      headerName: "Booking Date",
      width: 150,
      valueGetter: (params) => new Date(params).toLocaleDateString("en-GB"),
    },
    //{ field: 'paymentMethod', headerName: 'Payment Method', width: 150 },

    //{ field: 'status', headerName: 'Status', width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <>
          <IconButton onClick={(event) => handleMenuOpen(event, params.row)}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && currentBooking === params.row}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleViewOpen}>View details</MenuItem>
            {/* <MenuItem onClick={handleEditOpen}>Edit</MenuItem>
            <MenuItem onClick={handleDeleteOpen}>Delete</MenuItem> */}
          </Menu>
        </>
      ),
    },
  ];
 // const today = new Date().toDateString().split("T")[0];


 //form validation ************************************//

 const validate = () => {
  const newErrors = {};
  if(!newBooking.name){
    newErrors.name = "Name is Invalid";
  }
  if (newBooking.email && !/\S+@\S+\.\S+/.test(newBooking.email)) {
    newErrors.email = 'Email is invalid';
  }
  if (newBooking.phone && (newBooking.phone.length < 10 || newBooking.phone.length > 15)) {
    newErrors.phone = 'Phone number must be between 10 and 15 digits';
  }
  if (newBooking.paymentMethod === 'In-house' && !newBooking.referenceId) {
    newErrors.referenceId = 'Reference ID is required for In-house payment';
  }
  if (newBooking.paymentMethod === 'Complementary' && !newBooking.complementaryPerson) {
    newErrors.complementaryPerson = 'Complementary person is required';
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSaveClick = () => {
  if (validate()) {
    handleSave();
  }
};

//****************************************************** */




 const filteredBookings = selectedPlan
 ? bookings.filter((booking) => booking.planId?._id == selectedPlan?._id)
 : bookings;
  console.log( "filteredBookings ",filteredBookings);
  console.log("selectedPlan" , selectedPlan)
  
  return (
    <>
      <ToastContainer/>
      <Navbar />
      <Box sx={{ display: "flex" }}>
        <Sidenav />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 5,
            p: 4,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          {/* Date filter card */}
          <Box >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {/* <Typography variant="h6" sx={{ mr: 2 }}>
                  Date:
                </Typography> */}
                <TextField
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  inputProps={{
                    min: new Date().toISOString().split("T")[0],
                  }}
                  size="small"
                />
            

              <Autocomplete
                  options={plans}
                  getOptionLabel={(option) => option.title}
                  onChange={handleFilterChange}
                  value={selectedPlan?.title}
                  size="small"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by Plan"
                      variant="outlined"
                      sx={{ width: 300, ml: 3 }}
                    />
                  )}
                />
                 </div>
              <Button
                variant="contained"
                style={{ background: "#ffffff",color: '#867AE9', textTransform: "none", fontWeight:'bold' }}
                onClick={handleOpen}
                startIcon={<AddIcon />}
              >
                Add Booking
              </Button>
            </CardContent>
          </Box>

          {/* ADD booking form */}
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle sx={{ background: "#867AE9", color: "white" }}>
              Add Booking
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Fill in the details of the booking.
              </DialogContentText>
              <TextField
                autoFocus
                required
                margin="dense"
                label="Name"
                fullWidth
                variant="outlined"
                name="name"
                value={newBooking.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
              <TextField
                margin="dense"
                required
                label="Email"
                fullWidth
                variant="outlined"
                name="email"
                type="email"
                value={newBooking.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                margin="dense"
                label="Phone"
                required
                fullWidth
                variant="outlined"
                name="phone"
                type="number"
                value={newBooking.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
              />

              <Autocomplete
                options={plans}
                getOptionLabel={(option) => option.title}
                value={
                  plans.find((plan) => plan._id === newBooking.planId) || null
                }
                onChange={handlePlanChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Plan"
                    margin="dense"
                    fullWidth
                    required
                  />
                )}
              />

              <TextField
                margin="dense"
                label="GST Number"
                fullWidth
                variant="outlined"
                name="gstNumber"
                value={newBooking.gstNumber}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Address"
                required
                fullWidth
                variant="outlined"
                name="address"
                value={newBooking.address}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Booking Date"
                required
                type="date"
                fullWidth
                variant="outlined"
                name="bookingDate"
                value={newBooking.bookingDate}
                onChange={(e)=>{
                        const today = new Date().toISOString().split("T")[0]
                        if(e.target.value >= today ){
                        handleChange(e)}
                         else{
                           toast.warn("Past Date is not Allowed for Booking")
                         }
                      }}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split("T")[0],
                }}
              />
              <TextField
                margin="dense"
                label="Adults"
                required
                fullWidth
                variant="outlined"
                name="adult"
                type="number"
                value={newBooking.adult}
                onChange={handleChange}
              />
               <TextField
                margin="dense"
                label="Adult Price"
                required
                fullWidth
                variant="outlined"
                name="adultPrice"
                type="number"
                value={newBooking.adultPrice}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Children"
                required
                fullWidth
                variant="outlined"
                name="children"
                type="number"
                value={newBooking.children}
                onChange={handleChange}
              />
               <TextField
                margin="dense"
                label="Children Price"
                required
                fullWidth
                variant="outlined"
                name="childrenPrice"
                type="number"
                value={newBooking.childrenPrice}
                onChange={handleChange}
              />

              <Autocomplete
                options={paymentOptions}
                getOptionLabel={(option) => option}
                fullWidth
                value={newBooking.paymentMethod}
                onChange={handlePaymentChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Payment Method"
                    margin="dense"
                    fullWidth
                    required
                  />
                )}
              />

              {newBooking.paymentMethod === "In-house" && (
                <TextField
                  margin="dense"
                  name="referenceId"
                  label="Reference ID"
                  type="text"
                  fullWidth
                  value={newBooking.referenceId}
                  onChange={handleChange}
                  error={!!errors.referenceId}
                  helperText={errors.referenceId}
                />
              )}
              {newBooking.paymentMethod === "Complementary" && (
                <Autocomplete
                  options={complementaryPersons}
                  getOptionsLabel={(option) => option}
                  fullWidth
                  value={newBooking.complementaryPerson}
                  onChange={handleComplementaryChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Complementary Person"
                      margin="dense"
                      fullWidth
                      error={!!errors.complementaryPerson}
                      helperText={errors.complementaryPerson}
                    />
                  )}
                />
              )}
            </DialogContent>

            <DialogActions>
              <Button
                onClick={handleClose}
                variant="contained"
                style={{ background: "#686D76", textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveClick}
                variant="contained"
                style={{ background: "#867AE9", textTransform: "none" }}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
     

       {/* view booking section */}
          <Dialog open={viewOpen} onClose={handleViewClose} fullWidth maxWidth="sm">
    <DialogTitle style={{ backgroundColor: "#263238", color: "white" }}>
      View Booking Details
    </DialogTitle>
    <DialogContent>
      {currentBooking && (
        <>
          {currentBooking.plan && (
            <div
              style={{
                height: "10px",
                backgroundColor:
                  currentBooking.plan === "Gold"
                    ? "yellow"
                    : currentBooking.plan === "Jumbo"
                    ? "orange"
                    : "transparent",
                marginBottom: "10px",
              }}
            />
          )}

          <Typography variant="h6" style={{ marginBottom: "10px", color: "#37474F" }}>
            Personal Information
          </Typography>
          <TableContainer component={Paper} style={{ marginBottom: "20px" }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>Name</TableCell>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>{currentBooking.userId.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>Email</TableCell>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>{currentBooking.userId.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>Phone</TableCell>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>{currentBooking.userId.phone}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>GST Number</TableCell>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>{currentBooking.userId.gstNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>Address</TableCell>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>{currentBooking.userId.address}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" style={{ marginBottom: "10px", color: "#37474F" }}>
            Booking Information
          </Typography>
          <TableContainer component={Paper} style={{ marginBottom: "20px" }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>Booking Date</TableCell>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                    {new Date(currentBooking.bookingDate).toLocaleDateString("en-GB")}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>Adults</TableCell>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>{currentBooking.adult}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>Children</TableCell>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>{currentBooking.children}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>Plan</TableCell>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>{currentBooking.planId?.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>Adult Price</TableCell>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>₹{currentBooking.adultPrice}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>Children Price</TableCell>
                  <TableCell  style={{ backgroundColor: "#f5f5f5" }}>₹{currentBooking.childrenPrice}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" style={{ marginBottom: "10px", color: "#37474F" }}>
            Payment & Status
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>Payment Method</TableCell>
                  <TableCell style={{ backgroundColor: "#e0e0e0" }}>{currentBooking.paymentMethod}</TableCell>
                </TableRow>
                {/* <TableRow>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>Status</TableCell>
                  <TableCell style={{ backgroundColor: "#f5f5f5" }}>{currentBooking.status}</TableCell>
                </TableRow> */}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={handleViewClose} variant="contained" style={{ backgroundColor: "#263238", color: "white" }}>
        Close
      </Button>
    </DialogActions>
  </Dialog>

          <Dialog open={editOpen} onClose={handleEditClose}>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Name"
                fullWidth
                variant="outlined"
                name="name"
                value={newBooking.name}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Email"
                fullWidth
                variant="outlined"
                name="email"
                value={newBooking.email}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Phone"
                fullWidth
                variant="outlined"
                name="phone"
                value={newBooking.phone}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="GST Number"
                fullWidth
                variant="outlined"
                name="gstNumber"
                value={newBooking.gstNumber}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Address"
                fullWidth
                variant="outlined"
                name="address"
                value={newBooking.address}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Booking Date"
                type="date"
                fullWidth
                variant="outlined"
                name="bookingDate"
                value={newBooking.bookingDate}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                margin="dense"
                label="Adults"
                fullWidth
                variant="outlined"
                name="adult"
                value={newBooking.adult}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Children"
                fullWidth
                variant="outlined"
                name="children"
                value={newBooking.children}
                onChange={handleChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleEditSave} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={deleteOpen} onClose={handleDeleteClose}>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this booking?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDeleteClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDelete} color="primary">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Box sx={{ height: '69vh', width: "100%" }}>
            <DataGrid
              rows={filteredBookings}
              columns={columns}
              pageSize={pageSize}
              pagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              rowCount={rowCount}
              paginationMode="server"
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              getRowId={(row) => row._id}
              sx={{ background: "#f7f5fa" }}
              //getRowId={(row) => row._id}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}
