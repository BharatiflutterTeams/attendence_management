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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import Sidenav from "../components/Sidenav";
import Navbar from "../components/Navbar";
import AddIcon from "@mui/icons-material/Add";
import Autocomplete from "@mui/material/Autocomplete";
import useAuth from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
const drawerWidth = 240;
// import styled from "";
export default function BookingPage() {
  const Navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [rowCount, setRowCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [newBooking, setNewBooking] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    gstNumber: "",
    address: "",
    bookingDate: "",
    adult: "",
    children: "",
    PaymentMethod: "",
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
  const complementaryPersons = ["Bharti sir", "Sagar Sir"];

  useEffect(() => {
    fetchBookings();
    fetchPlans();
  }, [page, pageSize, selectedDate]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("jwtToken");

    if (token && token !== "" && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;

      //  if(role !== 'admin' || role !== 'superadmin'){
      //      Navigate('/pagenotfound');
      //  }
    } else {
      console.log("Token not Found");
      Navigate("/login");
    }
  };

  const fetchBookings = async () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      Navigate("/login");
    }
    try {
      const response = await axios.get(
        "http://localhost:8000/api/admin/booking",
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
      const response = await axios.get("http://localhost:8000/api/plan");
      setPlans(response.data.plan);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post("/api/bookings", newBooking);
      setBookings([...bookings, response.data]);
      setRowCount(bookings.length + 1);
      setNewBooking({
        name: "",
        email: "",
        phone: "",
        planId: "",
        gstNumber: "",
        address: "",
        bookingDate: "",
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

  const handleEditSave = async () => {
    try {
      await axios.put(`/api/admin/booking/${currentBooking._id}`, newBooking);
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
      await axios.delete(`/api/admin/booking/${currentBooking._id}`);
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
      width: 150,
      valueGetter: (params) => params?.name || "Unknown",
    },
    {
      field: "planId",
      headerName: "Plan",
      width: 400,
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
  const today = new Date().toDateString().split("T")[0];
  return (
    <>
      <Navbar />
      <Box sx={{ padding: 2, display: "flex" }}>
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
          <Card sx={{ mb: 3, mt: 3, display: "flex", alignItems: "center" }}>
            <CardContent sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h6" sx={{ mr: 2, display: "flex" }}>
                Select Date to See Bookings:
              </Typography>
              <TextField
                id="date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                inputProps={{
                  min: new Date().toISOString().split("T")[0],
                }}
                sx={{ display: "flex" }}
              />
             
            <Button
              variant="contained"
              style={{ background: "#263238", textTransform: "none"  }}
              onClick={handleOpen}
              startIcon={<AddIcon />}
            >
              Add Booking
            </Button>
          
            </CardContent>
          </Card>

          {/* ADD booking form */}
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add Booking</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Fill in the details of the booking.
              </DialogContentText>
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
                type="email"
                value={newBooking.email}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Phone"
                fullWidth
                variant="outlined"
                name="phone"
                type="number"
                value={newBooking.phone}
                onChange={handleChange}
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
                type="number"
                value={newBooking.adult}
                onChange={handleChange}
              />
              <TextField
                margin="dense"
                label="Children"
                fullWidth
                variant="outlined"
                name="children"
                type="number"
                value={newBooking.children}
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
                    />
                  )}
                />
              )}
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

          <Dialog open={viewOpen} onClose={handleViewClose}>
            <DialogTitle>View Booking Details</DialogTitle>
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

                  <Typography>Name: {currentBooking.userId.name}</Typography>
                  <Typography>Email: {currentBooking.userId.email}</Typography>
                  <Typography>Phone: {currentBooking.userId.phone}</Typography>
                  <Typography>
                    GST Number: {currentBooking.userId.gstNumber}
                  </Typography>
                  <Typography>
                    Address: {currentBooking.userId.address}
                  </Typography>
                  <Typography>
                    Booking Date:{" "}
                    {new Date(currentBooking.bookingDate).toLocaleDateString(
                      "en-GB"
                    )}
                  </Typography>
                  <Typography>Adults: {currentBooking.adult}</Typography>
                  <Typography>Children: {currentBooking.children}</Typography>
                  <Typography>Plan: {currentBooking.planId?.title}</Typography>
                  <Typography>
                    Adult Price:₹{currentBooking.adultPrice}
                  </Typography>
                  <Typography>
                    Children Price:₹{currentBooking.childrenPrice}
                  </Typography>
                  <Typography>
                    Payment Mode: {currentBooking.paymentMode}
                  </Typography>
                  <Typography>Status: {currentBooking.status}</Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleViewClose} color="primary">
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

          <Box sx={{ height: 400, width: "100%", marginTop: 2 }}>
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
              getRowId={(row) => row._id}
              sx={{ background: "#EEEEEE" }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}
