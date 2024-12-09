import React, { useState, useEffect, useContext } from "react";
import { Typography, Chip ,IconButton} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import endpoints from "../Endpoints/endpoint";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Ticket.css";
// import { AdminProfileContext } from "../contexts/AdminContext";
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import DirectionsIcon from '@mui/icons-material/Directions';


const Ticket = () => {
//   const { adminProfile } = useContext(AdminProfileContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [qrCodeURL, setQRCodeURL] = useState("");
  const [plansTitle, setPlansTitle] = useState("");
  const [timing, setTiming] = useState("");
  const [subpackageName, setSubpackageName] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [gst, setGst] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [adultActivities, setAdultActivities] = useState([]);
  const [childActivities, setChildActivities] = useState([]);
  const [showChildActivities, setShowChildActivities] = useState(false);
  const [userData, setUserData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [pdfData, setPdfData] = useState(null);
console.log("userData",userData);

  //google map
  const handleGetDirections = () => {
    window.open("https://www.google.com/maps/dir/?api=1&destination=Bharti+Resorts+Water+Adventure+%26+Amusement+Park", "_blank");
  };

  const fetchBookingData = () => {
    const booking = location.state?.booking;
    const user = location.state?.userData || {};
    const { currentBooking } = location.state || {};
    console.log("currentBooking",currentBooking);
    
    if (booking) {
      setBookingData(booking);
      setUserData(user);

      setLoading(false);
    } else {
      setLoading(false);
      navigate("/");
    }
  };

  const fetchPlans = async () => {
    if (bookingData) {
      try {
        const response = await axios.get(
          `${endpoints.serverBaseURL}/api/plan/${bookingData.planId}`
        );
        const planData = response.data.plan;
        setPlansTitle(planData.title);
        setTiming(planData.timing);

        const subpackage = bookingData.selectedSubPackage;
        console.log("selected subpackage is ",subpackage);
        

        if (subpackage) {
          setSubpackageName(subpackage.name);
          setAdultActivities(subpackage.adult_activities || []);
          setChildActivities(subpackage.child_activities || []);

          setShowChildActivities(subpackage.child_activities && subpackage.child_activities.length > 0);

          // Calculate subtotal, GST, and total amount
          const subtotal =
            subpackage.adult_price * bookingData.adult +
            subpackage.child_price * bookingData.children;
          const gst = subtotal * 0.18;
          const totalAmount = subtotal + gst;

          setSubtotal(subtotal);
          setGst(gst);
          setTotalAmount(totalAmount);
        } else {
          console.error(
            "No matching subpackage found for planTitle:",
            bookingData.planTitle
          );
        }
      } catch (error) {
        console.error("Error fetching plans", error);
      }
    }
  };

  const fetchQRCodeURL = async () => {
    try {
      const response = await axios.post(
        `${endpoints.serverBaseURL}/api/generateqr`,
        { text: bookingData._id }
      );
      setQRCodeURL(response.data.qrCodeURL);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching QR code Base64 data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingData();
  }, [location.state?.booking]);

  useEffect(() => {
    if (bookingData) {
      fetchQRCodeURL();
      fetchPlans();
    }
  }, [bookingData]);

  const handleDownloadPDF = async () => {
    const ticketElement = document.getElementById("ticket-container");

    if (!ticketElement) {
      console.error("Element with ID 'ticket-container' not found");
      return;
    }

    html2canvas(ticketElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);
      const imgWidth = canvasWidth * ratio;
      const imgHeight = canvasHeight * ratio;
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      
      // Saving the PDF to state
      const pdfBlob = pdf.output("blob");
      setPdfData(pdfBlob);
      pdf.save("Bharti_Resort-ticket.pdf");
    });
  };

 const sendPdfToServer = async () => {
  try {
    const ticketElement = document.getElementById("ticket-container");

    if (!ticketElement) {
      console.error("Element with ID 'ticket-container' not found");
      return;
    }

    // Convert the PDF to an image using html2canvas
    const canvas = await html2canvas(ticketElement, { scale: 2 });
    const imageBlob = await new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/png")
    );

    // Prepare FormData with the image and phone number
    const formData = new FormData();
    formData.append("image", imageBlob, "ticket.png");

    if (userData?.phone || plansTitle || subpackageName) {
      formData.append("phone", userData.phone);
      formData.append("Plan", plansTitle)
      formData.append("subpackage",subpackageName)
      formData.append("Total amount",totalAmount)
      formData.append("Date", formattedDate)
      formData.append("Booking ID",bookingData._id)
    } else {
      console.error("Phone number is not available");
    }

    // Send the image to the server
    const response = await axios.post("http://localhost:5000/api/receive-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Response from server:", response);

    if (response.status === 200) {
      alert("Image sent to the server successfully.");
    } else {
      console.error("Error sending image:", response);
    }
  } catch (error) {
    console.error("Error in sending image to server:", error.message);
    alert("Failed to send the image to the server.");
  }
};
  
  useEffect(() => {
    if (!loading && bookingData) {
      setTimeout(() => {
        handleDownloadPDF();
      }, 1000);
    }
  }, [loading, bookingData]);

  if (loading) {
    return <div>Loading...</div>;
  }
 
  const formattedDate = selectedDate
  ? selectedDate.toISOString().substring(0, 10) // Format selected date
  : bookingData?.bookingDate
  ? bookingData.bookingDate.substring(0, 10)
  : new Date().toISOString().substring(0, 10); 
    console.log("B Date",formattedDate);


  return (
    <div
      className="container ticket-container-background"
      id="ticket-container"
    >
        {/* Centered QR Code */}
   
      {/* <div className="header">
        <img
          src={adminProfile?.logo}
          alt="Resort Logo"
          className="resort-logo"
        />
        <h1 className="resort-name">{adminProfile?.name}</h1>
       
      </div> */}
      <div className="qr-code-center-container">
      <img
        src={`data:image/png;base64,${qrCodeURL}`}
        alt="QR Code"
        className="qr-code-large"
      />
    </div>
      
      <div className="user-info-row">
        <div className="user-info-item">
          <div>
          <Typography variant="bold" className="bold-text">Name:</Typography>
          <Typography variant="body2">{userData?.name || "N/A"}</Typography>
          </div>
          <div>
          <Typography variant="bold" className="bold-text">Contact:</Typography>
          <Typography variant="body2">{userData?.phone || "N/A"}</Typography>
          </div>
          <div>
          <Typography variant="bold" className="bold-text">Email:</Typography>
          <Typography variant="body2">{userData?.email || "N/A"}</Typography>
          </div>
          <div>
          <Typography variant="bold" className="bold-text">Transaction ID:</Typography>
          <Typography  style={{whiteSpace:"nowrap"}} variant="body2">{bookingData?.paymentId}</Typography>
          </div>


        </div>
      </div>
  
      <div className="details-grid">
        <div className="detail-item">
          <Typography variant="bold" className="bold-text">Plan:</Typography>
          <Typography variant="body2">{plansTitle}</Typography>
        </div>
        <div className="detail-item">
          <Typography variant="bold" className="bold-text">Subpackage:</Typography>
          <Typography variant="body2">{subpackageName}</Typography>
        </div>
        <div className="detail-item">
          <Typography variant="bold" className="bold-text">Adults:</Typography>
          <Typography variant="body2">{bookingData?.adult}</Typography>
        </div>
        <div className="detail-item">
          <Typography variant="bold" className="bold-text">Children:</Typography>
          <Typography variant="body2">{bookingData?.children}</Typography>
        </div>
        <div className="detail-item">
          <Typography variant="bold" className="bold-text">Subtotal:</Typography>
          <Typography variant="body2">₹{subtotal.toFixed(2)}</Typography>
        </div>
        <div className="detail-item">
          <Typography variant="bold" className="bold-text">GST:</Typography>
          <Typography variant="body2">₹{gst.toFixed(2)}</Typography>
        </div>
        <div className="detail-item">
          <Typography variant="bold" className="bold-text">Total Amount:</Typography>
          <Typography variant="body2">₹{totalAmount.toFixed(2)}</Typography>
        </div>
        
      

        
        <div className="detail-item">
          <Typography variant="bold" className="bold-text">Timing:</Typography>
          <Typography variant="body2">{timing.fromtime &&
                  timing.fromperiod &&
                  timing.totime &&
                  timing.toperiod ? (
                    <span>
                      {timing.fromtime} {timing.fromperiod} - {timing.totime}{" "}
                      {timing.toperiod}
                    </span>
                  ) : (
                    <span>No timing information available</span>
                  )}</Typography>
        </div>
        <div className="detail-item">
          <Typography variant="bold" className="bold-text">Booking Date:</Typography>
          <Typography variant="body2">{formattedDate}</Typography>
        </div>
        <div className="detail-item">
    <Typography variant="bold" className="bold-text">Booking ID:</Typography>
    <Typography variant="body2">{bookingData._id}</Typography>
  </div>
      </div>
  
      <div className="download-button-container">
        <button className="download-button" onClick={handleDownloadPDF}>
          Download Ticket
        </button>

        <button onClick={sendPdfToServer}>Send Ticket to What's App</button>
      </div>
    </div>
  );
};

export default Ticket;

