import React, { useEffect, useState } from "react";
import Sidenav from "../components/Sidenav";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Grid,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  DialogActions,
  Button,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import endpoints from "../Endpoints/endpoint";
import DownloadExcel from "../components/DownloadExcel";
import { enGB } from "date-fns/locale";
import { differenceInMonths, subMonths, addMonths, format } from "date-fns";

const drawerWidth = 240;

export default function ReportPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [pageSize, setPageSize] = useState(1000);
  const [currentBooking, setCurrentBooking] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (fromDate && toDate) {
      fetchBookings();
    }
  }, [fromDate, toDate, pageSize]);

  const checkAuth = () => {
    const token = sessionStorage.getItem("jwtToken");
    if (token && token !== "" && token !== null) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
      if (role !== "superadmin") {
        navigate("/");
      }
    } else {
      console.log("Token not Found");
      navigate("/login");
    }
  };
  const page = 1;
  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        `${endpoints.serverBaseURL}/api/admin/bookings/byrange`,
        {
          params: {
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
            pageSize,
            page,
            //date: fromDate,
          },
        }
      );
      console.log("bookings by range", response.data.bookings);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleMenuOpen = (event, booking) => {
    setAnchorEl(event.currentTarget);
    console.log("booking", booking);
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

  const columns = [
    {
      field: "userId",
      headerName: "Name",
      width: 200,
      valueGetter: (params) => params.name || "Unknown",
    },
    {
      field: "planId",
      headerName: "Plan",
      width: 300,
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
          </Menu>
        </>
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

          <LocalizationProvider dateAdapter={AdapterDayjs} locale={enGB}>
            <Grid
              container
              spacing={0.5}
              sx={{ marginBottom: 2 }}
            >
              <Grid item xs={4} sm={4}>
                <DatePicker
                  label="From Date"
                  value={fromDate}
                  inputFormat="dd/MM/yyyy"
                  
                  onChange={(newValue) => setFromDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Grid>
              <Grid item xs={4} sm={4}>
                <DatePicker
                  label="To Date"
                  value={toDate}
                  inputFormat="dd/MM/yyyy"
                  onChange={(newValue) => setToDate(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth size="small" />
                  )}
                />
              </Grid>
              <Grid item xs={4} sm={4}>
                <DownloadExcel bookings={bookings} />
              </Grid>
            </Grid>
          </LocalizationProvider>

          <Box sx={{ height: "69vh", width: "100%" }}>
            <DataGrid
              rows={bookings}
              columns={columns}
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
              rowsPerPageOptions={[5, 10, 20]}
              getRowId={(row) => row._id}
              sx={{ background: "#ffffff" }}
              //autoHeight
            />
          </Box>
        </Box>
      </Box>
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
                        ).toLocaleDateString("en-GB")}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                        Adult
                      </TableCell>
                      <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                        {currentBooking.adult}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                        Children
                      </TableCell>
                      <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                        {currentBooking.children}
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
                    {currentBooking.adminRole === "superadmin" && (
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
    </>
  );
}
