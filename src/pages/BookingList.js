import React, { useState, useEffect, useRef } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import { DataGrid }  from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import endpoints from "../Endpoints/endpoint";
import Sidenav from "../components/Sidenav";
import Navbar from "../components/Navbar";
import AddIcon from "@mui/icons-material/Add";
import Autocomplete from "@mui/material/Autocomplete";
import { ToastContainer, toast } from "react-toastify";
//import useAuth from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useAppStore from "../appStore";
import Preloader from "../components/Preloader";
import RemoveIcon from "@mui/icons-material/Remove";
import ReactToPrint from "react-to-print";
import PrintComponent from "../components/PrintComponent";
import DownloadExcel from "../components/DownloadExcel";
import styles from "./BookingList.module.css";

import ChildCareIcon from "@mui/icons-material/ChildCare";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const drawerWidth = 240;

export default function BookingPage() {
  const Navigate = useNavigate();
  const companyData = useAppStore((state) => state.companyData);
  const setRowData = useAppStore((state) => state.setRowData);
  const componentRef = useRef();
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pageSize, setPageSize] = useState(1000);
  const [rowCount, setRowCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [adminRole, setAdminrole] = useState();
  const [errors, setErrors] = useState({});
  const [currentBooking, setCurrentBooking] = useState(null);
  const [choosePlan, setChoosePlan] = useState({});
  const [totalAdultPrice, setTotalAdultPrice] = useState(0);
  const [totalChildPrice, setTotalChildPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedSubPackageIndex, setSelectedSubPackageIndex] = useState(0);
  const [newBooking, setNewBooking] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    selectedSubPackage: 0,
    gstNumber: "",
    address: "",
    bookingDate: new Date().toISOString().split("T")[0],
    adult: 1,
    children: 0,
    paymentMethod: "",
    referenceId: "",
    complementaryPerson: "",
    adultPrice: "",
    childrenPrice: "",
    upiId: "",
    creditCardNumber: "",
    bookingViaPerson: adminName,
    subpackageName: "",
  });

  // const [fromDate, setFromDate] = useState(new Date().toISOString().split("T")[0]);
  // const [toDate, setToDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [plans, setPlans] = useState([]);

  const paymentOptions = [...companyData?.paymentMethods];
  const complementaryPersons =
    companyData?.complementaryPersons?.map((person) => person.name) || [];
  //console.log("complementary",companyData.complementaryPersons )

  const today = new Date();

  // Calculate the date 7 days ago
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const calculateTotal = (adultCount, childCount) => {
    let adultPrice = 0;
    let childPrice = 0;

    if (choosePlan.subpackages) {
      adultPrice =
        choosePlan?.subpackages[selectedSubPackageIndex]?.adult_price || 0;
      childPrice =
        choosePlan?.subpackages[selectedSubPackageIndex]?.child_price || 0;
    }

    const totalAdultAmount = adultCount * adultPrice;
    const totalChildAmount = childCount * childPrice;

    // Calculate the total amount before GST
    const totalBeforeGST = totalAdultAmount + totalChildAmount;

    // Calculate the GST amount
    const gstAmount = totalBeforeGST * 0.18;

    // Calculate the total amount including GST and round it off
    const totalAmountWithGST = Math.round(totalBeforeGST + gstAmount);

    // Round off individual amounts if needed
    const roundedTotalAdultAmount = Math.round(totalAdultAmount);
    const roundedTotalChildAmount = Math.round(totalChildAmount);

    setTotalAdultPrice(roundedTotalAdultAmount);
    setTotalChildPrice(roundedTotalChildAmount);
    setTotalAmount(totalAmountWithGST);
  };

  useEffect(() => {
    fetchBookings();
    fetchPlans();
    calculateTotal(newBooking.adult, newBooking.children);
  }, [page, pageSize, selectedDate, choosePlan, selectedSubPackageIndex]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = sessionStorage.getItem("jwtToken");

    if (token && token !== "" && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
      if (role == "checker") {
        Navigate("/scanner");
      }
      //  if(role !== 'admin' || role !== 'superadmin'){
      //      Navigate('/pagenotfound');
      //  }
      const adminname = decoded.name;
      setAdminName(adminname);
      setAdminrole(role);
      //console.log("adminName" , adminName);
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setLoading(true);
      alert("Error in loading bookings");
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${endpoints.serverBaseURL}/api/plan`);
      setPlans(response.data.plan);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setLoading(true);
      alert("Error in loading This page");
    }
  };

  //loader****************************//
  if (loading) {
    return <Preloader />;
  }
  //************************************ */

  // const handleDateChange = (event) => {
  //   setSelectedDate(event.target.value);
  // };
  const handleDateChange = (event) => {
    const inputDate = event.target.value;

    // Check if the entered date is before today
    if (inputDate >= sevenDaysAgo.toISOString().split("T")[0]) {
      setSelectedDate(inputDate);
    } else {
      // Optionally, show an error message or alert to the user
      //alert("Date cannot be before today");
      toast.info("Please select a date within the last 7 days.", {
        position: "top-center",
      });
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    const finalBooking = {
      ...newBooking,
      bookingViaPerson: adminName,
      adultPrice: totalAdultPrice,
      childrenPrice: totalChildPrice,
    };
    console.log("finalBooking", finalBooking);
    try {
      const response = await axios.post(
        `${endpoints.serverBaseURL}/api/admin/postbooking`,
        finalBooking
      );
      //setBookings([...bookings, response.data]);
      fetchBookings();
      setRowCount(bookings.length + 1);
      setNewBooking({
        name: "",
        email: "",
        phone: "",
        planId: "",
        selectedSubPackage: 0,
        gstNumber: "",
        address: "",
        bookingDate: new Date().toISOString().split("T")[0],
        adult: 1,
        children: 0,
        paymentMethod: "",
        referenceId: "",
        complementaryPerson: "",
        adultPrice: "",
        childrenPrice: "",
        upiId: "",
        creditCardNumber: "",
        bookingViaPerson: adminName,
        subpackageName: "",
      });
      handleClose();
      toast.success("Booking done Successfully");
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewBooking({ ...newBooking, [name]: value });
  };

  const handleAdultCountChange = (value) => {
    setNewBooking((prev) => {
      const updatedBooking = { ...prev, adult: value };
      calculateTotal(updatedBooking.adult, updatedBooking.children);
      return updatedBooking;
    });
  };

  const handlePlanChange = (event, newValue) => {
    setNewBooking({ ...newBooking, planId: newValue?._id || "" });
    setChoosePlan(newValue);
  };

  const handleChildCountChange = (value) => {
    setNewBooking((prev) => {
      const updatedBooking = { ...prev, children: value };
      calculateTotal(updatedBooking.adult, updatedBooking.children);
      return updatedBooking;
    });
  };

  const handleSubPackageChange = (event, newValue) => {
    if (newValue) {
      const selectedIndex = choosePlan?.subpackages?.findIndex(
        (subpackage) => subpackage.name === newValue.name
      );
      const subpackageName = choosePlan?.subpackages[selectedIndex].name;

      console.log("selected sub package", subpackageName);
      // console.log("slected package", newValue);
      if (subpackageName) {
        setNewBooking({
          ...newBooking,
          selectedSubPackage: selectedIndex,
          subpackageName: subpackageName,
        });
      }

      setSelectedSubPackageIndex(selectedIndex);
    } else {
      setNewBooking({
        ...newBooking,
        selectedSubPackage: 0,
      });
    }
  };

  const handlePaymentChange = (event, newValue) => {
    setNewBooking({ ...newBooking, paymentMethod: newValue });
  };

  const handleComplementaryChange = (event, newValue) => {
    setNewBooking({ ...newBooking, complementaryPerson: newValue });
  };

  const handleMenuOpen = (event, booking) => {
    setAnchorEl(event.currentTarget);
    console.log("anchor" , event.currentTarget);
    setCurrentBooking(booking);
    console.log("current" , booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentBooking(null);
  };
  ///////////Printing logic//////////
  const handlePrintOpen = (row) => {
    setRowData(row);
    // console.log("row", row);
    setTimeout(() => {
      document.getElementById("print-button").click();
    }, 500);
    handleMenuClose();
  };
  ///////////////////////////////////////////
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

  const handleFilterChange = (event, newValue) => {
    // const filterBookings = bookings.filter((booking)=> booking.planId == newValue._id);
    //setBookings(filterBookings);

    setSelectedPlan(newValue);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(
        `${endpoints.serverBaseURL}/api/admin/booking/${currentBooking._id}`,
        newBooking
      );
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
      await axios.delete(
        `${endpoints.serverBaseURL}/api/admin/booking/${currentBooking._id}`
      );
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
      width: 150,
      valueGetter: (params) => params?.title || "Unknown",
    },
    {
      field: "subpackage",
      headerName: "Sub Package",
      width: 250,
      valueGetter: (params) => params || "Unknown",
    },
    {
      field:"franchiseCode",
      headerName : "Ref Code",
      width : 150,
      valueGetter : (params) => params,
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
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleViewOpen}>View Details</MenuItem>
            <MenuItem onClick={() => handlePrintOpen(currentBooking)}>
              Print Details
            </MenuItem>
            {/* <MenuItem onClick={handleEditOpen}>Edit</MenuItem>
            <MenuItem onClick={handleDeleteOpen}>Delete</MenuItem> */}
          </Menu>
          {/* Hidden print button for triggering print */}
          <ReactToPrint
            trigger={() => (
              <button id="print-button" style={{ display: "none" }}>
                Print
              </button>
            )}
            content={() => componentRef.current}
          />

          {/* Hidden PrintComponent */}
          <div style={{ display: "none" }}>
            <PrintComponent ref={componentRef} />
          </div>
        </>
      ),
    },
  ];
  // const today = new Date().toDateString().split("T")[0];

  //form validation ************************************//

  const validate = () => {
    const newErrors = {};
    if (!newBooking.name) {
      newErrors.name = "Name is Invalid";
    }

    if (newBooking.email && !/\S+@\S+\.\S+/.test(newBooking.email)) {
      newErrors.email = "Email is invalid";
    }
    if (
      newBooking.phone &&
      (newBooking.phone.length < 10 || newBooking.phone.length > 15)
    ) {
      newErrors.phone = "Phone number must be between 10 and 15 digits";
    }
    if (newBooking.paymentMethod === "Room Guest" && !newBooking.referenceId) {
      newErrors.referenceId = "Reference ID is required for room guest payment";
    }
    if (
      newBooking.paymentMethod === "Non Chargeable" &&
      !newBooking.complementaryPerson
    ) {
      newErrors.complementaryPerson = "Complementary person is required";
    }

    if (newBooking.paymentMethod === "UPI" && !newBooking.upiId) {
      newErrors.upiId = "UPI ID is Required";
    }
    if (newBooking.paymentMethod === "Card" && !newBooking.creditCardNumber) {
      newErrors.creditCardNumber = "Card Number is required";
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
  const finalBookings = filteredBookings.map((booking)=> ( {...booking, 
                                        subpackage:booking?.planId?.subpackages[booking.selectedSubPackage]?.name}))
   //console.log("finalBookings", finalBookings)
  //console.log("filteredBookings ", filteredBookings);
  //console.log("selectedPlan", selectedPlan);

  return (
    <>
      <ToastContainer />
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
          <Box>
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
                  sx={{ background: "#ffff" }}
                  inputProps={{
                    min: sevenDaysAgo.toISOString().split("T")[0],
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
                      sx={{ width: 300, ml: 3, background: "#ffff" }}
                    />
                  )}
                />
              </div>

              <DownloadExcel bookings={bookings} />
              {/* Download Excel button */}

              <Button
                variant="contained"
                style={{
                  background: "#ffffff",
                  color: "#867AE9",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
                onClick={handleOpen}
                startIcon={<AddIcon />}
              >
                Add Booking
              </Button>
            </CardContent>
          </Box>

          {/* ADD booking form */}
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle
              sx={{
                background: "#867AE9",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h6">Add Booking</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box className={styles.priceBox}>
                  <PersonOutlineIcon sx={{ fontSize: 18, marginRight: 1 }} />
                  <Typography>₹{totalAdultPrice}</Typography>
                </Box>
                <Box className={styles.priceBox}>
                  <ChildCareIcon sx={{ fontSize: 18, marginRight: 1 }} />

                  <Typography>₹{totalChildPrice}</Typography>
                </Box>
                <Box className={styles.totalBox}>
                  <Typography variant="body2">
                    Total:₹ {totalAmount} (Inc.all taxes)
                  </Typography>
                </Box>
              </Box>
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

              <Autocomplete
                options={choosePlan?.subpackages || []}
                getOptionLabel={(option) => option?.name || ""}
                onError={!!errors.selectedSubPackage}
                helperText={errors.selectedSubPackage}
                value={
                  choosePlan?.subpackages?.[newBooking.selectedSubPackage] ||
                  null
                }
                onChange={handleSubPackageChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Sub Package"
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
                onChange={(e) => {
                  const today = new Date().toISOString().split("T")[0];
                  if (e.target.value >= today) {
                    handleChange(e);
                  } else {
                    toast.warn("Past Date is not Allowed for Booking");
                  }
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: new Date().toISOString().split("T")[0],
                }}
              />

              <div>
                <Box className={styles.counterContainer}>
                  <Typography variant="h7" className={styles.counterLabel}>
                    Adults
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                      className={styles.counterButton}
                      onClick={() =>
                        handleAdultCountChange(
                          Math.max(newBooking.adult - 1, 1)
                        )
                      }
                    >
                      <RemoveIcon />
                    </Button>
                    <Typography variant="body1" className={styles.counterValue}>
                      {newBooking.adult || 0}
                    </Typography>
                    <Button
                      className={styles.counterButton}
                      onClick={() =>
                        handleAdultCountChange(newBooking.adult + 1)
                      }
                    >
                      <AddIcon />
                    </Button>
                  </Box>
                </Box>
                <Box className={styles.counterContainer}>
                  <Typography variant="h7" className={styles.counterLabel}>
                    Children
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Button
                      className={styles.counterButton}
                      onClick={() =>
                        handleChildCountChange(
                          Math.max(newBooking.children - 1, 0)
                        )
                      }
                    >
                      <RemoveIcon />
                    </Button>
                    <Typography variant="body1" className={styles.counterValue}>
                      {newBooking.children || 0}
                    </Typography>
                    <Button
                      className={styles.counterButton}
                      onClick={() =>
                        handleChildCountChange(newBooking.children + 1)
                      }
                    >
                      <AddIcon />
                    </Button>
                  </Box>
                </Box>
              </div>

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

              {newBooking.paymentMethod === "Room Guest" && (
                <TextField
                  margin="dense"
                  name="referenceId"
                  label="Reference ID/Room Number"
                  type="text"
                  fullWidth
                  value={newBooking.referenceId}
                  onChange={handleChange}
                  error={!!errors.referenceId}
                  helperText={errors.referenceId}
                />
              )}

              {newBooking.paymentMethod === "UPI" && (
                <TextField
                  margin="dense"
                  name="upiId"
                  label="UPI ID"
                  type="text"
                  fullWidth
                  value={newBooking.upiId}
                  onChange={handleChange}
                  error={!!errors.upiId}
                  helperText={errors.upiId}
                />
              )}

              {newBooking.paymentMethod === "Card" && (
                <TextField
                  margin="dense"
                  name="creditCardNumber"
                  label="RNN Number"
                  type="text"
                  fullWidth
                  value={newBooking.creditCardNumber}
                  onChange={handleChange}
                  error={!!errors.creditCardNumber}
                  helperText={errors.creditCardNumber}
                />
              )}

              {newBooking.paymentMethod === "Non Chargeable" && (
                <Autocomplete
                  options={complementaryPersons}
                  getOptionsLabel={(option) => option}
                  fullWidth
                  value={newBooking.complementaryPerson}
                  onChange={handleComplementaryChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Complementary via Person"
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
          <Dialog
            open={viewOpen}
            onClose={handleViewClose}
            fullWidth
            maxWidth="sm"
          >
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

                  <Typography
                    variant="h6"
                    style={{ marginBottom: "10px", color: "#37474F" }}
                  >
                    Personal Information
                  </Typography>
                  <TableContainer
                    component={Paper}
                    style={{ marginBottom: "20px" }}
                  >
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            Name
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            {currentBooking.userId?.name}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            Email
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            {currentBooking.userId?.email}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            Phone
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            {currentBooking.userId?.phone}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            GST Number
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            {currentBooking.userId?.gstNumber}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            Address
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            {currentBooking.userId?.address}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                          Ref Code
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            {currentBooking.franchiseCode}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography
                    variant="h6"
                    style={{ marginBottom: "10px", color: "#37474F" }}
                  >
                    Booking Information
                  </Typography>
                  <TableContainer
                    component={Paper}
                    style={{ marginBottom: "20px" }}
                  >
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            Booking ID
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            {currentBooking._id}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            Booking Date
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            {new Date(
                              currentBooking.bookingDate
                            )?.toLocaleDateString("en-GB")}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            Adults
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            {currentBooking?.adult}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            Children
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            {currentBooking?.children}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            Plan
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            {currentBooking.planId?.title}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            Sub Package
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            {
                              currentBooking.planId?.subpackages[
                                currentBooking?.selectedSubPackage
                              ].name 
                            }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            Adult Price
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            ₹{currentBooking.adultPrice}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            Children Price
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            ₹{currentBooking.childrenPrice}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            Total Price
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            ₹{currentBooking.totalAmount}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography
                    variant="h6"
                    style={{ marginBottom: "10px", color: "#37474F" }}
                  >
                    Payment & Status
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            Payment Method
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            {currentBooking.paymentMethod
                              ? currentBooking.paymentMethod
                              : "Online Booking"}
                          </TableCell>
                        </TableRow>
                        {currentBooking.upiId && (
                          <TableRow>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              UPI ID
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              {currentBooking.upiId}
                            </TableCell>
                          </TableRow>
                        )}

                        {currentBooking.creditCardNumber && (
                          <TableRow>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              RNN Number
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              {currentBooking.creditCardNumber}
                            </TableCell>
                          </TableRow>
                        )}

                        {currentBooking.referenceId && (
                          <TableRow>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              Reference ID/Room Number
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              {currentBooking.referenceId}
                            </TableCell>
                          </TableRow>
                        )}

                        {currentBooking.complementaryPerson && (
                          <TableRow>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              Approved By
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              {currentBooking.complementaryPerson}
                            </TableCell>
                          </TableRow>
                        )}

                        {adminRole === "superadmin" && (
                          <TableRow>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              Booking done by
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              {currentBooking.bookingViaPerson
                                ? currentBooking.bookingViaPerson
                                : "Atithi booking engine"}
                            </TableCell>
                          </TableRow>
                        )}

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
              <Button
                onClick={handleViewClose}
                variant="contained"
                style={{ backgroundColor: "#263238", color: "white" }}
              >
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

          <Box sx={{ height: "69vh", width: "100%" }}>
            <DataGrid
              rows={finalBookings}
              columns={columns}
              pageSize={pageSize}
              pagination
              rowsPerPageOptions={[5,10,25]}
              rowCount={rowCount}
              paginationMode="client"
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              getRowId={(row) => row._id}
              sx={{ background: "#ffffff" }}
              //getRowId={(row) => row._id}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}
