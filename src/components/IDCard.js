// import React from "react";
// import { Box, Typography, Button } from "@mui/material";
// import QRCode from "qrcode.react";

// const IDCard = ({ student, onPrint }) => {
//     const formatDate = (dateString) => {
//         const options = { year: "numeric", month: "short", day: "numeric" };
//         return new Date(dateString).toLocaleDateString(undefined, options);
//       };
      
//       const calculateEndDate = (dateString) => {
//         const enrollmentDate = new Date(dateString);
//         enrollmentDate.setMonth(enrollmentDate.getMonth() + 3);
//         return enrollmentDate.toISOString().split("T")[0];
//       };
      
//       const qrValue = `Student: ${student.Student_Name} | Enrollment: ${formatDate(student.Enrollment_Date)} | Valid Until: ${formatDate(calculateEndDate(student.Enrollment_Date))}`;
      
//       console.log("QR Code Value:", qrValue);
      
      
//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         textAlign: "center",
//         padding: 2,
//         border: "1px solid #ccc",
//         borderRadius: 2,
//         boxShadow: 3,
//         width: 300,
//         bgcolor: "background.paper",
//       }}
//     >
//       <Typography variant="h6" sx={{ mb: 1 }}>
//         Student ID Card
//       </Typography>
//       <Typography variant="body1">
//         <strong>Name:</strong> {student.Student_Name}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Email:</strong> {student.Email}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Mobile:</strong> {student.Mobile}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Enrollment Date:</strong> {formatDate(student.Enrollment_Date)}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Valid Until:</strong> {formatDate(calculateEndDate(student.Enrollment_Date))}
//       </Typography>
//       <Box sx={{ my: 2 }}>
//         {/* <QRCode
//           value={`Student: ${student.Student_Name}\nEnrollment: ${student.Enrollment_Date}\nValid Until: ${calculateEndDate(student.Enrollment_Date)}`}
//         /> */}



// <QRCode value={qrValue} />

//       </Box>
//       <Button variant="contained" onClick={onPrint}>
//         Print ID Card
//       </Button>
//     </Box>
//   );
// };

// export default IDCard;




// import React from "react";
// import { Box, Typography, Button } from "@mui/material";
// import QRCode from "qrcode.react";

// const IDCard = ({ student, onPrint }) => {
//   // Format date as MM/DD/YYYY
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const month = ("0" + (date.getMonth() + 1)).slice(-2);
//     const day = ("0" + date.getDate()).slice(-2);
//     const year = date.getFullYear();
//     return `${month}/${day}/${year}`;
//   };

//   // Calculate the end date (3 months after enrollment)
//   const calculateEndDate = (dateString) => {
//     const enrollmentDate = new Date(dateString);
//     enrollmentDate.setMonth(enrollmentDate.getMonth() + 3);
//     return enrollmentDate.toISOString().split("T")[0];
//   };

//   // Create a safe QR code value
//   const qrValue = encodeURIComponent(`Student: ${student.Student_Name} | Enrollment: ${formatDate(student.Enrollment_Date)} | Valid Until: ${formatDate(calculateEndDate(student.Enrollment_Date))}`);

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         textAlign: "center",
//         padding: 2,
//         border: "1px solid #ccc",
//         borderRadius: 2,
//         boxShadow: 3,
//         width: 300,
//         bgcolor: "background.paper",
//       }}
//     >
//       <Typography variant="h6" sx={{ mb: 1 }}>
//         Student ID Card
//       </Typography>
//       <Typography variant="body1">
//         <strong>Name:</strong> {student.Student_Name}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Email:</strong> {student.Email}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Mobile:</strong> {student.Mobile}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Enrollment Date:</strong> {formatDate(student.Enrollment_Date)}
//       </Typography>
//       <Typography variant="body1">
//         <strong>Valid Until:</strong> {formatDate(calculateEndDate(student.Enrollment_Date))}
//       </Typography>
//       <Box sx={{ my: 2 }}>
//         <QRCode value={qrValue} />
//       </Box>
//       <Button variant="contained" onClick={onPrint}>
//         Print ID Card
//       </Button>
//     </Box>
//   );
// };

// export default IDCard;


import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import htmlToCanvas from "html2canvas";
import { Box, Typography, Divider, Button, IconButton, Tooltip } from "@mui/material";
import QRCode from "qrcode.react";
import axios from "axios";
import endpoints from "../Endpoints/endpoint";
import { Close, WhatsApp } from "@mui/icons-material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const IDCard = ({ student, invokeExport, onExportComplete, handleCloseModal, newAdmissions }) => {
  const [isCardVisible, setIsCardVisible] = React.useState(true);
  const cardRef = useRef();
  const { name, email, mobile, enrollmentDate, endDate, id } = student;

  console.log("new Student Data:", newAdmissions);
  const formatDate = (date) => {
    if (!date) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const handleExport = async (mobileNumber) => {
    try {
      const canvas = await htmlToCanvas(cardRef.current);
      const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  
      // Create a download link and simulate a click to download the image
      const link = document.createElement("a");
      link.href = URL.createObjectURL(imageBlob);
      link.download = "id-card.png";
      link.click();
  
      // Use FormData to send the image and mobile number to backend
      const formData = new FormData();
      formData.append("image", imageBlob, "id-card.png");
      formData.append("mobile", mobileNumber);
  
      // Send to backend using axios
      const response = await axios.post(`${endpoints.serverBaseURL}/api/receive-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.status === 200) {
        alert("Image sent successfully!");
      } else {
        alert("Failed to send image.");
      }
    } catch (error) {
      console.error("Error generating or sending image:", error);
      alert("An error occurred. Please try again.");
    }
  };
  
  const handleClose = () => {
    setIsCardVisible(false);
  };

  useEffect(() => {
    if (invokeExport) {
      const { mobile } = invokeExport; // Destructure the mobile number
      handleExport(mobile).then(() => {
        if (onExportComplete) onExportComplete(); // Notify parent that export is complete
      });
    }
  }, [invokeExport, onExportComplete]);
  
  

  return (
    <>
    <IconButton
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        color: "grey",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        '&:hover': {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        },
      }}
      onClick={handleCloseModal}
    >
      <Close />
    </IconButton>
    <Box>
      
      <Box
        ref={cardRef}
        sx={{
          border: "1px solid #ddd",
          borderRadius: 2,
          padding: 2,
          width: 300,
          textAlign: "center",
          // boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {name}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="textSecondary">
          Email: {email}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Mobile: {mobile}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Enrollment Date: {formatDate(enrollmentDate)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          End Date: {formatDate(endDate)}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <QRCode
            value={JSON.stringify({
              id: id,
              student: name,
              enrollmentDate: enrollmentDate,
              endDate: endDate,
            })}
            size={128}
          />
        </Box>
      </Box>
      <Box display="flex" justifyContent="end" alignItems="center">
      {/* Other card content here */}
      <Tooltip title="Share with WhatsApp" placement="top">
        <IconButton
          variant="contained"
          sx={{
            mt: 2,
            backgroundColor: "#25D366",
            color: "white",
            '&:hover': {
              backgroundColor: "#128C7E",
              transform: "scale(1.1)",
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
            },
            borderRadius: "50px",
            padding: "8px 16px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s ease-in-out, background-color 0.2s, box-shadow 0.2s",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
          onClick={() => handleExport("9807631010")}
        >
          <WhatsAppIcon sx={{ fontSize: "1.5rem" }} />
          <Typography sx={{ fontSize: "1rem", fontWeight: "bold" }}>
            Share
          </Typography>
        </IconButton>
      </Tooltip>
    </Box>
    </Box>
    </>
  );
};


export default IDCard;
