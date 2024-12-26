import React, { useState, useEffect, useRef, Children } from "react";
import {
  Box,
  Tooltip,
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
  FormHelperText
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
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useAppStore from "../appStore";
import Preloader from "../components/Preloader";
import RemoveIcon from "@mui/icons-material/Remove";
import ReactToPrint from "react-to-print";
import PrintComponent from "../components/PrintComponent";
import DownloadExcel from "../components/DownloadExcel";
import styles from "./BookingList.module.css";
import html2canvas from 'html2canvas';
import ChildCareIcon from "@mui/icons-material/ChildCare";
import HotelIcon from '@mui/icons-material/Hotel'; // Resort symbol
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { jsPDF } from "jspdf";
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
  console.log("Current Booking-------",currentBooking)
  const [isSaving, setIsSaving] = useState(false);
  const [choosePlan, setChoosePlan] = useState({});
  const [totalAdultPrice, setTotalAdultPrice] = useState(0);
  const [totalChildPrice, setTotalChildPrice] = useState(0);
  const [selectedAdultPrice, setSelectedAdultPrice] = useState(0);
  const [selectedChildrenPrice, setSelectedChildrenPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedSubPackageIndex, setSelectedSubPackageIndex] = useState(0);
  const [showAdultWarning, setShowAdultWarning] = useState(false);
  const [showChildrenWarning, setShowChildrenWarning] = useState(false);
  const [newBooking, setNewBooking] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    selectedSubPackage: {},
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
    remark:""
  });
 const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [plans, setPlans] = useState([]);
  const [bookingPlans , setBookingPlans] = useState([]);
  const [showMaxLimitWarning, setShowMaxLimitWarning] = useState(false); 
  const [isInputVisible, setIsInputVisible] = useState(false); 
  const [adultInputValue, setAdultInputValue] = useState(newBooking.adult); 
  const [isInputDisabled, setIsInputDisabled] = useState(false); 
  const [showChildrenMaxLimitWarning, setShowChildrenMaxLimitWarning] = useState(false); 
  const [isChildrenInputVisible, setIsChildrenInputVisible] = useState(false);  
  const [childrenInputValue, setChildrenInputValue] = useState(newBooking.children); 
  const [isChildrenInputDisabled, setIsChildrenInputDisabled] = useState(false); 
  const paymentOptions = [...companyData?.paymentMethods];
  const complementaryPersons =
    companyData?.complementaryPersons?.map((person) => person.name) || [];
  const today = new Date();
 const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
 const calculateTotal = (adultCount, childCount) => {
    let adultPrice = 0;
    let childPrice = 0;
 if (choosePlan?.subpackages) {
      adultPrice =
        choosePlan?.subpackages[selectedSubPackageIndex]?.adult_price < selectedAdultPrice ? selectedAdultPrice : choosePlan?.subpackages[selectedSubPackageIndex]?.adult_price;
      childPrice =
        choosePlan?.subpackages[selectedSubPackageIndex]?.child_price < selectedChildrenPrice ? selectedChildrenPrice : choosePlan?.subpackages[selectedSubPackageIndex]?.child_price ;
    }
    const totalAdultAmount = adultCount * adultPrice;
    const totalChildAmount = childCount * childPrice;
    const totalBeforeGST = totalAdultAmount + totalChildAmount;
    const gstAmount = totalBeforeGST * 0.18;
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
  }, [page, pageSize, selectedDate, choosePlan, selectedSubPackageIndex, selectedAdultPrice,selectedChildrenPrice]);

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
      const adminname = decoded.name;
      setAdminName(adminname);
      setAdminrole(role);
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
      // console.log("bookings", response.data);
      // console.log("Total Booking == ", response.data.total)
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
      let plans = response.data.plan;
      plans = plans?.filter((plan)=> plan.status === 'on');
       setPlans(response.data.plan);
       setBookingPlans(plans);
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
    // Assuming GST is 18% (adjust as needed)
    const gstRate = 0.18;
    
    // Calculate GST
    const gstAmount = (totalAdultPrice + totalChildPrice) * gstRate;
  
    // Calculate total amount (adult + children price + GST)
    const totalAmount = totalAdultPrice + totalChildPrice + gstAmount;
  
    const finalBooking = {
      ...newBooking,
      bookingViaPerson: adminName,
      adultPrice: totalAdultPrice,
      childrenPrice: totalChildPrice,
      totalAmount: totalAmount, // Add totalAmount here
      gstAmount: gstAmount, // Optionally store GST amount
    };
  
    try {
      const response = await axios.post(
        `${endpoints.serverBaseURL}/api/admin/postbooking`,
        finalBooking
      );
      const bookingId = response.data.booking._id;
      const qrResponse = await axios.post(
        `${endpoints.serverBaseURL}/api/generateqr`,
        { text: bookingId }
      );
      const qrCodeURL = qrResponse.data.qrCodeURL;
      console.log("QR Code URL: ", qrCodeURL);
  
      // Generate PDF using jsPDF
      const doc = new jsPDF();
  
      doc.text("Booking Details", 10, 10);
      doc.text(`Name: ${finalBooking.name}`, 10, 20);
      doc.text(`Email: ${finalBooking.email}`, 10, 30);
      doc.text(`Phone: ${finalBooking.phone}`, 10, 40);
      doc.text(`Booking Date: ${finalBooking.bookingDate}`, 10, 50);
      doc.text(`Adult Price: ${finalBooking.adultPrice}`, 10, 60);
      doc.text(`Children Price: ${finalBooking.childrenPrice}`, 10, 70);
      doc.text(`GST Amount: ${finalBooking.gstAmount.toFixed(2)}`, 10, 80); // Display GST
      doc.text(`Total Amount: ${finalBooking.totalAmount.toFixed(2)}`, 10, 90); // Display total amount
  
      const imgData = qrCodeURL;
      doc.addImage(imgData, 'PNG', 10, 100, 50, 50);
  
      const contentHtml = `
        <div id="ticket-container" style="width: 600px; margin: 0 auto; font-family: 'Arial', sans-serif; border: 1px solid #ddd; padding: 30px; background-color: #f0f9ff; border-radius: 15px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
          <h1 style="text-align: center; color: #007BFF; margin-bottom: 20px; font-size: 30px; font-weight: bold;">Resort Booking Confirmation</h1>
          
          <!-- Guest Information Section -->
          <div style="margin-bottom: 25px; background-color: #fff; padding: 15px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);">
            <h3 style="font-size: 25px; color: #333; margin-bottom: 10px;">Guest Information</h3>
            <p style="font-size: 20px; color: #555;"><strong>Name:</strong> ${finalBooking.name}</p>
            <p style="font-size: 20px; color: #555;"><strong>Email:</strong> ${finalBooking.email}</p>
            <p style="font-size: 20px; color: #555;"><strong>Phone:</strong> ${finalBooking.phone}</p>
          </div>
  
          <!-- Booking Details Section -->
          <div style="margin-bottom: 25px; background-color: #fff; padding: 15px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);">
            <h3 style="font-size: 25px; color: #333; margin-bottom: 10px;">Booking Details</h3>
            <p style="font-size: 20px; color: #555;"><strong>Booking Date:</strong> ${finalBooking.bookingDate}</p>
            <p style="font-size: 20px; color: #555;"><strong>Adult Price:</strong> $${finalBooking.adultPrice}</p>
            <p style="font-size: 20px; color: #555;"><strong>Children Price:</strong> $${finalBooking.childrenPrice}</p>
            <p style="font-size: 20px; color: #555;"><strong>GST Amount:</strong> $${finalBooking.gstAmount.toFixed(2)}</p>
            <p style="font-size: 20px; color: #555;"><strong>Total Amount:</strong> $${finalBooking.totalAmount.toFixed(2)}</p>
          </div>
  
          <!-- QR Code Section -->
          <div style="margin-bottom: 25px; text-align: center; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);">
            <h3 style="font-size: 22px; color: #333; margin-bottom: 10px;">QR Code</h3>
            <img src="data:image/png;base64,${qrCodeURL}" alt="QR Code" style="width: 250px; height: 250px; border: 2px solid #007BFF; border-radius: 10px; margin-top: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);" />
          </div>
  
          <!-- Additional Information Section -->
          <div style="text-align: center; background-color: #fff; padding: 15px; border-radius: 10px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1); margin-top: 20px;">
            <p style="font-size: 18px; color: #777;">Thank you for choosing our resort! We look forward to hosting you.</p>
            <p style="font-size: 18px; color: #888;">Booking ID: ${response.data.booking._id}</p>
          </div>
  
          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #888;">
            <p>© 2024 Bharti Resort . All rights reserved.</p>
          </div>
        </div>
      `;
      const ticketContainer = document.createElement('div');
      ticketContainer.innerHTML = contentHtml;
      document.body.appendChild(ticketContainer);
  
      // Use html2canvas to capture the HTML and convert it to an image
      const canvas = await html2canvas(ticketContainer, { scale: 2 });
      const imageBlob = await new Promise((resolve) =>
        canvas.toBlob((blob) => resolve(blob), "image/png")
      );
  
      // Clean up
      document.body.removeChild(ticketContainer);
  
      const imageUrl = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = 'booking-details.png';
      link.click();
  
      // Create FormData to send the image to the server
      const formData = new FormData();
      formData.append("image", imageBlob, "ticket.png");
      formData.append("qrCode", qrCodeURL);
  
      // Add optional extra fields (phone, planId, etc.)
      if (newBooking.phone || newBooking.planId || newBooking.selectedSubPackage) {
        formData.append("phone", newBooking.phone);
        formData.append("Plan", newBooking.planId || "Default Plan");
        formData.append("subpackage", newBooking.selectedSubPackage?.name || "Default SubPackage");
        formData.append("Total amount", finalBooking.totalAmount || 'N/A');
        formData.append("Date", new Date(finalBooking.bookingDate).toLocaleDateString());
        formData.append("Booking ID", response.data.booking._id || 'No ID');
      } else {
        console.error("Phone number is not available");
      }
  
      // Send the formData (image and additional data) to the server
      const serverResponse = await axios.post(
        `${endpoints.serverBaseURL}/api/receive-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      console.log("Response from server:", serverResponse);
  
      if (serverResponse.status === 200) {
        toast.success("Booking done successfully");
      } else {
        console.error("Error sending image and QR code:", serverResponse);
      }
  
      // Optionally fetch bookings and update state
      fetchBookings();
      setRowCount(bookings.length + 1);
  
      // Reset new booking state
      setNewBooking({
        name: "",
        email: "",
        phone: "",
        planId: "",
        selectedSubPackage: {},
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
        remark: ""
      });
  
      // Close modal or booking form
      handleClose();
      return new Promise((resolve) => setTimeout(resolve, 2000));
  
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };


  const sendImageToBackend = async (imageData) => {
    try {
      const response = await axios.post(
        `${endpoints.serverBaseURL}/api/receive-image`,
        {
          image: imageData,
          phone: newBooking.phone,
          Plan: newBooking.planId?.title,
          subpackage: newBooking.selectedSubPackage?.name,
          Date: newBooking.bookingDate,
          'Total amount': totalAdultPrice + totalChildPrice,
          'Booking ID': newBooking.bookingId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("Image sent successfully", response);
    } catch (error) {
      console.error("Error sending image:", error);
    }
  };
  

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewBooking({ ...newBooking, [name]: value });
  };

  const handlePriceChange = (event) => {
    const newValue = event.target.value;
      setSelectedAdultPrice(newValue);
     // Show warning if the new value is less than the minimum required value
     if (newValue && newValue < choosePlan?.subpackages[selectedSubPackageIndex]?.adult_price) {
      setShowAdultWarning(true);
    } else {
      setShowAdultWarning(false);
    }
    // setSelectedAdultPrice(event.target.value);
  };
  const handleChildrenPriceChange = (event) => {
      const childNewValue = event.target.value;
      setSelectedChildrenPrice(childNewValue);
     // Show warning if the new value is less than the minimum required value
     if (childNewValue && childNewValue < choosePlan?.subpackages[selectedSubPackageIndex]?.child_price) {
      setShowChildrenWarning(true);
    } else {
      setShowChildrenWarning(false);
    }
  };
// ---------------------------------------------------------------------------------
const handleAdultCountChange = (value) => {
  // Allow the adult value to go up to a maximum of 50, and not below 1
  if (value > 50) value = 50;
  if (value < 1) value = 1; // Ensure the value doesn't go below 1

  setNewBooking((prev) => {
    const updatedBooking = { ...prev, adult: value };
    calculateTotal(updatedBooking.adult, updatedBooking.children);
    return updatedBooking;
  });
};

const handleInputChange = (event) => {
  setAdultInputValue(event.target.value);
};

const handleInputBlur = () => {
  // Hide the input when user clicks outside or loses focus
  handleAdultInputSubmit(); // Call submit logic when blur happens
};

const handlePlusClick = () => {
  // Show input box for custom value when plus icon is clicked
  setIsInputVisible(true);
  setIsInputDisabled(false); // Enable the input if it's not disabled
};

const handleMinusClick = () => {
  // Decrement adult count but ensure it doesn't go below 1
  if (newBooking.adult > 1) {
    setNewBooking((prev) => {
      const updatedBooking = { ...prev, adult: prev.adult - 1 };
      calculateTotal(updatedBooking.adult, updatedBooking.children);
      return updatedBooking;
    });
    setShowMaxLimitWarning(false); // Hide warning when user decreases count
  }
};

const handleAdultInputSubmit = () => {
  const value = parseInt(adultInputValue, 10);

  if (value > 50) {
    // Show warning if value is greater than 50
    toast.warning("You can add a maximum of 50 adults only.");
    // Keep the input box open
    setIsInputVisible(true); 
    setIsInputDisabled(false); // Keep input enabled if warning is shown
  } else if (value >= 1 && value <= 50) {
    // If value is valid, update the count and close the input box
    handleAdultCountChange(value);
    setIsInputVisible(false); // Close the input box after submission
    setIsInputDisabled(true); // Disable the input after submission
    setShowMaxLimitWarning(false); // Hide warning when valid value is entered
  } else {
    // Handle case when the value is less than 1
    toast.warning("Adult count must be at least 1.");
  }
};


const handleChildCountChange = (value) => {
  if (value > 50) {
    value = 50;
    toast.warning("You cannot add more than 50 children!");  // Show toast warning if limit is exceeded
  }
  if (value < 0) value = 0;  // Ensure value doesn't go below 0

  setNewBooking((prev) => {
    const updatedBooking = { ...prev, children: value };
    calculateTotal(updatedBooking.adult, updatedBooking.children);
    return updatedBooking;
  });
};

const handleChildrenInputChange = (event) => {
  setChildrenInputValue(event.target.value);
};

const handleChildrenInputBlur = () => {
  handleChildrenInputSubmit();  // Call submit logic when blur happens
};

const handleChildrenPlusClick = () => {
  // Show input box for custom value when plus icon is clicked
  setIsChildrenInputVisible(true);
  setIsChildrenInputDisabled(false);  // Enable the input if it's not disabled
};

const handleChildrenMinusClick = () => {
  if (newBooking.children > 0) {
    setNewBooking((prev) => {
      const updatedBooking = { ...prev, children: prev.children - 1 };
      calculateTotal(updatedBooking.adult, updatedBooking.children);
      return updatedBooking;
    });
  }
};

const handleChildrenInputSubmit = () => {
  const value = parseInt(childrenInputValue, 10);

  if (value > 50) {
    // Show warning if value is greater than 50
    toast.warning("You cannot add more than 50 children!");  
    setIsChildrenInputVisible(true);  // Keep input box open
    setIsChildrenInputDisabled(false);  // Keep input enabled if warning is shown
  } else if (value >= 0 && value <= 50) {
    // If value is valid, update the count and close the input box
    handleChildCountChange(value);
    setIsChildrenInputVisible(false);  // Close the input box after valid submission
    setIsChildrenInputDisabled(true);  // Disable the input after valid submission
  } else {
    // Handle case when the value is less than 0
    toast.warning("Children count must be at least 0.");
  }
};

// -------------------------------------------------------------






  const handlePlanChange = (event, newValue) => {
    setNewBooking({ ...newBooking, planId: newValue?._id || "" });
    setChoosePlan(newValue);
  };



  const handleSubPackageChange = (event, newValue) => {
    if (newValue) {
      const selectedIndex = choosePlan?.subpackages?.findIndex(
        (subpackage) => subpackage.name === newValue.name
      );
      const subpackageName = choosePlan?.subpackages[selectedIndex].name;
      const subpackage = choosePlan?.subpackages[selectedIndex];

      console.log("selected sub package", subpackageName);
      // console.log("slected package", newValue);
      if (subpackageName) {
        setNewBooking({
          ...newBooking,
          selectedSubPackage: subpackage,
          subpackageName: subpackageName,
        });
      }

      setSelectedSubPackageIndex(selectedIndex);
    } else {
      setNewBooking({
        ...newBooking,
        selectedSubPackage: choosePlan?.subpackages[0],
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
    // console.log("anchor" , event.currentTarget);
    console.log("Current Booking ----- ",booking)
    setCurrentBooking(booking);
    console.log("After Set Current Booking ----- ",booking)
    // console.log("current" , booking);
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
      console.log("update Booking ------",updatedBookings)
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
   
    { field: "adult", headerName: "Adult", width: 100 },
    { field: "children", headerName: "Children", width: 100 },
    {
      field: "bookingDate",
      headerName: "Reservation Date",
      width: 150,
      valueGetter: (params) => new Date(params).toLocaleDateString("en-GB"),
    },
    {
      field: "createdAt",
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
    {
      field:"franchiseCode",
      headerName : "Ref Code",
      width : 150,
      valueGetter : (params) => params,
    },
    {
      field:"source",
      headerName : "Ref Source",
      width : 150,
      valueGetter : (params) => params,
    },
  ];

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

  // ------------------------------------------------------------
 const handleSaveClick = () => {
    if (validate()) {
      setIsSaving(true); // Disable button
      handleSave()
        .then(() => {
          // After saving completes, re-enable the button if needed
          setIsSaving(false);
        })
        .catch((error) => {
          console.error("Error saving:", error);
          setIsSaving(false); // Re-enable button on error
        });
    }
  };
  

  //****************************************************** */

  const filteredBookings = selectedPlan
    ? bookings.filter((booking) => booking.planId?._id == selectedPlan?._id)
    : bookings;
  const finalBookings = filteredBookings.map((booking)=> ( {...booking, 
                                        subpackage:booking?.selectedSubPackage?.name}))

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


              {/* --------------------------------------------------------------------------------------- */}
              

<Box
  sx={{
    display: "flex",
    justifyContent: "center",  
    alignItems: "center",  
    padding: "10px 20px",  
    background: "#ffffff",
    color: "#867AE9",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",  
    transition: "all 0.3s ease",  
    width: "200px", 
    height: "38px", 
    textAlign: "center",  
    lineHeight: "50px", 
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",  
    '&:hover': {
      boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.3)",  
      transform: "translateY(-2px)", 
    },
    '&:active': {
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",  
      transform: "translateY(0px)",  
    }
  }}
>
  {/* Tooltip will show on hover */}
  <Tooltip
    title={`Adult : ${finalBookings.reduce((total, booking) => total + (booking.adult || 0), 0)}\nChildren : ${finalBookings.reduce((total, booking) => total + (booking.children || 0), 0)}`}
    arrow
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {/* Resort Symbol */}
      <HotelIcon sx={{ fontSize: "20px", color: "#867AE9" }} />
      {/* Show total bookings, including both adults and children */}
      Total Bookings: {finalBookings.reduce((total, booking) => total + (booking.adult || 0) + (booking.children || 0), 0)}
    </Box>
  </Tooltip>
</Box>



              {/* ---------------------------------------------------------------------------------------------- */}
            </CardContent>
          </Box>

          {/* ADD booking form */}
          {/* TODO: add custom price fild  */}
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
                options={bookingPlans}
                getOptionLabel={(option) => option.title}
                value={
                  bookingPlans.find((plan) => plan._id === newBooking.planId) || null
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
                  newBooking.selectedSubPackage ||
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
  {/* <Box className={styles.counterContainer}>
    <Typography variant="h7" className={styles.counterLabel}>
      Adults
    </Typography>
    <TextField
      margin="dense"
      label="Adult Price"
      required
      variant="outlined"
      name="adultprice"
      value={selectedAdultPrice}
      onChange={handlePriceChange}
      disabled={!choosePlan?.subpackages || choosePlan.subpackages.length === 0}  // Disable if no plan is selected
    />
    {showAdultWarning && (
      <FormHelperText error>
        The price should be greater than {choosePlan?.subpackages[selectedSubPackageIndex]?.adult_price}.
      </FormHelperText>
    )}
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Button
        className={styles.counterButton}
        onClick={() => handleAdultCountChange(Math.max(newBooking.adult - 1, 1))}
      >
        <RemoveIcon />
      </Button>
      <Typography variant="body1" className={styles.counterValue}>
        {newBooking.adult || 0}
      </Typography>
      <Button
        className={styles.counterButton}
        onClick={() => handleAdultCountChange(newBooking.adult + 1)}
      >
        <AddIcon />
      </Button>
    </Box>
  </Box> */}


<Box className={styles.counterContainer}>
      <Typography variant="h7" className={styles.counterLabel}>
        Adults
      </Typography>
      <TextField
        margin="dense"
        label="Adult Price"
        required
        variant="outlined"
        name="adultprice"
        value={selectedAdultPrice}
        onChange={handlePriceChange}
        disabled={!choosePlan?.subpackages || choosePlan.subpackages.length === 0}
      />
      {showAdultWarning && (
        <FormHelperText error>
          The price should be greater than {choosePlan?.subpackages[selectedSubPackageIndex]?.adult_price}.
        </FormHelperText>
      )}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button
          className={styles.counterButton}
          onClick={handleMinusClick}
        >
          <RemoveIcon />
        </Button>

        <Typography variant="body1" className={styles.counterValue}>
          {newBooking.adult || 0}
        </Typography>

        <Button
          className={styles.counterButton}
          onClick={handlePlusClick}
        >
          <AddIcon />
        </Button>
      </Box>

      {/* If input box is visible, show the custom input for adult count */}
      {isInputVisible && (
        <Box sx={{ marginTop: 2 }}>
          <TextField
            type="number"
            label="Enter Adult Count"
            value={adultInputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            inputProps={{ min: 1, max: 50 }} // Ensure only valid numbers can be entered
            fullWidth
            disabled={isInputDisabled} // Disable input after submission
          />
          <Button
            onClick={handleAdultInputSubmit}
            sx={{ marginTop: 1 }}
            disabled={isInputDisabled} // Disable submit button after submission
          >
            Submit
          </Button>
        </Box>
      )}

      {/* Display max limit warning */}
      {showMaxLimitWarning && (
        <FormHelperText error>
          You cannot add more than 50 adults.
        </FormHelperText>
      )}
    </Box>
  
  





  
  {/* <Box className={styles.counterContainer}>
    <Typography variant="h7" className={styles.counterLabel}>
      Children
    </Typography>
    <TextField
      margin="dense"
      label="Children Price"
      required
      variant="outlined"
      name="childrenprice"
      value={selectedChildrenPrice}
      onChange={handleChildrenPriceChange}
      disabled={!choosePlan?.subpackages || choosePlan.subpackages.length === 0}  // Disable if no plan is selected
    />
    {showChildrenWarning && (
      <FormHelperText error>
        The price should be greater than {choosePlan?.subpackages[selectedSubPackageIndex]?.child_price}.
      </FormHelperText>
    )}
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Button
        className={styles.counterButton}
        onClick={() => handleChildCountChange(Math.max(newBooking.children - 1, 0))}
      >
        <RemoveIcon />
      </Button>
      <Typography variant="body1" className={styles.counterValue}>
        {newBooking.children || 0}
      </Typography>
      <Button
        className={styles.counterButton}
        onClick={() => handleChildCountChange(newBooking.children + 1)}
      >
        <AddIcon />
      </Button>
    </Box>
  </Box> */}






<Box className={styles.counterContainer}>
      <Typography variant="h7" className={styles.counterLabel}>
        Children
      </Typography>
      <TextField
        margin="dense"
        label="Children Price"
        required
        variant="outlined"
        name="childrenprice"
        value={selectedChildrenPrice}
        onChange={handleChildrenPriceChange}
        disabled={!choosePlan?.subpackages || choosePlan.subpackages.length === 0}
      />
      {showChildrenWarning && (
        <FormHelperText error>
          The price should be greater than {choosePlan?.subpackages[selectedSubPackageIndex]?.child_price}.
        </FormHelperText>
      )}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Button
          className={styles.counterButton}
          onClick={handleChildrenMinusClick}
        >
          <RemoveIcon />
        </Button>

        <Typography variant="body1" className={styles.counterValue}>
          {newBooking.children || 0}
        </Typography>

        <Button
          className={styles.counterButton}
          onClick={handleChildrenPlusClick}
        >
          <AddIcon />
        </Button>
      </Box>

      {/* If input box is visible, show the custom input for children count */}
      {isChildrenInputVisible && (
        <Box sx={{ marginTop: 2 }}>
          <TextField
            type="number"
            label="Enter Children Count"
            value={childrenInputValue}
            onChange={handleChildrenInputChange}
            onBlur={handleChildrenInputBlur}
            inputProps={{ min: 0, max: 50 }} // Ensure only valid numbers can be entered
            fullWidth
            disabled={isChildrenInputDisabled} // Disable input after submission
          />
          <Button
            onClick={handleChildrenInputSubmit}
            sx={{ marginTop: 1 }}
            disabled={isChildrenInputDisabled} // Disable submit button after submission
          >
            Submit
          </Button>
        </Box>
      )}

      {/* Display max limit warning */}
      {showChildrenMaxLimitWarning && (
        <FormHelperText error>
          You cannot add more than 50 children.
        </FormHelperText>
      )}
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
                  label="RRN Number"
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
               <TextField
                margin="dense"
                label="Remarks"
                fullWidth
                variant="outlined"
                name="remark"
                value={newBooking.remark}
                onChange={handleChange}
                error={!!errors.remark}
                helperText={errors.remark}
              />
            </DialogContent>

            <DialogActions>
              <Button
                onClick={handleClose}
                variant="contained"
                style={{ background: "#686D76", textTransform: "none" }}
              >
                Cancel
              </Button>
              {/* <Button
                onClick={handleSaveClick}
                variant="contained"
                style={{ background: "#867AE9", textTransform: "none" }}
              >
                Save
              </Button> */}

          <Button
                    onClick={handleSaveClick}
                    variant="contained"
                    style={{ background: isSaving ? "#ccc" : "#867AE9", textTransform: "none" }}
                    disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save"}
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
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                          Ref Source
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            {currentBooking.source}
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
                            Reservation Date
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            {new Date(
                              currentBooking.bookingDate
                            )?.toLocaleDateString("en-GB")}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            Booking Date
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            {new Date(
                              currentBooking.createdAt
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
                            {currentBooking?.planId?.title}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            Sub Package
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            {
                              currentBooking?.selectedSubPackage?.name
                            }
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            Adult Price
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            ₹{currentBooking?.adultPrice}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            Children Price
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                            ₹{currentBooking?.childrenPrice}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            Total Price
                          </TableCell>
                          <TableCell style={{ backgroundColor: "#e0e0e0" }}>
                            ₹{currentBooking?.totalAmount}
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
                            {currentBooking?.paymentMethod
                              ? currentBooking?.paymentMethod
                              : "Online Booking"}
                          </TableCell>
                        </TableRow>
                        {currentBooking.upiId && (
                          <TableRow>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              UPI ID
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              {currentBooking?.upiId}
                            </TableCell>
                          </TableRow>
                        )}

                        {currentBooking.creditCardNumber && (
                          <TableRow>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              RRN Number
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              {currentBooking?.creditCardNumber}
                            </TableCell>
                          </TableRow>
                        )}
                         {currentBooking.paymentId && (
                          <TableRow>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              Payment ID
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              {currentBooking?.paymentId}
                            </TableCell>
                          </TableRow>
                        )}

                        {currentBooking.referenceId && (
                          <TableRow>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              Reference ID/Room Number
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              {currentBooking?.referenceId}
                            </TableCell>
                          </TableRow>
                        )}

                        {currentBooking.complementaryPerson && (
                          <TableRow>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              Approved By
                            </TableCell>
                            <TableCell style={{ backgroundColor: "#f5f5f5" }}>
                              {currentBooking?.complementaryPerson}
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
                                ? currentBooking?.bookingViaPerson
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
